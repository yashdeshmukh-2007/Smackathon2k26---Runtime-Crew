"""
blockchain_bridge.py
Web3 <-> FastAPI bridge for Smackathon2k26 / Runtime-Crew Decentralized Donation Tracker.

Responsibilities:
    - Load the compiled contract ABI + deployed address (Hardhat artifact).
    - Maintain a single Web3 connection (HTTP provider) to a local Hardhat
      node or any RPC endpoint (Infura/Alchemy/Anvil/etc.) via .env.
    - Expose typed, synchronous read-helpers around the DonationTracker
      contract (donations, totals, campaign lookups).
    - Provide a lightweight event syncer that can be wired into a background
      task / cron / Celery worker to mirror on-chain events into an
      off-chain database (SQLAlchemy) for fast querying and pagination.

Design note: web3.py's HTTPProvider is blocking under the hood, so every
method on BlockchainBridge is a plain synchronous call. FastAPI route
handlers in main.py wrap these calls with `run_in_threadpool` so the async
event loop is never blocked by an RPC round-trip.
"""

from __future__ import annotations

import json
import logging
import os
from dataclasses import dataclass, asdict
from pathlib import Path
from typing import Optional

from dotenv import load_dotenv
from web3 import Web3
from web3.exceptions import ContractLogicError, BadFunctionCallOutput

# web3.py renamed its PoA middleware between v6 and v7; support both so this
# file works regardless of exactly which v6+ patch the project pins.
try:
    from web3.middleware import geth_poa_middleware as poa_middleware
except ImportError:  # pragma: no cover - depends on installed web3.py version
    from web3.middleware import ExtraDataToPOAMiddleware as poa_middleware

load_dotenv()

logger = logging.getLogger("blockchain_bridge")
logging.basicConfig(level=logging.INFO)

# --------------------------------------------------------------------------
# Configuration
# --------------------------------------------------------------------------

# backend/blockchain_bridge.py -> repo root is two levels up.
BASE_DIR = Path(__file__).resolve().parent.parent
ARTIFACT_PATH = (
    BASE_DIR / "contracts" / "artifacts" / "contracts" / "DonationTracker.sol" / "DonationTracker.json"
)

RPC_URL = os.getenv("RPC_URL", "http://127.0.0.1:8545")
CONTRACT_ADDRESS = os.getenv("CONTRACT_ADDRESS")
EVENT_POLL_BLOCK_RANGE = int(os.getenv("EVENT_POLL_BLOCK_RANGE", "2000"))


class BridgeConfigError(RuntimeError):
    """Raised when the bridge cannot be configured (missing artifact, bad address, etc.)."""


class BridgeConnectionError(RuntimeError):
    """Raised when the configured RPC endpoint is unreachable."""


# --------------------------------------------------------------------------
# Data shapes returned to the API layer
# --------------------------------------------------------------------------

@dataclass
class Donation:
    donor: str
    amount_wei: int
    amount_eth: float
    campaign_id: str
    timestamp: int
    donation_id: Optional[int] = None

    def to_dict(self) -> dict:
        return asdict(self)


@dataclass
class CampaignStats:
    campaign_id: str
    total_raised_eth: float
    exists: bool


@dataclass
class Expense:
    spender: str
    amount_wei: int
    amount_eth: float
    campaign_id: str
    description: str
    receipt_url: str
    timestamp: int

    def to_dict(self) -> dict:
        return asdict(self)


# --------------------------------------------------------------------------
# Bridge
# --------------------------------------------------------------------------

class BlockchainBridge:
    """
    Thin wrapper around a single DonationTracker contract instance.

    Instantiate once (see the `get_bridge()` singleton below) and reuse it
    across requests so the process holds a single Web3 connection.
    """

    def __init__(
        self,
        rpc_url: str = RPC_URL,
        contract_address: Optional[str] = CONTRACT_ADDRESS,
        artifact_path: Path = ARTIFACT_PATH,
    ):
        self.rpc_url = rpc_url
        self.artifact_path = artifact_path
        self._abi = self._load_abi()
        self.w3 = self._connect(rpc_url)

        if not contract_address:
            raise BridgeConfigError(
                "CONTRACT_ADDRESS is not set. Add it to backend/.env "
                "(the address printed by your Hardhat deploy script)."
            )
        self.contract_address = Web3.to_checksum_address(contract_address)
        self.contract = self.w3.eth.contract(address=self.contract_address, abi=self._abi)

        # In-memory cache for campaign existence checks (campaignId -> bool).
        # Swap this dict for a SQLAlchemy-backed table if you need it to
        # survive restarts or be shared across multiple backend workers.
        self._campaign_cache: dict[str, bool] = {}
        self._last_synced_block: Optional[int] = None

    # ---------------------------------------------------------------- setup

    def _load_abi(self) -> list:
        if not self.artifact_path.exists():
            raise BridgeConfigError(
                f"Hardhat artifact not found at {self.artifact_path}. "
                "Run `npx hardhat compile` in /contracts first."
            )
        try:
            with open(self.artifact_path, "r", encoding="utf-8") as f:
                artifact = json.load(f)
        except json.JSONDecodeError as exc:
            raise BridgeConfigError(f"Malformed artifact JSON at {self.artifact_path}: {exc}") from exc

        abi = artifact.get("abi")
        if not abi:
            raise BridgeConfigError(f"No 'abi' field found in artifact {self.artifact_path}")
        return abi

    def _connect(self, rpc_url: str) -> Web3:
        w3 = Web3(Web3.HTTPProvider(rpc_url, request_kwargs={"timeout": 10}))
        # Harmless on Hardhat/most L1s; required on PoA chains (e.g. Polygon).
        try:
            w3.middleware_onion.inject(poa_middleware, layer=0)
        except ValueError:
            pass  # already injected, e.g. if a bridge is re-created in tests

        try:
            connected = w3.is_connected()
        except Exception as exc:
            raise BridgeConnectionError(
                f"RPC connection check failed for {rpc_url}: {exc}. "
                "Is your Hardhat node / RPC provider running?"
            ) from exc

        if not connected:
            raise BridgeConnectionError(f"Could not connect to RPC endpoint at {rpc_url}")

        logger.info("Connected to RPC %s (chain_id=%s)", rpc_url, w3.eth.chain_id)
        return w3

    # ------------------------------------------------------------ read API

    def get_total_donations_count(self) -> int:
        """Returns the total number of donations ever recorded on-chain."""
        try:
            return self.contract.functions.getDonationsCount().call()
        except (ContractLogicError, BadFunctionCallOutput) as exc:
            logger.error("getDonationsCount() failed: %s", exc)
            raise

    def get_total_amount_raised_eth(self) -> float:
        """Returns totalAmountRaised() converted from wei to Ether."""
        wei = self.contract.functions.totalAmountRaised().call()
        return float(Web3.from_wei(wei, "ether"))

    def get_donation_by_index(self, index: int) -> Donation:
        """
        Fetches a single donation by its on-chain index and returns it as a
        typed `Donation`. Raises IndexError if the index is out of range.
        """
        count = self.get_total_donations_count()
        if index < 0 or index >= count:
            raise IndexError(f"Donation index {index} out of range (0..{count - 1})")

        donor, amount, campaign_id, timestamp = self.contract.functions.getDonation(index).call()
        return Donation(
            donor=donor,
            amount_wei=amount,
            amount_eth=float(Web3.from_wei(amount, "ether")),
            campaign_id=campaign_id,
            timestamp=timestamp,
            donation_id=index,
        )

    def get_all_donations(self) -> list[Donation]:
        """
        Convenience method: calls getDonation(i) for every i in range(count).
        """
        return [self.get_donation_by_index(i) for i in range(self.get_total_donations_count())]

    def get_campaign_total_eth(self, campaign_id: str) -> float:
        """Returns getTotalRaisedForCampaign(campaign_id) converted to Ether."""
        wei = self.contract.functions.getTotalRaisedForCampaign(campaign_id).call()
        return float(Web3.from_wei(wei, "ether"))

    def get_campaign_expenses(self, campaign_id: str) -> list[Expense]:
        """Fetches all transparency expenses logged for a specific campaign."""
        try:
            # Get all expense IDs for this campaign
            expense_ids = self.contract.functions.getCampaignExpenseIds(campaign_id).call()
            expenses_list = []
            
            # Fetch individual expense details
            for exp_id in expense_ids:
                expense = self.contract.functions.getExpense(exp_id).call()
                expenses_list.append(Expense(
                    spender=expense[0],
                    amount_wei=expense[1],
                    amount_eth=float(self.w3.from_wei(expense[1], 'ether')),
                    campaign_id=expense[2],
                    description=expense[3],
                    receipt_url=expense[4],
                    timestamp=expense[5]
                ))
                
            return expenses_list
        except (ContractLogicError, BadFunctionCallOutput) as exc:
            logger.error("getCampaignExpenseIds failed for %s: %s", campaign_id, exc)
            raise

    # -------------------------------------------------------- campaign mgmt

    def campaign_exists(self, campaign_id: str, use_cache: bool = True) -> bool:
        """
        Checks whether `campaign_id` has been registered on-chain, so the
        frontend can be told "unknown campaign" *before* a user signs and
        pays gas for a `recordDonation` transaction that would otherwise
        revert against an unregistered campaign.
        """
        if use_cache and campaign_id in self._campaign_cache:
            return self._campaign_cache[campaign_id]

        campaign_hash = Web3.keccak(text=campaign_id)
        event = self.contract.events.CampaignRegistered()
        logs = event.get_logs(
            from_block=0,
            to_block="latest",
            argument_filters={"campaignHash": campaign_hash},
        )
        exists = len(logs) > 0
        self._campaign_cache[campaign_id] = exists
        return exists

    def get_campaign_stats(self, campaign_id: str) -> CampaignStats:
        """Bundles the existence check + on-chain total for a single campaign_id."""
        exists = self.campaign_exists(campaign_id)
        total = self.get_campaign_total_eth(campaign_id) if exists else 0.0
        return CampaignStats(campaign_id=campaign_id, total_raised_eth=total, exists=exists)

    # ------------------------------------------------------------- syncing

    def sync_latest_events(
        self,
        from_block: Optional[int] = None,
        to_block: "str | int" = "latest",
    ) -> list[Donation]:
        """
        Polls for `DonationRecorded` events between `from_block` and
        `to_block`, returning them as typed `Donation` objects.
        """
        if from_block is None:
            from_block = max(0, self.w3.eth.block_number - EVENT_POLL_BLOCK_RANGE)

        event = self.contract.events.DonationRecorded()
        logs = event.get_logs(from_block=from_block, to_block=to_block)

        donations: list[Donation] = []
        for log in logs:
            args = log["args"]
            donations.append(
                Donation(
                    donor=args["donor"],
                    amount_wei=args["amount"],
                    amount_eth=float(Web3.from_wei(args["amount"], "ether")),
                    campaign_id=args["campaignId"],
                    timestamp=args["timestamp"],
                    donation_id=args.get("donationId"),
                )
            )
            logger.info(
                "Synced DonationRecorded: donor=%s campaign=%s amount_wei=%s block=%s",
                args["donor"], args["campaignId"], args["amount"], log["blockNumber"],
            )

        self._last_synced_block = self.w3.eth.block_number
        return donations

    @property
    def last_synced_block(self) -> Optional[int]:
        return self._last_synced_block


# --------------------------------------------------------------------------
# Singleton accessor (so FastAPI routes share one Web3 connection/contract)
# --------------------------------------------------------------------------

_bridge_instance: Optional[BlockchainBridge] = None


def get_bridge() -> BlockchainBridge:
    """
    Lazily constructs and caches a single `BlockchainBridge` instance.
    FastAPI routes should depend on this (`Depends(get_bridge)`) rather than
    instantiating the class directly, so every request reuses one Web3
    connection and one contract instance.
    """
    global _bridge_instance
    if _bridge_instance is None:
        _bridge_instance = BlockchainBridge()
    return _bridge_instance
