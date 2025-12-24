const { create } = require("ipfs-http-client");

const ipfs = create({
  url: process.env.IPFS_URL,
});

module.exports = ipfs;
