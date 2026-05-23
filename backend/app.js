const express = require("express");
const cors = require("cors");
const path = require("path");

const app = express();

const allowedOrigins = (process.env.CORS_ORIGIN || "http://localhost:5173")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

app.use(
  cors({
    origin: (origin, cb) => {
      if (!origin || allowedOrigins.includes(origin)) return cb(null, true);
      return cb(new Error("Not allowed by CORS"));
    },
    credentials: true,
  })
);
app.use(express.json({ limit: "10mb" }));

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
