const User = require("../models/User.model");

exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.json({ message: "No record existed" });
    }

    if (user.password !== password) {
      return res.json({ message: "The password is incorrect" });
    }

    // ✅ RETURN NAME
    res.json({
      message: "Success",
      role: user.role,
      name: user.name,
    });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

exports.register = async (req, res) => {
  const { name, email, password, role } = req.body;

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.json({ message: "Email already registered" });
    }

    await User.create({ name, email, password, role });

    res.json({ message: "Registration successful" });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};
