const mongoose = require("mongoose");
const path = require("path");

const MIME_TYPES = {
  ".pdf": "application/pdf",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".gif": "image/gif",
  ".webp": "image/webp",
  ".txt": "text/plain",
  ".csv": "text/csv",
  ".doc": "application/msword",
  ".docx": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ".xls": "application/vnd.ms-excel",
  ".xlsx": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  ".json": "application/json",
  ".zip": "application/zip",
};
const inferMime = (name) =>
  MIME_TYPES[path.extname(String(name || "")).toLowerCase()] || "application/octet-stream";

const fileSchema = new mongoose.Schema(
  {
    filename: String,
    contractAddress: { type: String, index: true },
    fileContent: Buffer,
    username: String,
    walletAddress: { type: String, index: true },
  },
  { timestamps: true }
);

const File = mongoose.model("File", fileSchema);

exports.saveFile = async (req, res) => {
  try {
    const fileData = req.body.file;
    if (!fileData?.fileContent) {
      throw new Error("fileContent missing");
    }

    const file = new File({
      filename: fileData.filename,
      contractAddress: fileData.contractAddress,
      fileContent: Buffer.from(fileData.fileContent, "base64"),
      username: fileData.username,
      walletAddress: fileData.walletAddress,
    });

    await file.save();
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getFiles = async (req, res) => {
  try {
    const files = await File.find().sort({ _id: -1 });
    res.json({ files });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch files" });
  }
};

exports.getFilesByContract = async (req, res) => {
  try {
    const { contractAddress } = req.params;
    const files = await File.find({ contractAddress });
    res.json({ files });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch files for contract" });
  }
};

exports.downloadFile = async (req, res) => {
  try {
    const file = await File.findById(req.params.id);
    if (!file) return res.status(404).json({ error: "Not found" });

    res.set("Content-Type", inferMime(file.filename));
    res.set(
      "Content-Disposition",
      `attachment; filename="${encodeURIComponent(file.filename)}"`
    );
    res.send(file.fileContent);
  } catch (error) {
    res.status(500).json({ error: "Failed to download file" });
  }
};
