const router = require("express").Router();
const controller = require("../controllers/commitment.controller");

router.post("/", controller.storeCommitment);
router.get("/:contractAddress", controller.getCommitments);

module.exports = router;
