const router = require("express").Router();
const controller = require("../controllers/file.controller");

router.post("/", controller.saveFile);
router.get("/", controller.getFiles);
router.get("/contract/:contractAddress", controller.getFilesByContract);
router.get("/:id", controller.downloadFile);

module.exports = router;
