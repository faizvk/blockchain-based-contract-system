const mongoose = require("mongoose");

const fileSchema = new mongoose.Schema({
  filename: String,
  contractAddress: String,
  fileContent: Buffer,
  username: String,
  walletAddress: String,
});

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
  const files = await File.find().sort({ _id: -1 });
  res.json({ files });
};

exports.getFilesByContract = async (req, res) => {
  const { contractAddress } = req.params;
  const files = await File.find({ contractAddress });
  res.json({ files });
};

exports.downloadFile = async (req, res) => {
  const file = await File.findById(req.params.id);
  if (!file) return res.status(404).json({ error: "Not found" });

  res.set("Content-Type", "application/pdf");
  res.set("Content-Disposition", `attachment; filename="${file.filename}"`);
  res.send(file.fileContent);
};
