const mongoose = require("mongoose");

const revealedOfferSchema = new mongoose.Schema(
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
    offerAmount: { type: String, required: true },
    username: { type: String, trim: true },
  },
  { timestamps: true }
);

revealedOfferSchema.index(
  { contractAddress: 1, offeror: 1 },
  { unique: true }
);

module.exports = mongoose.model("RevealedOffer", revealedOfferSchema);
