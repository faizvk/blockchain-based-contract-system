const { ethers } = require("ethers");
require("dotenv").config();

const rpc = process.env.RPC_URL || process.env.PROVIDER || process.env.INFURA_PROVIDER;
if (!rpc) {
  throw new Error("RPC_URL / PROVIDER / INFURA_PROVIDER must be set in .env");
}
if (!process.env.PRIVATE_KEY) {
  throw new Error("PRIVATE_KEY must be set in .env");
}

const provider = new ethers.providers.JsonRpcProvider(rpc);
const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);

module.exports = {
  provider,
  wallet,
};
