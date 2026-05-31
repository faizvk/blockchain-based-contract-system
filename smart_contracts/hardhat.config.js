require("@nomiclabs/hardhat-waffle");
require("dotenv").config();

const { RPC_URL, PRIVATE_KEY } = process.env;

module.exports = {
  solidity: {
    version: "0.8.20",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  networks: {
    hardhat: {
      chainId: 1337,
    },
    ...(RPC_URL && PRIVATE_KEY
      ? {
          sepolia: {
            url: RPC_URL,
            accounts: [PRIVATE_KEY],
          },
        }
      : {}),
  },
  mocha: {
    timeout: 60_000,
  },
};
