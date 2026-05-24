const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User.model");

const issueToken = (user) =>
  jwt.sign(
    { sub: user._id.toString(), role: user.role, email: user.email },
    process.env.JWT_SECRET || "dev-secret-change-me",
    { expiresIn: process.env.JWT_EXPIRES_IN || "7d" }
  );

exports.register = async (req, res) => {
  const { name, email, password, role } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ message: "Name, email, and password are required" });
  }
  if (typeof password !== "string" || password.length < 6) {
    return res.status(400).json({ message: "Password must be at least 6 characters" });
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
  } catch {
    return res.status(500).json({ message: "Server error" });
  }
};

exports.login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required" });
  }

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "No record existed" });
    }

    const ok =
      typeof user.password === "string" && user.password.startsWith("$2")
        ? await bcrypt.compare(password, user.password)
        : user.password === password;

    if (!ok) {
      return res.status(401).json({ message: "The password is incorrect" });
    }

    const token = issueToken(user);
    return res.json({
      message: "Success",
      token,
      role: user.role,
      name: user.name,
    });
  } catch {
    return res.status(500).json({ message: "Server error" });
  }
};

exports.me = async (req, res) => {
  try {
    const user = await User.findById(req.user.sub).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });
    return res.json({ user });
  } catch {
    return res.status(500).json({ message: "Server error" });
  }
};
