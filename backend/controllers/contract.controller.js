const Contract = require("../models/Contract.model");
const logger = require("../utils/logger");
const {
  isEthAddress,
  isNonEmptyString,
  isPositiveNumber,
} = require("../utils/validators");

exports.storeContractData = async (req, res) => {
  try {
    const {
      name,
      description,
      totalBudget,
      unlockDuration,
      minimumBid,
      gracePeriod,
      safetyDepositAmount,
      contractDuration,
      contractAddress,
      cid,
      unlockTime: clientUnlockTime,
      gracePeriodEnd: clientGracePeriodEnd,
    } = req.body;

    if (!isEthAddress(contractAddress)) {
      return res.status(400).json({ error: "Valid contractAddress is required" });
    }
    const normalizedAddress = contractAddress.toLowerCase();
    if (!isNonEmptyString(name) || !isNonEmptyString(description)) {
      return res.status(400).json({ error: "name and description are required" });
    }
    for (const [k, v] of Object.entries({
      totalBudget,
      unlockDuration,
      minimumBid,
      gracePeriod,
      safetyDepositAmount,
      contractDuration,
    })) {
      if (!isPositiveNumber(v)) {
        return res.status(400).json({ error: `${k} must be a positive number` });
      }
    }

    const existing = await Contract.findOne({ contractAddress: normalizedAddress });
    if (existing) {
      return res.status(409).json({
        error: "Contract with this address already stored",
        contract: existing,
      });
    }

    // Prefer client-supplied timestamps anchored to the actual on-chain
    // deployment time. Fall back to "now" only if the client didn't send them
    // (e.g. older deploy script).
    const deploymentTime = Math.floor(Date.now() / 1000);
    const unlockTime =
      Number(clientUnlockTime) > 0
        ? Number(clientUnlockTime)
        : deploymentTime + Number(unlockDuration);
    const gracePeriodEnd =
      Number(clientGracePeriodEnd) > 0
        ? Number(clientGracePeriodEnd)
        : unlockTime + Number(gracePeriod);

    const contractData = {
      name,
      description,
      cid,
      contractAddress: normalizedAddress,
      totalBudget,
      unlockDuration,
      minimumBid,
      gracePeriod,
      safetyDepositAmount,
      contractDuration,
      unlockTime,
      gracePeriodEnd,
    };

    const newContract = new Contract({
      ...contractData,
      unlockDurationDays: Math.floor(unlockDuration / 86400),
      gracePeriodDays: Math.floor(gracePeriod / 86400),
      contractDurationDays: Math.floor(contractDuration / 86400),
    });

    await newContract.save();

    res.status(200).json({
      message: "Data stored successfully",
      contract: newContract,
    });
  } catch (error) {
    // Race with the explicit findOne — the unique index can still trip
    // if two requests arrive concurrently.
    if (error?.code === 11000) {
      return res
        .status(409)
        .json({ error: "Contract with this address already stored" });
    }
    logger.error("storeContractData:", error.message);
    res.status(500).json({ error: "Failed to store contract data" });
  }
};

exports.getAllContracts = async (req, res) => {
  try {
    const contracts = await Contract.find()
      .select("-__v")
      .sort({ createdAt: -1 })
      .lean();
    res.status(200).json({ contracts });
  } catch (error) {
    logger.error("getAllContracts:", error.message);
    res.status(500).json({ error: "Failed to fetch contracts" });
  }
};

exports.getContractByAddress = async (req, res) => {
  try {
    const { contractAddress } = req.params;
    if (!isEthAddress(contractAddress)) {
      return res.status(400).json({ error: "Invalid contractAddress" });
    }
    const contract = await Contract.findOne({
      contractAddress: contractAddress.toLowerCase(),
    }).select("-__v -_id");

    if (!contract) {
      return res.status(404).json({ error: "Contract not found" });
    }

    const now = Math.floor(Date.now() / 1000);

    res.status(200).json({
      contract: {
        ...contract.toObject(),
        currentTime: now,
        unlockRemaining: contract.unlockTime - now,
        graceRemaining: contract.gracePeriodEnd - now,
      },
    });
  } catch (error) {
    logger.error("getContractByAddress:", error.message);
    res.status(500).json({ error: "Failed to fetch contract" });
  }
};

exports.updateStartTime = async (req, res) => {
  const { contractAddress } = req.params;
  const { startTime } = req.body;

  if (!isEthAddress(contractAddress)) {
    return res.status(400).json({ error: "Invalid contractAddress" });
  }
  if (!Number.isFinite(startTime) || startTime <= 0) {
    return res.status(400).json({ error: "Invalid startTime" });
  }

  try {
    const contract = await Contract.findOne({
      contractAddress: contractAddress.toLowerCase(),
    });
    if (!contract) {
      return res.status(404).json({ error: "Contract not found" });
    }

    contract.startTime = startTime;
    await contract.save();

    res.json({ message: "Start time updated", contract });
  } catch (error) {
    logger.error("updateStartTime:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};
