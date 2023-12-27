// authRoutes.js

import express from 'express';
import { loginController, logoutController, registerController } from '../controllers/authController.js';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const router = express.Router();

router.use(express.json());

// Middleware for verifying the token
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

// Routes
router.post('/login', loginController);

router.post('/logout', verifyToken, logoutController);

router.post('/register', registerController);

// Protected route that requires a valid token
router.get('/check-session', verifyToken, (req, res) => {
  // Check the authentication using the token
  if (req.user) {
    res.json({ authenticated: true, adminId: req.user.adminId });
  } else {
    res.json({ authenticated: false, message: 'Not true' });
  }
});

export default router;
