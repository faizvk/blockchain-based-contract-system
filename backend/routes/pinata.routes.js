const router = require("express").Router();
const multer = require("multer");
const os = require("os");
const { requireAuth } = require("../middleware/auth");
const { uploadToPinata } = require("../controllers/pinata.controller");

const upload = multer({
  dest: os.tmpdir(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB
});

router.post("/upload", requireAuth, upload.single("file"), uploadToPinata);

module.exports = router;
