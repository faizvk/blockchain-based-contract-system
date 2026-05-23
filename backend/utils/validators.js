const ETH_ADDRESS = /^0x[a-fA-F0-9]{40}$/;
const BYTES32_HEX = /^0x[a-fA-F0-9]{64}$/;

const isEthAddress = (v) => typeof v === "string" && ETH_ADDRESS.test(v);
const isBytes32 = (v) => typeof v === "string" && BYTES32_HEX.test(v);
const isPositiveNumber = (v) => {
  const n = Number(v);
  return Number.isFinite(n) && n > 0;
};

module.exports = { isEthAddress, isBytes32, isPositiveNumber };
