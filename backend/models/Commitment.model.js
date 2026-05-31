const mongoose = require("mongoose");

const commitmentSchema = new mongoose.Schema(
  {
    contractAddress: {
      type: String,
      required: true,
      index: true,
      lowercase: true,
      trim: true,
    },
    offeror: {
      type: String,
      required: true,
      index: true,
      lowercase: true,
      trim: true,
    },
    commitmentHash: { type: String, required: true },
    username: { type: String, trim: true },
    ipfsHash: { type: String, required: true, trim: true },
  },
  { timestamps: true }
);

// One commitment per (contract, offeror) — matches the on-chain invariant.
commitmentSchema.index({ contractAddress: 1, offeror: 1 }, { unique: true });

module.exports = mongoose.model("Commitment", commitmentSchema);
