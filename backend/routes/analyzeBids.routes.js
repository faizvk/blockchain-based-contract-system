const express = require("express");
const multer = require("multer");
const fs = require("fs");
const os = require("os");

const pdfParse = require("pdf-parse");

const { analyzeTenderAndBids } = require("../config/gemini.js");

const router = express.Router();
const upload = multer({ dest: os.tmpdir() });

async function extractPdfText(buffer) {
  const { text } = await pdfParse(buffer);
  return text;
}
router.post("/", upload.array("bids"), async (req, res) => {
  try {
    if (!req.body.requirements) {
      return res.status(400).json({
        success: false,
        message: "Tender requirements not provided",
      });
    }

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No bid files uploaded",
      });
    }

    const bids = [];

    for (const file of req.files) {
      const buffer = fs.readFileSync(file.path);
      const text = await extractPdfText(buffer);

      bids.push({
        filename: file.originalname,
        text,
      });

      fs.unlinkSync(file.path);
    }

    const geminiResult = await analyzeTenderAndBids(
      req.body.requirements,
      bids
    );

    return res.json({
      success: true,
      data: {
        requirements: geminiResult.tender,
        bestBid: {
          filename: geminiResult.best_bid,
          ...geminiResult.best_specs,
        },
        qualifiedBids: geminiResult.qualified_bids,
      },
    });
  } catch (err) {
    console.error("ANALYZE_BIDS_ERROR:", err);
    return res.status(500).json({
      success: false,
      message: "Bid analysis failed",
    });
  }
});

module.exports = router;
