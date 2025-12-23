const router = require("express").Router();
const controller = require("../controllers/wallet.controller");

router.post("/", controller.storeWallet);
router.get("/", controller.getWallets);

module.exports = router;
