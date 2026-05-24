const router = require("express").Router();
const controller = require("../controllers/file.controller");
const { requireAuth } = require("../middleware/auth");

router.post("/", requireAuth, controller.saveFile);
router.get("/", controller.getFiles);
router.get("/contract/:contractAddress", controller.getFilesByContract);
router.get("/:id", controller.downloadFile);

module.exports = router;
