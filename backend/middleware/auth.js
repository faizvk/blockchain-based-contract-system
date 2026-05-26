const jwt = require("jsonwebtoken");

const SECRET = () => {
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET must be set in environment");
  }
  return process.env.JWT_SECRET;
};

exports.requireAuth = (req, res, next) => {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;
  if (!token) {
    return res.status(401).json({ message: "Missing Authorization token" });
  }
  try {
    req.user = jwt.verify(token, SECRET());
    return next();
  } catch {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};

exports.requireRole = (...roles) => (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ message: "Not authenticated" });
  }
  if (!roles.includes(req.user.role)) {
    return res.status(403).json({ message: "Forbidden" });
  }
  return next();
};
