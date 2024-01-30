// controllers/authController.js
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { Admin } from "../models/adminModel.js";
import dotenv from "dotenv";
import { Session } from "../models/sessionModel.js";

dotenv.config();

export const loginController = async (req, res) => {
  try {
    const { username, password } = req.body;

    // Check if username and password are provided
    if (!username || !password) {
      return res
        .status(400)
        .json({ message: "Username and password are required" });
    }

    // Find the admin by username
    const admin = await Admin.findOne({ username }).select("password name adminType");

    // If the admin is not found, return an error
    if (!admin) {
      return res.status(401).json({ message: "Invalid username or password" });
    }

    // Compare the provided password with the hashed password in the database
    const passwordMatch = await bcrypt.compare(password, admin.password);

    // If passwords match, create a session or update the existing one
    if (passwordMatch) {
      // Check if a session already exists for the admin
      const existingSession = await Session.findOne({ adminId: admin._id });

      if (existingSession) {
        // Update the existing session's updatedAt field
        existingSession.updatedAt = Date.now();
        await existingSession.save();

        return res.json({ success: true, token: existingSession.token });
      } else {
        // Create a new session with random id
        const token = jwt.sign({ adminId: admin._id, adminType: admin.adminType }, process.env.SECRET_KEY, {
          expiresIn: "24h",
        });

        // Save the session data
        const newSession = new Session({
          adminId: admin._id,
          adminName: admin.name,
          token,
          device: req.os,
          adminType: admin.adminType,
        });
        await newSession.save();

        return res.json({ success: true, token });
      }
    } else {
      // If passwords do not match, return an error
      return res.status(401).json({ message: "Invalid username or password" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Errors" });
  }
};


export const logoutController = async (req, res) => {
  try {
    // Check if user information is available in the request object
    if (req.user && req.user.adminId && req.user.adminType) {
      // Remove the session based on adminId and adminType
      await Session.findOneAndDelete({
        adminId: req.user.adminId,
        adminType: req.user.adminType,
      });

      // Clear any user-related information in the request object
      req.user = null;

      return res.json({ success: true, message: "Logout successful" });
    } else {
      // If user information is not available, still clear any user-related information
      req.user = null;
      return res.json({ success: true, message: "Logout successful" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};



export const registerController = async (req, res) => {
  try {
    const { name, username, password, adminType } = req.body;

    // Check if username and password are provided
    if (!name || !username || !password || !adminType) {
      return res
        .status(400)
        .json({ message: "Username and password are required" });
    }

    // Check if the username already exists
    const existingAdmin = await Admin.findOne({ username });
    if (existingAdmin) {
      return res.status(400).json({ message: "Username already exists" });
    }
    
    // Hash the password before saving it to the database
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create a new admin with the hashed password
    const newAdmin = new Admin({
      name,
      username,
      password: hashedPassword,
      adminType,
    });
    await newAdmin.save();
    res.json({ success: true, message: "Registration successful" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
export const getUserController = async (req, res) => {
  // Check the authentication using the token
  console.log(req.user);
  if (req.user) {
    // Extract the token from the request parameters
    const { token } = req.params;
    const adminId = req.user.adminId;
    const adminType = req.user.adminType;

    // Check if the token is provided
    if (!token || !adminId) {
      return res.status(400).json({ message: "Both adminId and token are required" });
    }
    // Check if the provided token is valid
    const session = await Session.findOne({ adminId, token }).select("accountStatus");

    if (session) {
      // If session is found, user is authenticated
      res.status(200).json({ validated: session.accountStatus, admin: adminType, adminUser: adminId });
    } else {
      // If session is not found, user is not authenticated
      res.status(401).json({ validated: false, message: "Invalid session" });
    }
  } else {
    res.status(400).json({ validated: false, message: "Not true" });
  }
};
