const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: { type: String, trim: true },
    email: {
      type: String,
      unique: true,
      index: true,
      lowercase: true,
      trim: true,
    },
    // Login flow explicitly re-selects this with .select("+password") when
    // it needs to verify a password.
    password: { type: String, select: false },
    role: {
      type: String,
      enum: ["contractor", "owner", "authenticator", "admin"],
      default: "contractor",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
