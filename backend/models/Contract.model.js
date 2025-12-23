const mongoose = require("mongoose");

const contractSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    description: { type: String, required: true },

    contractAddress: { type: String, index: true },
    cid: String,

    totalBudget: Number,
    minimumBid: Number,
    safetyDepositAmount: Number,

    unlockDuration: Number,
    gracePeriod: Number,
    contractDuration: Number,

    unlockTime: Number,
    gracePeriodEnd: Number,
    startTime: { type: Number, default: 0 },

    unlockDurationDays: Number,
    gracePeriodDays: Number,
    contractDurationDays: Number,
  },
  { timestamps: true }
);

module.exports = mongoose.model("Contract", contractSchema);
