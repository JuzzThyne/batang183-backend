// authRoutes.js
import express from 'express';
import { loginController, logoutController, registerController, getUserController } from '../controllers/authController.js';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config();

const router = express.Router();

router.use((req, res, next) => {
  // Get user-agent from headers
  const userAgent = req.headers['user-agent'];

  // Extract operating system information from user-agent
  const osMatch = userAgent.match(/\(([^)]+)\)/);

  // Check if there is a match before accessing the result
  const os = osMatch ? osMatch[1] : 'Unknown OS';

  // Set the operating system information in the request object
  req.os = os;

  next();
});
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
router.get('/check-session/:token', verifyToken, getUserController);

export default router;
