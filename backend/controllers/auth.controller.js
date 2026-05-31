const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User.model");
const logger = require("../utils/logger");

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const issueToken = (user) => {
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET must be set in environment");
  }
  return jwt.sign(
    { sub: user._id.toString(), role: user.role, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || "7d" }
  );
};

const normalizeEmail = (e) =>
  typeof e === "string" ? e.trim().toLowerCase() : e;

exports.register = async (req, res) => {
  const name = typeof req.body.name === "string" ? req.body.name.trim() : "";
  const email = normalizeEmail(req.body.email);
  const { password, role } = req.body;

  if (!name || !email || !password) {
    return res
      .status(400)
      .json({ message: "Name, email, and password are required" });
  }
  if (!EMAIL_RE.test(email)) {
    return res.status(400).json({ message: "Invalid email format" });
  }
  if (typeof password !== "string" || password.length < 6) {
    return res
      .status(400)
      .json({ message: "Password must be at least 6 characters" });
  }

  try {
    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(409).json({ message: "Email already registered" });
    }

    const hash = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, password: hash, role });
    const token = issueToken(user);

    return res.status(201).json({
      message: "Registration successful",
      token,
      role: user.role,
      name: user.name,
    });
  } catch (err) {
    if (err?.code === 11000) {
      return res.status(409).json({ message: "Email already registered" });
    }
    logger.error("auth.register:", err.message);
    return res.status(500).json({ message: "Server error" });
  }
};

exports.login = async (req, res) => {
  const email = normalizeEmail(req.body.email);
  const { password } = req.body;

  if (!email || !password) {
    return res
      .status(400)
      .json({ message: "Email and password are required" });
  }

  try {
    const user = await User.findOne({ email }).select("+password");
    if (!user) {
      // Same generic message as bad-password to avoid leaking which emails
      // are registered.
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const ok =
      typeof user.password === "string" && user.password.startsWith("$2")
        ? await bcrypt.compare(password, user.password)
        : user.password === password;

    if (!ok) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = issueToken(user);
    return res.json({
      message: "Success",
      token,
      role: user.role,
      name: user.name,
    });
  } catch (err) {
    logger.error("auth.login:", err.message);
    return res.status(500).json({ message: "Server error" });
  }
};

exports.me = async (req, res) => {
  try {
    const user = await User.findById(req.user.sub).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });
    return res.json({ user });
  } catch (err) {
    logger.error("auth.me:", err.message);
    return res.status(500).json({ message: "Server error" });
  }
};
