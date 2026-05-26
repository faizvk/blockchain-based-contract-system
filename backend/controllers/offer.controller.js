const { ethers } = require("ethers");
const { wallet } = require("../config/blockchain");
const { contractABI } = require("../utils/contractABI");
const logger = require("../utils/logger");
const { isEthAddress } = require("../utils/validators");

const getContract = (address) => new ethers.Contract(address, contractABI, wallet);

const parseEth = (v) => ethers.utils.parseEther(String(v));
const formatEth = (v) => ethers.utils.formatEther(v);

/**
 * POST /api/offers/commit
 * body: { contractAddress, offerAmount, nonce }
 */
exports.commitOffer = async (req, res) => {
  const { contractAddress, offerAmount, nonce } = req.body;

  if (!isEthAddress(contractAddress)) {
    return res.status(400).json({ message: "Invalid contractAddress" });
  }
  if (offerAmount == null || nonce == null) {
    return res.status(400).json({ message: "offerAmount and nonce are required" });
  }

  try {
    const contract = getContract(contractAddress);

    const offerAmountWei = parseEth(offerAmount);
    const minimumBid = await contract.minimumBid();
    if (offerAmountWei.lt(minimumBid)) {
      return res.status(400).json({ message: "Offer is less than minimum bid" });
    }

    const commitmentHash = ethers.utils.solidityKeccak256(
      ["uint256", "uint256"],
      [offerAmountWei, ethers.BigNumber.from(nonce)]
    );

    const tx = await contract.commitOffer(commitmentHash);
    await tx.wait();

    return res.json({ message: "Offer committed", commitmentHash });
  } catch (error) {
    logger.error("commitOffer:", error.message);
    return res.status(500).json({ message: "Error committing offer" });
  }
};

/**
 * POST /api/offers/reveal
 * body: { contractAddress, offerAmount, nonce }
 */
exports.revealOffer = async (req, res) => {
  const { contractAddress, offerAmount, nonce } = req.body;

  if (!isEthAddress(contractAddress)) {
    return res.status(400).json({ message: "Invalid contractAddress" });
  }
  if (offerAmount == null || nonce == null) {
    return res.status(400).json({ message: "offerAmount and nonce are required" });
  }

  try {
    const contract = getContract(contractAddress);
    const offerAmountWei = parseEth(offerAmount);

    const tx = await contract.revealOffer(offerAmountWei, ethers.BigNumber.from(nonce));
    await tx.wait();

    return res.json({
      message: "Offer revealed",
      offerAmount: formatEth(offerAmountWei),
    });
  } catch (error) {
    logger.error("revealOffer:", error.message);
    return res.status(500).json({ message: "Error revealing offer" });
  }
};

/**
 * POST /api/offers/accept
 * body: { contractAddress, offerorAddress }
 */
exports.acceptOffer = async (req, res) => {
  const { contractAddress, offerorAddress } = req.body;

  if (!isEthAddress(contractAddress) || !isEthAddress(offerorAddress)) {
    return res.status(400).json({ message: "contractAddress and offerorAddress are required" });
  }

  try {
    const contract = getContract(contractAddress);

    const locked = await contract.contractLocked();
    if (locked) return res.status(400).json({ message: "Contract is locked" });

    const tx = await contract.acceptOffer(offerorAddress);
    await tx.wait();

    return res.json({ message: "Offer accepted", offerorAddress });
  } catch (error) {
    logger.error("acceptOffer:", error.message);
    return res.status(500).json({ message: "Error accepting offer" });
  }
};
