import express, { json } from "express";
import jwt from "jsonwebtoken"; // Import the jwt module

import {
  loginController,
  logoutController,
  registerController,
} from "../controllers/authController.js";

const router = express.Router();

router.use(express.json());

// Middleware to verify JWT
const verifyToken = (req, res, next) => {
  const authorizationHeader = req.headers.authorization;

  if (!authorizationHeader) {
    return res.status(401).json({ message: "Missing token" });
  }
  const token = authorizationHeader.split(" ")[1]; // Extract the token from the Authorization header

  try {
    const decoded = jwt.verify(token, process.env.SECRET_KEY);
    req.user = decoded; // Attach the decoded user information to the request object
    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({ message: "Token has expired" });
    } else {
      return res.status(401).json({ message: "Invalid token" });
    }
  }
};

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
