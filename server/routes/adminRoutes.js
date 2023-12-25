import express, { json } from "express";
import {
  loginController,
  logoutController,
  registerController,
} from "../controllers/authController.js";
import verifyToken from "../Auth/verifyToken.js";
import session from "express-session";
import ConnectMongoDBSession from "connect-mongodb-session";
import { v4 as uuidv4 } from 'uuid'; // Import the uuid library
import dotenv from 'dotenv';
import jwt from "jsonwebtoken";
import { Admin } from "../models/adminModel.js";
import bcrypt from "bcrypt";


dotenv.config();

// Set up MongoDB session store
const MongoDBStore = ConnectMongoDBSession(session);
const store = new MongoDBStore({
  uri: process.env.MONGODB_CONNECT_URI_ADMIN,
  collection: 'sessions', // Specify the name of the collection for sessions
  expires: 1000 * 60 * 60 * 24, // Set session to expire after 24 hours
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Handle errors with the store
store.on('error', (error) => {
  console.error(error);
});

const router = express.Router();

router.use((req, res, next) => {
  res.header("Access-Control-Allow-Credentials", true);
  next();
});
router.use(session({
  genid: (req) => {
    return uuidv4(); // Generate a new UUID for each session
  },
  secret: 'keyboard cat',
  resave: false,
  saveUninitialized: false,
  store: store, // Use the MongoDB session store
  cookie: { 
    maxAge: 3600000,
    // httpOnly: false,
    // secure: true, // Set to true if your frontend is served over HTTPS
    // sameSite: 'none', 
  },
}));

router.post("/login", async (req, res) => {
  try {
      const { username, password } = req.body;

      // Check if username and password are provided
      if (!username || !password) {
          return res.status(400).json({ message: "Username and password are required" });
      }

      // Find the admin by username
      const admin = await Admin.findOne({ username }).select('password');

      // If the admin is not found, return an error
      if (!admin) {
          return res.status(401).json({ message: "Invalid username or password" });
      }

      // Compare the provided password with the hashed password in the database
      const passwordMatch = await bcrypt.compare(password, admin.password);

      // If passwords match, create a session and return a success message
      if (passwordMatch) {
          const token = jwt.sign({ adminId: admin._id }, process.env.SECRET_KEY, { expiresIn: '1h' });
          req.session.auth = true;
          req.session.adminId = admin._id; // Optionally, store additional data in the session
          return res.json({ success: true, message: "Login successful", token });
      } else {
          // If passwords do not match, return an error
          return res.status(401).json({ message: "Invalid username or password" });
      }
  } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Internal Server Error" });
  }
});

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
