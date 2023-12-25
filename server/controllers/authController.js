// controllers/authController.js
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { Admin } from "../models/adminModel.js";
import dotenv from 'dotenv';
dotenv.config();

export const loginController = async (req, res) => {
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
};

export const logoutController = (req, res) => {
    // Destroy the session
    req.session.destroy((err) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ message: "Error logging out" });
        }
        // Clear the session cookie
        res.clearCookie("connect.sid");
        res.json({ success: true, message: "Logout successful" });
    });
};

export const registerController = async (req, res) => {
    try {
        const { username, password } = req.body;

        // Check if username and password are provided
        if (!username || !password) {
            return res.status(400).json({ message: "Username and password are required" });
        }

        // Check if the username already exists
        const existingAdmin = await Admin.findOne({ username });
        if (existingAdmin) {
            return res.status(400).json({ message: "Username already exists" });
        }

        // Hash the password before saving it to the database
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create a new admin with the hashed password
        const newAdmin = new Admin({ username, password: hashedPassword });
        await newAdmin.save();

        res.json({ success: true, message: "Registration successful" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};
