const mongoose = require("mongoose");

const contractSchema = new mongoose.Schema({
  contractAddress: { type: String, required: true, unique: true },
  name: String,
  description: String,
  totalBudget: Number,
  contractDuration: Number, // Duration in seconds, assumed to be stored already
  startTime: { type: Number, default: 0 }, // Timestamp in seconds
  // Other fields as needed
});

module.exports = mongoose.model("ContractStartTime", contractSchema);
