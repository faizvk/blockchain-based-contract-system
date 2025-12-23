const router = require("express").Router();
const controller = require("../controllers/revealedOffer.controller");

router.post("/", controller.storeRevealedOffer);
router.get("/:contractAddress", controller.getRevealedOffers);

module.exports = router;
