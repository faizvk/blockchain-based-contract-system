const router = require("express").Router();
const multer = require("multer");
const os = require("os");
const { requireAuth } = require("../middleware/auth");
const { uploadToPinata } = require("../controllers/pinata.controller");

const ALLOWED_MIME = new Set([
  "application/pdf",
  "image/png",
  "image/jpeg",
  "text/plain",
]);

const upload = multer({
  dest: os.tmpdir(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB
  fileFilter: (_req, file, cb) => {
    if (ALLOWED_MIME.has(file.mimetype)) return cb(null, true);
    cb(new Error("Unsupported file type"));
  },
});

const uploadMiddleware = (req, res, next) => {
  upload.single("file")(req, res, (err) => {
    if (!err) return next();
    if (err instanceof multer.MulterError) {
      return res.status(400).json({ message: err.message });
    }
    return res.status(400).json({ message: err.message || "Upload failed" });
  });
};

router.post("/upload", requireAuth, uploadMiddleware, uploadToPinata);

module.exports = router;
