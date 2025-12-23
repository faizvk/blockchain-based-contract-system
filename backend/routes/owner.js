const express = require("express");
const router = express.Router();
const { ethers } = require("ethers");
require("dotenv").config();
const fs = require("fs");

// Blockchain setup
const provider = new ethers.providers.JsonRpcProvider(
  process.env.INFURA_PROVIDER
);

provider
  .getNetwork()
  .then((network) => {
    console.log("Connected to network:", network);
  })
  .catch((error) => {
    console.error("Error getting network:", error);
  });

module.exports = router;
