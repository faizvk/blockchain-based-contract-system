const fs = require("fs");
const FormData = require("form-data");
const axios = require("axios");
const logger = require("../utils/logger");

/**
 * POST /api/pinata/upload
 * Field name: "file" (multipart/form-data)
 *
 * Wraps Pinata's pinFileToIPFS endpoint server-side so the JWT never
 * leaves the backend. Returns { IpfsHash } on success.
 */
exports.uploadToPinata = async (req, res) => {
  if (!process.env.PINATA_JWT) {
    return res.status(500).json({ message: "PINATA_JWT not configured" });
  }
  if (!req.file) {
    return res.status(400).json({ message: "file is required" });
  }

  try {
    const form = new FormData();
    form.append("file", fs.createReadStream(req.file.path), req.file.originalname);
    form.append(
      "pinataMetadata",
      JSON.stringify({ name: req.file.originalname, description: "tender bid" })
    );
    form.append("pinataOptions", JSON.stringify({ cidVersion: 1 }));

    const r = await axios.post(
      "https://api.pinata.cloud/pinning/pinFileToIPFS",
      form,
      {
        maxBodyLength: Infinity,
        headers: {
          ...form.getHeaders(),
          Authorization: `Bearer ${process.env.PINATA_JWT}`,
        },
      }
    );

    return res.json({ IpfsHash: r.data.IpfsHash });
  } catch (err) {
    logger.error("pinata upload:", err.message);
    return res.status(502).json({ message: "Pinata upload failed" });
  } finally {
    if (req.file?.path) {
      fs.unlink(req.file.path, () => {});
    }
  }
};
