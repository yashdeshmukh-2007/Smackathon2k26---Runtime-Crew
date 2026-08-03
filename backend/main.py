"""
main.py
FastAPI entry point for the Smackathon2k26 / Runtime-Crew donation tracker backend.

Exposes read-only endpoints backed by `blockchain_bridge.BlockchainBridge`.
All Web3 calls are synchronous under the hood, so route handlers offload
them to FastAPI's threadpool via `run_in_threadpool` to avoid blocking the
event loop on RPC round-trips.

Run locally with:
    uvicorn main:app --reload --port 8000
"""

from __future__ import annotations

import logging

from fastapi import FastAPI, Depends, HTTPException
from fastapi.concurrency import run_in_threadpool
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional

from blockchain_bridge import (
    BlockchainBridge,
    BridgeConfigError,
    BridgeConnectionError,
    get_bridge,
)

logger = logging.getLogger("main")
logging.basicConfig(level=logging.INFO)

app = FastAPI(
    title="Runtime-Crew Donation Tracker API",
    description="Read-only bridge between DonationTracker.sol and the DonorDashboard React frontend.",
    version="0.1.0",
)

# Adjust/extend this list for your deployed frontend origin(s) in production.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ---------------------------------------------------------------- schemas

class StatsResponse(BaseModel):
    total_donations: int
    total_raised_eth: float


class DonationResponse(BaseModel):
    donation_id: Optional[int] = None
    donor: str
    campaign_id: str
    amount_wei: int
    amount_eth: float
    timestamp: int


class CampaignResponse(BaseModel):
    campaign_id: str
    exists: bool
    total_raised_eth: float


# ------------------------------------------------------------ dependency

def _bridge_dependency() -> BlockchainBridge:
    """
    Wraps `get_bridge()` so a missing artifact, missing CONTRACT_ADDRESS, or
    unreachable RPC surfaces as a clean HTTP 503 instead of a raw traceback
    on the first request that touches the chain.
    """
    try:
        return get_bridge()
    except (BridgeConfigError, BridgeConnectionError) as exc:
        logger.error("Bridge unavailable: %s", exc)
        raise HTTPException(status_code=503, detail=str(exc)) from exc


# --------------------------------------------------------------- routes

@app.get("/health")
async def health():
    return {"status": "ok"}


@app.get("/api/stats", response_model=StatsResponse)
async def get_stats(bridge: BlockchainBridge = Depends(_bridge_dependency)):
    """Overall totals across every campaign: donation count + Ether raised."""
    try:
        count = await run_in_threadpool(bridge.get_total_donations_count)
        total_eth = await run_in_threadpool(bridge.get_total_amount_raised_eth)
    except Exception as exc:
        logger.exception("Failed fetching stats")
        raise HTTPException(status_code=502, detail=f"On-chain read failed: {exc}") from exc
    return StatsResponse(total_donations=count, total_raised_eth=total_eth)


@app.get("/api/donations", response_model=list[DonationResponse])
async def get_donations(bridge: BlockchainBridge = Depends(_bridge_dependency)):
    """
    Full list of on-chain donations, oldest to newest.

    Demo/hackathon scale only (O(n) RPC calls, one per donation). For
    production, back this route with an off-chain SQLAlchemy table that a
    background task keeps in sync via `bridge.sync_latest_events()`, and add
    `?limit=&offset=` pagination once you're reading from that table
    instead of the chain directly.
    """
    try:
        donations = await run_in_threadpool(bridge.get_all_donations)
    except Exception as exc:
        logger.exception("Failed fetching donations")
        raise HTTPException(status_code=502, detail=f"On-chain read failed: {exc}") from exc
    return [DonationResponse(**d.to_dict()) for d in donations]


@app.get("/api/campaigns/{campaign_id}", response_model=CampaignResponse)
async def get_campaign(campaign_id: str, bridge: BlockchainBridge = Depends(_bridge_dependency)):
    """
    On-chain existence + total raised for a single campaign.

    The frontend should call this before submitting a `recordDonation`
    transaction so users don't pay gas for a tx that would revert against
    an unregistered campaign id.
    """
    try:
        stats = await run_in_threadpool(bridge.get_campaign_stats, campaign_id)
    except Exception as exc:
        logger.exception("Failed fetching campaign %s", campaign_id)
        raise HTTPException(status_code=502, detail=f"On-chain read failed: {exc}") from exc

    if not stats.exists:
        raise HTTPException(status_code=404, detail=f"Campaign '{campaign_id}' is not registered on-chain")

    return CampaignResponse(
        campaign_id=stats.campaign_id,
        exists=stats.exists,
        total_raised_eth=stats.total_raised_eth,
    )


# ------------------------------------------------------------------ run

if __name__ == "__main__":
    import uvicorn

    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
