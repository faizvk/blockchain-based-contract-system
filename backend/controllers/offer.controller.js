const { ethers } = require("ethers");
const fs = require("fs");
const path = require("path");
const { wallet } = require("../config/blockchain");
const { contractABI } = require("../utils/contractABI");

// In-memory commitments (unchanged for now — see note below)
const commitments = {};

/**
 * Read deployed contract address from file
 */
function getDeployedContractAddress() {
  try {
    const data = fs.readFileSync(
      path.join(process.cwd(), "contractAddress.json"),
      "utf-8"
    );
    const parsed = JSON.parse(data);
    return parsed.contractAddress;
  } catch (error) {
    console.error("Error reading contract address:", error);
    return null;
  }
}

/**
 * Get contract instance
 */
function getContractInstance(address) {
  return new ethers.Contract(address, contractABI, wallet);
}

/**
 * POST /api/offers/commit
 */
exports.commitOffer = async (req, res) => {
  const { offerAmount, nonce, user } = req.body;

  const contractAddress = getDeployedContractAddress();
  if (!contractAddress) {
    return res.status(500).json({ message: "Contract not deployed yet" });
  }

  const contract = getContractInstance(contractAddress);

  try {
    const offerAmountInWei = ethers.utils.parseEther(offerAmount.toString());

    const minimumBid = await contract.minimumBid();
    if (offerAmountInWei.lt(minimumBid)) {
      return res
        .status(400)
        .json({ message: "Offer is less than minimum bid" });
    }

    const commitmentHash = ethers.utils.solidityKeccak256(
      ["uint256", "uint256"],
      [offerAmountInWei, nonce]
    );

    // Temporary storage (unchanged)
    commitments[user] = commitmentHash;

    const tx = await contract.commitOffer(commitmentHash);
    await tx.wait();

    res.json({
      message: "Offer committed",
      commitmentHash,
    });
  } catch (error) {
    console.error("Commit offer error:", error);
    res.status(500).json({ message: "Error committing offer" });
  }
};

/**
 * POST /api/offers/reveal
 */
exports.revealOffer = async (req, res) => {
  const { offerAmount, nonce, user } = req.body;

  const contractAddress = getDeployedContractAddress();
  if (!contractAddress) {
    return res.status(500).json({ message: "Contract not deployed yet" });
  }

  const contract = getContractInstance(contractAddress);
  const storedCommitment = commitments[user];

  if (!storedCommitment) {
    return res.status(400).json({ message: "No commitment found for user" });
  }

  try {
    const offerAmountInWei = ethers.utils.parseEther(offerAmount.toString());

    const expectedHash = ethers.utils.solidityKeccak256(
      ["uint256", "uint256"],
      [offerAmountInWei, nonce]
    );

    if (storedCommitment !== expectedHash) {
      return res
        .status(400)
        .json({ message: "Reveal does not match commitment" });
    }

    const tx = await contract.revealOffer(offerAmountInWei, nonce);
    await tx.wait();

    const lowestOfferInWei = await contract.lowestOffer();
    const bestOfferor = await contract.bestOfferor();

    res.json({
      message: "Offer revealed",
      offerAmount: ethers.utils.formatEther(offerAmountInWei),
      lowestOffer: ethers.utils.formatEther(lowestOfferInWei),
      bestOfferor,
    });
  } catch (error) {
    console.error("Reveal offer error:", error);
    res.status(500).json({ message: "Error revealing offer" });
  }
};

/**
 * POST /api/offers/accept
 */
exports.acceptOffer = async (req, res) => {
  const { user } = req.body;

  const contractAddress = getDeployedContractAddress();
  if (!contractAddress) {
    return res.status(500).json({ message: "Contract not deployed yet" });
  }

  const contract = getContractInstance(contractAddress);

  try {
    const owner = await contract.owner();
    if (user.toLowerCase() !== owner.toLowerCase()) {
      return res.status(403).json({ message: "Only owner can accept offers" });
    }

    const locked = await contract.contractLocked();
    if (locked) {
      return res.status(400).json({ message: "Contract is locked" });
    }

    const bestOfferor = await contract.bestOfferor();
    if (bestOfferor === ethers.constants.AddressZero) {
      return res.status(400).json({ message: "No valid offers found" });
    }

    const lowestOfferInWei = await contract.lowestOffer();
    const tx = await contract.acceptOffer();
    await tx.wait();

    res.json({
      message: "Offer accepted",
      lowestOffer: ethers.utils.formatEther(lowestOfferInWei),
      bestOfferor,
    });
  } catch (error) {
    console.error("Accept offer error:", error);
    res.status(500).json({ message: "Error accepting offer" });
  }
};
