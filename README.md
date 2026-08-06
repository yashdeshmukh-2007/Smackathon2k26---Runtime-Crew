# 🚀 Runtime-Crew Donation Tracker

> **Smackathon 2026 Submission**  
> A transparent, decentralized donation management platform built to bridge on-chain trust with off-chain usability.

---

## 📌 Overview

Traditional donation systems often leave donors wondering where their money actually goes. **Runtime-Crew Donation Tracker** solves this by routing contributions directly through smart contracts on the Ethereum network—ensuring funds go straight to registered campaign beneficiaries without middleman interference or hidden fees.

We built this project to balance two core needs:
1. **Uncompromised Transparency:** On-chain campaign registration and direct-forwarding donation accounting.
2. **Seamless UX:** A fast, responsive frontend paired with a non-blocking FastAPI bridge so users don't have to wait on slow RPC round-trips just to view stats.

---

## 🛠️ Architecture at a Glance

The project is split into three clean, independent modules:
Easter egg
```text
Smackathon2k26---Runtime-Crew/
├── contracts/      # Solidity contracts, Hardhat tests, and deployment scripts
├── backend/        # FastAPI + Web3.py bridge for querying on-chain data
└── frontend/       # React dashboard powered by Ethers.js v6
