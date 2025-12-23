const router = require("express").Router();
const controller = require("../controllers/contract.controller");

// matches controller exports exactly
router.post("/storeContractData", controller.storeContractData);
router.get("/", controller.getAllContracts);
router.get("/:contractAddress", controller.getContractByAddress);
router.post("/:contractAddress/start", controller.updateStartTime);

module.exports = router;
