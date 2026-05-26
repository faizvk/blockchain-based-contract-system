const contractABI = [
  {
    inputs: [
      { internalType: "uint256", name: "_totalBudget", type: "uint256" },
      { internalType: "uint256", name: "_unlockDuration", type: "uint256" },
      { internalType: "uint256", name: "_minimumBid", type: "uint256" },
      { internalType: "uint256", name: "_gracePeriod", type: "uint256" },
      { internalType: "uint256", name: "_contractDuration", type: "uint256" },
      { internalType: "uint256", name: "_safetyDepositAmount", type: "uint256" },
    ],
    stateMutability: "nonpayable",
    type: "constructor",
  },

  // ---------- Events ----------
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: "address", name: "owner", type: "address" },
      { indexed: false, internalType: "uint256", name: "totalBudget", type: "uint256" },
      { indexed: false, internalType: "uint256", name: "unlockTime", type: "uint256" },
      { indexed: false, internalType: "uint256", name: "minimumBid", type: "uint256" },
      { indexed: false, internalType: "uint256", name: "gracePeriod", type: "uint256" },
      { indexed: false, internalType: "uint256", name: "contractDuration", type: "uint256" },
      { indexed: false, internalType: "uint256", name: "safetyDepositAmount", type: "uint256" },
    ],
    name: "ContractDeployed",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: "address", name: "contractor", type: "address" },
      { indexed: false, internalType: "uint256", name: "offerAmount", type: "uint256" },
    ],
    name: "ContractAccepted",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [{ indexed: true, internalType: "address", name: "lockedBy", type: "address" }],
    name: "ContractLocked",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [{ indexed: false, internalType: "uint256", name: "newUnlockTime", type: "uint256" }],
    name: "ContractReset",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [{ indexed: true, internalType: "address", name: "owner", type: "address" }],
    name: "ContractUnlocked",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [{ indexed: false, internalType: "uint256", name: "startTime", type: "uint256" }],
    name: "ContractStarted",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [{ indexed: false, internalType: "uint256", name: "newGracePeriod", type: "uint256" }],
    name: "GracePeriodUpdated",
    type: "event",
  },
  { anonymous: false, inputs: [], name: "NoValidOffersFound", type: "event" },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: "address", name: "user", type: "address" },
      { indexed: false, internalType: "uint256", name: "commitedOffer", type: "uint256" },
    ],
    name: "OfferCommitted",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: "address", name: "user", type: "address" },
      { indexed: false, internalType: "uint256", name: "offerAmount", type: "uint256" },
    ],
    name: "OfferRevealed",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [{ indexed: true, internalType: "address", name: "approvedBy", type: "address" }],
    name: "StateApproved",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: "address", name: "user", type: "address" },
      { indexed: false, internalType: "uint256", name: "amount", type: "uint256" },
    ],
    name: "SafetyDepositRefunded",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: "address", name: "user", type: "address" },
      { indexed: false, internalType: "uint256", name: "amount", type: "uint256" },
    ],
    name: "SafetyDepositForfeited",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [{ indexed: false, internalType: "uint256", name: "newTotalBudget", type: "uint256" }],
    name: "TotalBudgetUpdated",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [{ indexed: false, internalType: "uint256", name: "newMinimumBid", type: "uint256" }],
    name: "MinimumBidUpdated",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [{ indexed: false, internalType: "uint256", name: "newUnlockTime", type: "uint256" }],
    name: "UnlockTimeUpdated",
    type: "event",
  },

  // ---------- Write functions ----------
  {
    inputs: [{ internalType: "address", name: "_selectedOfferor", type: "address" }],
    name: "acceptOffer",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ internalType: "bytes32", name: "_commitment", type: "bytes32" }],
    name: "commitOffer",
    outputs: [],
    stateMutability: "payable",
    type: "function",
  },
  {
    inputs: [
      { internalType: "uint256", name: "_offerAmount", type: "uint256" },
      { internalType: "uint256", name: "_nonce", type: "uint256" },
    ],
    name: "revealOffer",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "emergencyUnlock",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ internalType: "uint256", name: "_extensionDuration", type: "uint256" }],
    name: "handleNoValidOffers",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { internalType: "uint256", name: "_newUnlockDuration", type: "uint256" },
      { internalType: "uint256", name: "_newGracePeriod", type: "uint256" },
      { internalType: "uint256", name: "_newTotalBudget", type: "uint256" },
      { internalType: "uint256", name: "_newMinimumBid", type: "uint256" },
    ],
    name: "resetContract",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ internalType: "uint256", name: "_newGracePeriod", type: "uint256" }],
    name: "updateGracePeriod",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "stateApproved",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "startContract",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "refundAcceptedOfferorDeposit",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },

  // ---------- View functions ----------
  {
    inputs: [{ internalType: "address", name: "", type: "address" }],
    name: "commitments",
    outputs: [{ internalType: "bytes32", name: "", type: "bytes32" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "address", name: "", type: "address" }],
    name: "revealedOffers",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "address", name: "", type: "address" }],
    name: "revealTimes",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "address", name: "", type: "address" }],
    name: "safetyDeposits",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "bytes32", name: "", type: "bytes32" }],
    name: "usedCommitments",
    outputs: [{ internalType: "bool", name: "", type: "bool" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    name: "offerors",
    outputs: [{ internalType: "address", name: "", type: "address" }],
    stateMutability: "view",
    type: "function",
  },
  view("owner", "address"),
  view("totalBudget", "uint256"),
  view("unlockTime", "uint256"),
  view("gracePeriod", "uint256"),
  view("minimumBid", "uint256"),
  view("maxOfferors", "uint256"),
  view("contractLocked", "bool"),
  view("contractAccepted", "bool"),
  view("contractStarted", "bool"),
  view("stateApproval", "bool"),
  view("contractDuration", "uint256"),
  view("contractStartTime", "uint256"),
  view("safetyDepositAmount", "uint256"),
  view("acceptedOfferor", "address"),
  {
    inputs: [],
    name: "getContractEndTime",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
];

function view(name, outType) {
  return {
    inputs: [],
    name,
    outputs: [{ internalType: outType, name: "", type: outType }],
    stateMutability: "view",
    type: "function",
  };
}

module.exports = { contractABI };
