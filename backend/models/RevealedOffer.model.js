const mongoose = require("mongoose");

const revealedOfferSchema = new mongoose.Schema(
  {
    contractAddress: { type: String, required: true, index: true },
    offeror: { type: String, required: true, index: true },
    offerAmount: { type: String, required: true },
    username: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model("RevealedOffer", revealedOfferSchema);
