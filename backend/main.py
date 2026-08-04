"""
main.py
FastAPI entry point for the Smackathon2k26 / Runtime-Crew donation tracker backend.
"""

from __future__ import annotations

import logging
from typing import Optional

from fastapi import FastAPI, Depends, HTTPException
from fastapi.concurrency import run_in_threadpool
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

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


class ExpenseResponse(BaseModel):
    spender: str
    amount_wei: int
    amount_eth: float
    campaign_id: str
    description: str
    receipt_url: str
    timestamp: int


# ------------------------------------------------------------ dependency

def _bridge_dependency() -> BlockchainBridge:
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
    try:
        count = await run_in_threadpool(bridge.get_total_donations_count)
        total_eth = await run_in_threadpool(bridge.get_total_amount_raised_eth)
    except Exception as exc:
        logger.exception("Failed fetching stats")
        raise HTTPException(status_code=502, detail=f"On-chain read failed: {exc}") from exc
    return StatsResponse(total_donations=count, total_raised_eth=total_eth)


@app.get("/api/donations", response_model=list[DonationResponse])
async def get_donations(bridge: BlockchainBridge = Depends(_bridge_dependency)):
    try:
        donations = await run_in_threadpool(bridge.get_all_donations)
    except Exception as exc:
        logger.exception("Failed fetching donations")
        raise HTTPException(status_code=502, detail=f"On-chain read failed: {exc}") from exc
    return [DonationResponse(**d.to_dict()) for d in donations]


@app.get("/api/campaigns/{campaign_id}", response_model=CampaignResponse)
async def get_campaign(campaign_id: str, bridge: BlockchainBridge = Depends(_bridge_dependency)):
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


@app.get("/api/campaigns/{campaign_id}/expenses", response_model=list[ExpenseResponse])
async def get_campaign_expenses(campaign_id: str, bridge: BlockchainBridge = Depends(_bridge_dependency)):
    """Fetches all logged expenses for transparency in a specific campaign."""
    try:
        expenses = await run_in_threadpool(bridge.get_campaign_expenses, campaign_id)
    except Exception as exc:
        logger.exception("Failed fetching expenses for campaign %s", campaign_id)
        raise HTTPException(status_code=502, detail=f"On-chain read failed: {exc}") from exc
    return [ExpenseResponse(**e.to_dict()) for e in expenses]


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)