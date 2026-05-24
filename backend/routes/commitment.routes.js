const router = require("express").Router();
const controller = require("../controllers/commitment.controller");
const { requireAuth, requireRole } = require("../middleware/auth");

router.post("/", requireAuth, requireRole("contractor"), controller.storeCommitment);
router.get("/:contractAddress", controller.getCommitments);

module.exports = router;
