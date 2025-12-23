require("@nomiclabs/hardhat-waffle");
require("dotenv").config(); // Load environment variables from .env file

module.exports = {
  solidity: "0.8.0",
  networks: {
    hardhat: {
      chainId: 1337, // Local Hardhat network
    },
    sepolia: {
      url: "https://sepolia.infura.io/v3/9dee712955fa4f74984a0c31c90d5df7", // Infura Sepolia URL
      accounts: [
        `0x7e50e04af79d973d0de966cb3b7044018f5e8260491c7b610ab473e5530a7f80`,
      ], // Wallet private key
    },
  },
};
