# Blockchain-Based Contract & Tender Evaluation System

A full-stack decentralized application designed for secure tender submission, **AI-driven bid evaluation using Google Gemini**, and blockchain-backed contract management. The system integrates artificial intelligence, distributed file storage, and Ethereum smart contracts to ensure transparency, automation, and trust in procurement workflows.

Repository:  
https://github.com/faizvk/blockchain-based-contract-system

==================================================
SYSTEM ARCHITECTURE
==================================================

blockchain-based-contract-system/
│
├── backend/ Node.js + Express backend (API, AI, storage, blockchain, IPFS)
├── frontend/ React + Vite frontend
├── smart_contracts/ Ethereum smart contracts (Hardhat)
└── README.md

==================================================
TECHNOLOGY STACK
==================================================

Frontend:

- React 19
- Vite
- Axios
- React Router DOM
- Ethers.js v6
- React Hot Toast

Backend (Unified):

- Node.js
- Express
- MongoDB & Mongoose
- Multer & GridFS
- Google Gemini (`@google/genai`)
- IPFS HTTP Client
- Ethers.js v5
- dotenv
- CORS

Smart Contracts:

- Solidity
- Hardhat
- Ethereum Waffle
- Chai
- dotenv

==================================================
BACKEND (Node.js / Express)
==================================================

Purpose:

- API services
- Secure file uploads (PDF bids)
- MongoDB & GridFS storage
- IPFS document pinning
- Ethereum blockchain interaction
- AI-powered tender & bid evaluation using Google Gemini

Key AI Endpoint:

POST /api/analyze-bids

Request (multipart/form-data):

- requirements: Tender requirements text
- bids: Multiple PDF bid documents

Response Example:
{
"success": true,
"data": {
"requirements": {},
"bestBid": {
"filename": "bid1.pdf"
},
"qualifiedBids": 3
}
}

This endpoint fully replaces the previous Flask-based AI service and is frontend-compatible without changes.

Install:
cd backend
npm install

Run:
npm run dev

Server:
http://localhost:5000

==================================================
AI BID EVALUATION (Google Gemini)
==================================================

AI-powered tender analysis is now natively integrated into the Node.js backend.

Features:

- Direct PDF ingestion by Gemini (no local PDF parsing dependencies)
- Tender requirement extraction
- Bid specification comparison
- Automatic best-bid selection
- Structured JSON output for frontend consumption

Benefits of the Unified Backend:

- No inter-backend communication overhead
- No Python runtime dependency
- Simplified deployment
- Reduced system complexity
- Future-proof AI integration

==================================================
FRONTEND (React + Vite)
==================================================

Purpose:

- Tender creation and management UI
- Bid uploads
- AI evaluation result display
- Blockchain wallet interaction

Install:
cd frontend
npm install

Run:
npm run dev

==================================================
SMART CONTRACTS (Ethereum / Hardhat)
==================================================

Purpose:

- Immutable contract records
- Transparent tender execution
- Trustless enforcement

Install:
cd smart_contracts
npm install

Test:
npm test

Deploy (local):
npm run deploy

==================================================
ENVIRONMENT VARIABLES
==================================================

Backend (backend/.env):
PORT=
MONGO_URI=
IPFS_API_URL=
RPC_URL=
PRIVATE_KEY=
IPFS_URL=
PINATA_JWT=
INFURA_PROVIDER=
GEMINI_API_KEY=

Smart Contracts (smart_contracts/.env):
RPC_URL=
PRIVATE_KEY=

==================================================
DEVELOPMENT FLOW
==================================================

1. Start MongoDB
2. Run Node.js backend (includes AI analysis)
3. Deploy smart contracts
4. Start frontend

==================================================
KEY FEATURES
==================================================

- AI-powered bid evaluation using Google Gemini
- Secure PDF handling with GridFS
- IPFS-based document storage
- Ethereum smart contracts for trustless execution
- Unified backend architecture
- Transparent and automated procurement workflow

==================================================
LICENSE
==================================================

ISC License

==================================================
AUTHOR
==================================================

Faiz VK
