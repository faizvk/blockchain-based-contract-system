const express = require("express");
const router = express.Router();
const { ethers } = require("ethers");
const logger = require("../utils/logger");
require("dotenv").config();

if (process.env.INFURA_PROVIDER) {
  const provider = new ethers.providers.JsonRpcProvider(
    process.env.INFURA_PROVIDER
  );
  provider
    .getNetwork()
    .then((network) => logger.info("Connected to network:", network.name))
    .catch((error) => logger.error("Error getting network:", error.message));
}

module.exports = router;
