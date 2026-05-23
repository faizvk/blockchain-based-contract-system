const Wallet = require("../models/Wallet.model");
const { isEthAddress } = require("../utils/validators");

exports.storeWallet = async (req, res) => {
  try {
    const { walletAddress } = req.body;
    if (!isEthAddress(walletAddress)) {
      return res.status(400).json({ error: "Valid Ethereum wallet address required" });
    }

    let wallet = await Wallet.findOne({ walletAddress });
    if (!wallet) {
      wallet = new Wallet({ walletAddress });
      await wallet.save();
    }

    res.json({ message: "Wallet stored", wallet });
  } catch (error) {
    res.status(500).json({ error: "Failed to store wallet" });
  }
};

exports.getWallets = async (req, res) => {
  try {
    const wallets = await Wallet.find();
    res.json({ wallets });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch wallets" });
  }
};
