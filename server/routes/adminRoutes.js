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
  // Extract the token from the request headers
  const token = req.headers.authorization;

  // Check if the token is present
  if (!token) {
    return res.status(401).json({ message: 'Unauthorized: No token provided' });
  }

  // Verify the token
  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(401).json({ message: 'Unauthorized: Invalid token' });
    }

    // Attach the decoded user information to the request object
    req.user = decoded;
    next();
  });
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
