const express = require("express");
const cors = require("cors");
const path = require("path");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/contracts", require("./routes/contract.routes"));
app.use("/api/commitments", require("./routes/commitment.routes"));
app.use("/api/revealed-offers", require("./routes/revealedOffer.routes"));
app.use("/api/wallets", require("./routes/wallet.routes"));
app.use("/api/files", require("./routes/file.routes"));
app.use("/api/auth", require("./routes/auth.routes"));
app.use("/api/offers", require("./routes/offer.routes"));
app.use("/api/analyze-bids", require("./routes/analyzeBids.routes"));

module.exports = app;
