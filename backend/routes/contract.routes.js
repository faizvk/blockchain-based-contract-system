const router = require("express").Router();
const controller = require("../controllers/contract.controller");
const { requireAuth, requireRole } = require("../middleware/auth");

router.get("/", controller.getAllContracts);
router.get("/:contractAddress", controller.getContractByAddress);

router.post(
  "/storeContractData",
  requireAuth,
  requireRole("owner"),
  controller.storeContractData
);
router.post(
  "/:contractAddress/start",
  requireAuth,
  requireRole("owner"),
  controller.updateStartTime
);

module.exports = router;
