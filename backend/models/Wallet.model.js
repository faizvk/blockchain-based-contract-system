const mongoose = require("mongoose");

const walletSchema = new mongoose.Schema(
  {
    walletAddress: { type: String, required: true, unique: true },
    connectedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Wallet", walletSchema);
