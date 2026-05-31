const jwt = require("jsonwebtoken");

const SECRET = () => {
  const v = process.env.JWT_SECRET;
  if (!v) {
    throw new Error("JWT_SECRET must be set in environment");
  }
  // Reject obviously weak secrets — they trivially break token security.
  if (v.length < 32) {
    throw new Error("JWT_SECRET must be at least 32 characters");
  }
  return v;
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

exports.requireRole =
  (...roles) =>
  (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: "Forbidden" });
    }
    return next();
  };
