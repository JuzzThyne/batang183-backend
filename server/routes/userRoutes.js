import express from "express";
import { User } from "../models/userModel.js";
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config();

const router = express.Router();

router.use(express.json());

// Middleware for token verification
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

// Your existing route for fetching users
router.post('/', verifyToken, async (req, res) => {
    try {
        // Your route logic here (e.g., fetching data from the database)
        const users = await User.find({});

        return res.status(200).json({
            count: users.length,
            data: users,
            user: req.user // Use the user information attached to the request object
        });
    } catch (error) {
        console.log(error.message);
        res.status(500).send({ message: error.message });
    }
});

// Your existing route for adding users
router.post('/add', verifyToken, async (req, res) => {
    try {
        // ... (unchanged code)

        const newUser = {
            first_name: req.body.first_name,
            middle_name: req.body.middle_name,
            last_name: req.body.last_name,
            address: req.body.address,
            contact: req.body.contact,
            precinct_number: req.body.precinct_number
        };

        const createdUser = await User.create(newUser);
        res.status(201).send({ message: 'User created successfully', user: createdUser });
    } catch (error) {
        console.log(error.message);
        res.status(500).send({ message: error.message });
    }
});

export default router;
