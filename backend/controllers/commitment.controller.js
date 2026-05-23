const Commitment = require("../models/Commitment.model");
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
      contractAddress,
      offeror,
      commitmentHash,
      username,
      ipfsHash,
    });

    await commitment.save();
    res.json({ message: "Commitment stored successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to store commitment" });
  }
};

exports.getCommitments = async (req, res) => {
  try {
    const { contractAddress } = req.params;
    const commitments = await Commitment.find({ contractAddress });
    res.json({ commitments });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch commitments" });
  }
};
