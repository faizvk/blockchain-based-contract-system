const Wallet = require("../models/Wallet.model");
const logger = require("../utils/logger");
const { isEthAddress } = require("../utils/validators");

exports.storeWallet = async (req, res) => {
  try {
    const { walletAddress } = req.body;
    if (!isEthAddress(walletAddress)) {
      return res.status(400).json({ error: "Valid Ethereum wallet address required" });
    }

    // Normalize to lowercase so we never create duplicates that only
    // differ in checksum casing.
    const normalized = walletAddress.toLowerCase();

    let wallet = await Wallet.findOne({ walletAddress: normalized });
    if (!wallet) {
      wallet = new Wallet({ walletAddress: normalized });
      try {
        await wallet.save();
      } catch (err) {
        // Concurrent race — unique index trips on second writer.
        if (err?.code === 11000) {
          wallet = await Wallet.findOne({ walletAddress: normalized });
        } else {
          throw err;
        }
      }
    }

    res.json({ message: "Wallet stored", wallet });
  } catch (error) {
    logger.error("storeWallet:", error.message);
    res.status(500).json({ error: "Failed to store wallet" });
  }
};

exports.getWallets = async (req, res) => {
  try {
    const wallets = await Wallet.find().lean();
    res.json({ wallets });
  } catch (error) {
    logger.error("getWallets:", error.message);
    res.status(500).json({ error: "Failed to fetch wallets" });
  }
};
