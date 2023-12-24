import express, { json } from "express";
import {
  loginController,
  logoutController,
  registerController,
} from "../controllers/authController.js";
import verifyToken from "../Auth/verifyToken.js";

const router = express.Router();

router.post("/login", loginController);
router.post("/logout",verifyToken, logoutController);
router.post("/register", registerController);
router.get("/check-session", verifyToken, (req, res) => {
  // Session is still valid, continue with checking authentication
  if (req.session.auth) {
    res.json({ authenticated: true, adminId: req.session.adminId });
  } else {
    res.json({ authenticated: false, message: "not true" });
  }
});

export default router;
