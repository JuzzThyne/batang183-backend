import express from "express";
import jwt from "jsonwebtoken";
import { User } from "../models/userModel.js";

const router = express.Router();

// Middleware function to verify the token
const verifyToken = (request, response, next) => {
    const token = request.header("Authorization");

    if (!token) {
        return response.status(401).json({ message: "Access denied. Token is missing." });
    }

    try {
        const decoded = jwt.verify(token, process.env.SECRET_KEY);
        request.user = decoded;
        next();
    } catch (error) {
        return response.status(401).json({ message: "Invalid token." });
    }
};

// Apply the token verification middleware to all routes below
router.use(verifyToken);

// Protected route
router.get('/', async (request, response) => {
    try {
        const users = await User.find({});
        return response.status(200).json({
            count: users.length,
            data: users
        });
    } catch (error) {
        console.log(error.message);
        response.status(500).send({ message: error.message });
    }
});

// Your existing route for adding users
router.post('/', async (request, response) => {
    try {
        // ... (unchanged code)

        const newUser = {
            first_name: request.body.first_name,
            middle_name: request.body.middle_name,
            last_name: request.body.last_name,
            address: request.body.address,
            contact: request.body.contact
        };

        const user = await User.create(newUser);
        response.status(201).send({ message: 'User created successfully' });
    } catch (error) {
        console.log(error.message);
        response.status(500).send({ message: error.message });
    }
});

export default router;
