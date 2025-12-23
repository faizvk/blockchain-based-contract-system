const { create } = require("ipfs-http-client");

const ipfs = create({
  url: process.env.IPFS_URL || "http://localhost:5001/api/v0",
});

module.exports = ipfs;
