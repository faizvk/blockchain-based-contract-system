# Blockchain-Based Contract & Tender Evaluation System

A full-stack decentralized application designed for secure tender submission, AI-driven bid evaluation, and blockchain-backed contract management. The system integrates artificial intelligence, distributed file storage, and Ethereum smart contracts to ensure transparency, automation, and trust in procurement workflows.

Repository:
https://github.com/faizvk/blockchain-based-contract-system

==================================================
SYSTEM ARCHITECTURE
==================================================

blockchain-based-contract-system/
│
├── backend/ Node.js + Express backend (storage, blockchain, IPFS)
├── backend1/ Python (Flask) backend – AI tender & bid analysis
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

Backend:

- Node.js
- Express
- MongoDB & Mongoose
- Multer & GridFS
- IPFS HTTP Client
- Ethers.js v5
- dotenv
- CORS

Backend1 (Automation):

- Python 3.x
- Flask
- Flask-CORS
- python-dotenv

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
- File uploads
- MongoDB & GridFS storage
- IPFS integration
- Ethereum blockchain interaction

Install:
cd backend
npm install

Run:
npm run dev

==================================================
BACKEND1 – PYTHON AI BACKEND (Flask)
==================================================

Backend1 is responsible for AI-based tender requirement parsing and bid evaluation.

API Endpoint:
POST /api/analyze-bids

Request (multipart/form-data):

- requirements: Tender requirements text
- bids: Multiple PDF files

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

Install:
cd backend1
pip install -r requirements.txt

Run:
python app.py

Server:
http://localhost:4000

==================================================
FRONTEND (React + Vite)
==================================================

Purpose:

- Tender creation UI
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

Backend (.env):
PORT=
MONGO_URI=
IPFS_API_URL=
RPC_URL=
PRIVATE_KEY=
IPFS_URL=
PINATA_JWT=
INFURA_PROVIDER=

Backend1 (.env):
GEMINI_API_KEY=

Smart Contracts (.env):
RPC_URL=
PRIVATE_KEY=

==================================================
DEVELOPMENT FLOW
==================================================

1. Start MongoDB
2. Run Node.js backend
3. Run Python backend (backend1)
4. Deploy smart contracts
5. Start frontend

==================================================
KEY FEATURES
==================================================

- AI-powered bid evaluation
- Secure PDF handling
- IPFS-based document storage
- Ethereum smart contracts
- Modular multi-backend architecture
- Transparent procurement workflow

==================================================
LICENSE
==================================================

ISC License

==================================================
AUTHOR
==================================================

Faiz VK
