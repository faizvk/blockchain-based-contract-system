const { create } = require("ipfs-http-client");

const ipfs = create({ url: "http://localhost:5001/api/v0" }); // Adjust if IPFS is running on a different address

module.exports = { ipfs };
