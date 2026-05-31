const mongoose = require("mongoose");
const logger = require("../utils/logger");

const connectDB = async () => {
  if (!process.env.MONGO_URI) {
    logger.error("MONGO_URI is not set");
    process.exit(1);
  }

  mongoose.connection.on("disconnected", () => {
    logger.warn("MongoDB disconnected");
  });
  mongoose.connection.on("reconnected", () => {
    logger.info("MongoDB reconnected");
  });

  try {
    await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
      maxPoolSize: 10,
    });

    // Log host only — never the full URI (it may carry credentials).
    const host = mongoose.connection.host || "unknown";
    logger.info(`MongoDB connected (${host})`);
  } catch (error) {
    logger.error("MongoDB connection error:", error.message);
    process.exit(1);
  }
};

module.exports = connectDB;
