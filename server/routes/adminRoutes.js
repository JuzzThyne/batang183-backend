import express from "express";
import { loginController, logoutController, registerController } from "../controllers/authController.js";
import verifyToken from "../Auth/verifyToken.js";
import dotenv from 'dotenv';
dotenv.config();

const router = express.Router();

router.use(express.json());

router.post("/login", loginController);

router.post("/logout", verifyToken, logoutController);

router.post("/register", registerController);

router.get("/check-session", verifyToken, (req, res) => {
  // Check the authentication using the token
  if (req.user) {
    res.json({ authenticated: true, adminId: req.user.adminId });
  } else {
    res.json({ authenticated: false, message: "Not true" });
  }
});

export default router;
