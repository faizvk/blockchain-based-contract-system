require("dotenv").config();
const mongoose = require("mongoose");
const app = require("./app");
const connectDB = require("./config/db");
const logger = require("./utils/logger");

const PORT = Number(process.env.PORT) || 5000;
const HOST = process.env.HOST || "0.0.0.0";

connectDB();

const server = app.listen(PORT, HOST, () => {
  logger.info(`Server running on http://${HOST}:${PORT}`);
});

server.keepAliveTimeout = 65_000;
server.headersTimeout = 66_000;

const shutdown = (signal) => async () => {
  logger.info(`${signal} received — shutting down`);
  server.close(async () => {
    try {
      await mongoose.connection.close();
    } catch (err) {
      logger.error("Error closing Mongo:", err.message);
    }
    process.exit(0);
  });
  // Force-exit if cleanup hangs.
  setTimeout(() => process.exit(1), 10_000).unref();
};

process.on("SIGTERM", shutdown("SIGTERM"));
process.on("SIGINT", shutdown("SIGINT"));

process.on("unhandledRejection", (reason) => {
  logger.error("unhandledRejection:", reason);
});
process.on("uncaughtException", (err) => {
  logger.error("uncaughtException:", err.message);
});
