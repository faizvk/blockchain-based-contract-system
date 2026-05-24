const router = require("express").Router();
const controller = require("../controllers/revealedOffer.controller");
const { requireAuth, requireRole } = require("../middleware/auth");

router.post("/", requireAuth, requireRole("contractor"), controller.storeRevealedOffer);
router.get("/:contractAddress", controller.getRevealedOffers);

module.exports = router;
