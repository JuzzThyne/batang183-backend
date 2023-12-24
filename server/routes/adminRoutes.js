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

const router = express.Router();


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

router.post("/login", loginController);
router.use(session({
  genid: (req) => {
    return uuidv4(); // Generate a new UUID for each session
  },
  secret: 'keyboard cat',
  resave: false,
  saveUninitialized: true,
  store: store, // Use the MongoDB session store
  cookie: {
    maxAge: 1000 * 60 * 60 * 24, // Set the cookie to expire after 24 hours
    httpOnly: true, // Ensures the cookie is only accessible through HTTP(S) requests
    // secure: process.env.NODE_ENV === 'production', // Ensures the cookie is only sent over HTTPS in production
    // sameSite: 'strict', // Prevents the cookie from being sent with cross-site requests
  },
}));
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
