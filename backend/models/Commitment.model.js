const mongoose = require("mongoose");

const commitmentSchema = new mongoose.Schema(
  {
    contractAddress: { type: String, required: true, index: true },
    offeror: { type: String, required: true, index: true },
    commitmentHash: { type: String, required: true },
    username: { type: String },
    ipfsHash: { type: String, required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Commitment", commitmentSchema);
