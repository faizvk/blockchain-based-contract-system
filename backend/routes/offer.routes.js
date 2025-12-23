const router = require("express").Router();
const controller = require("../controllers/offer.controller");

router.post("/commit", controller.commitOffer);
router.post("/reveal", controller.revealOffer);
router.post("/accept", controller.acceptOffer);

module.exports = router;
