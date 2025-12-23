const Commitment = require("../models/Commitment.model");

exports.storeCommitment = async (req, res) => {
  try {
    const { contractAddress, offeror, commitmentHash, username, ipfsHash } =
      req.body;

    if (!contractAddress || !offeror || !commitmentHash) {
      return res.status(400).json({ error: "Missing required fields" });
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
