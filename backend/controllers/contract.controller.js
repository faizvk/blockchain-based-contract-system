const Contract = require("../models/Contract.model");

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
    } = req.body;

    const deploymentTime = Math.floor(Date.now() / 1000);
    const unlockTime = deploymentTime + Number(unlockDuration);
    const gracePeriodEnd = unlockTime + Number(gracePeriod);

    const contractData = {
      name,
      description,
      contractAddress,
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
    console.error("Error storing contract data:", error);
    res.status(500).json({ error: "Failed to store contract data" });
  }
};

exports.getAllContracts = async (req, res) => {
  try {
    const contracts = await Contract.find();
    res.status(200).json({ contracts });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch contracts" });
  }
};

exports.getContractByAddress = async (req, res) => {
  try {
    const { contractAddress } = req.params;
    const contract = await Contract.findOne({ contractAddress }).select(
      "-__v -_id"
    );

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
    res.status(500).json({ error: "Failed to fetch contract" });
  }
};

exports.updateStartTime = async (req, res) => {
  const { contractAddress } = req.params;
  const { startTime } = req.body;

  if (!startTime || typeof startTime !== "number") {
    return res.status(400).json({ error: "Invalid startTime" });
  }

  try {
    const contract = await Contract.findOne({ contractAddress });
    if (!contract) {
      return res.status(404).json({ error: "Contract not found" });
    }

    contract.startTime = startTime;
    await contract.save();

    res.json({ message: "Start time updated", contract });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
};
