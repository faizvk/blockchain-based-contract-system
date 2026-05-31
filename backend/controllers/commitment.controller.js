const Commitment = require("../models/Commitment.model");
const logger = require("../utils/logger");
const { isEthAddress, isBytes32 } = require("../utils/validators");

exports.storeCommitment = async (req, res) => {
  try {
    const { contractAddress, offeror, commitmentHash, username, ipfsHash } =
      req.body;

    if (!isEthAddress(contractAddress)) {
      return res.status(400).json({ error: "Invalid contractAddress" });
    }
    if (!isEthAddress(offeror)) {
      return res.status(400).json({ error: "Invalid offeror address" });
    }
    if (!isBytes32(commitmentHash)) {
      return res.status(400).json({ error: "Invalid commitmentHash" });
    }

    const commitment = new Commitment({
      contractAddress: contractAddress.toLowerCase(),
      offeror: offeror.toLowerCase(),
      commitmentHash,
      username,
      ipfsHash,
    });

    await commitment.save();
    res.json({ message: "Commitment stored successfully" });
  } catch (error) {
    logger.error("storeCommitment:", error.message);
    res.status(500).json({ error: "Failed to store commitment" });
  }
};

exports.getCommitments = async (req, res) => {
  try {
    const { contractAddress } = req.params;
    if (!isEthAddress(contractAddress)) {
      return res.status(400).json({ error: "Invalid contractAddress" });
    }
    const commitments = await Commitment.find({
      contractAddress: contractAddress.toLowerCase(),
    }).lean();
    res.json({ commitments });
  } catch (error) {
    logger.error("getCommitments:", error.message);
    res.status(500).json({ error: "Failed to fetch commitments" });
  }
};
