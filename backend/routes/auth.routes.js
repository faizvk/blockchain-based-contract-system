const router = require("express").Router();
const authController = require("../controllers/auth.controller");
const { requireAuth } = require("../middleware/auth");

router.post("/login", authController.login);
router.post("/register", authController.register);
router.get("/me", requireAuth, authController.me);

module.exports = router;
