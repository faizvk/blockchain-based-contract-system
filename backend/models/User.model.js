const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: String,
    email: { type: String, unique: true, index: true },
    password: String,
    role: {
      type: String,
      enum: ["contractor", "owner", "authenticator", "admin"],
      default: "contractor",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
