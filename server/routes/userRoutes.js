import express from "express";
import { User } from "../models/userModel.js";
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import NodeCache from "node-cache";
import { addMultipleUserController, addSingleUserController, deleteSingleUserController, fetchUsersController, updateSingleUserController } from "../controllers/userController.js";

const userCache = new NodeCache({ stdTTL: 300, checkperiod: 60 });

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
router.post('/', verifyToken, fetchUsersController);


// Your existing route for adding multiple users
router.post('/addmultiple', verifyToken, addMultipleUserController);

router.post('/add', verifyToken, addSingleUserController);


// Route for fetching a single user
router.get('/:userId', verifyToken, fetchUsersController);

// Route for updating a single user
router.put('/:userId', verifyToken, updateSingleUserController);

// Route for deleting a single user
router.delete('/:userId', verifyToken, deleteSingleUserController);


export default router;
