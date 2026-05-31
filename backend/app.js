const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const crypto = require("node:crypto");

const app = express();

// Honor X-Forwarded-* headers when behind a proxy/load balancer
// (Render, Fly, nginx, etc.) so req.ip and rate-limiting work correctly.
app.set("trust proxy", 1);
app.disable("x-powered-by");

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
    allowedHeaders: ["Content-Type", "Authorization"],
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  })
);
app.use(express.json({ limit: "10mb" }));

// Surface a request id on every response so client-side bug reports can be
// correlated with server logs. Honors an inbound X-Request-Id if present.
app.use((req, res, next) => {
  const id = req.headers["x-request-id"] || crypto.randomUUID();
  req.id = id;
  res.setHeader("X-Request-Id", id);
  next();
});

// Hard ceiling on response time so slow upstream calls (RPC, Pinata, Gemini)
// can't hold sockets indefinitely.
app.use((req, res, next) => {
  res.setTimeout(60_000, () => {
    if (!res.headersSent) {
      res.status(504).json({ error: "Upstream timeout" });
    }
  });
  next();
});

// Routes
app.use("/api/contracts", require("./routes/contract.routes"));
app.use("/api/commitments", require("./routes/commitment.routes"));
app.use("/api/revealed-offers", require("./routes/revealedOffer.routes"));
app.use("/api/wallets", require("./routes/wallet.routes"));
app.use("/api/files", require("./routes/file.routes"));
app.use("/api/auth", require("./routes/auth.routes"));
app.use("/api/offers", require("./routes/offer.routes"));
app.use("/api/analyze-bids", require("./routes/analyzeBids.routes"));
app.use("/api/pinata", require("./routes/pinata.routes"));

app.get("/health", (_req, res) => {
  // readyState: 0 disconnected, 1 connected, 2 connecting, 3 disconnecting
  const dbConnected = mongoose.connection.readyState === 1;
  res.status(dbConnected ? 200 : 503).json({
    status: dbConnected ? "ok" : "degraded",
    db: dbConnected ? "connected" : "down",
    uptime: Math.round(process.uptime()),
  });
});

app.use((req, res) => {
  res.status(404).json({ error: "Not Found", path: req.originalUrl });
});

app.use((err, _req, res, _next) => {
  // CORS rejection and malformed JSON are client errors, not 500s.
  if (err?.message === "Not allowed by CORS") {
    return res.status(403).json({ error: err.message });
  }
  if (err?.type === "entity.parse.failed" || err instanceof SyntaxError) {
    return res.status(400).json({ error: "Invalid JSON body" });
  }
  if (err?.type === "entity.too.large") {
    return res.status(413).json({ error: "Request body too large" });
  }
  const status = err.status || 500;
  res.status(status).json({ error: err.message || "Internal Server Error" });
});

module.exports = app;
