import express from "express";
import { Admin } from "../models/adminModel.js";
import bcrypt from "bcrypt";
import dotenv from 'dotenv';
import { generateToken } from "../auth/tokenUtils.js";
import { verifyToken } from "../auth/tokenVerification.js";
dotenv.config();

const router = express.Router();


// add users
router.post('/register', async (request, response) => {
    try {
        if (
            !request.body.name ||
            !request.body.username ||
            !request.body.password
        ) {
            return response.status(400).send({
                message: 'Send all required fields',
            });
        }

        // Check if user already exists with the provided username
        const existingUser = await Admin.findOne({ username: request.body.username });

        if (existingUser) {
            return response.status(400).send({
                message: 'User with this username already exists',
            });
        }

        // Hash the password before storing it
        const hashedPassword = await bcrypt.hash(request.body.password, 10);

        const newUser = {
            name: request.body.name,
            username: request.body.username,
            password: hashedPassword
        };

        const user = await Admin.create(newUser);
        // You might want to send a response after successfully creating the user
        response.status(201).send({ message: 'Admin created successfully' });
    } catch (error) {
        console.log(error.message);
        response.status(500).send({ message: error.message });
    }
});
// Admin login
router.post('/login', async (request, response) => {
    try {

        if (!request.body.username || !request.body.password) {
            return response.status(400).send({
                message: 'Send both username and password',
            });
        }

        // Find the user by username
        const user = await Admin.findOne({ username: request.body.username });

        if (!user) {
            return response.status(401).send({
                message: 'Invalid username or password',
            });
        }

        // Compare the provided password with the hashed password
        const isPasswordValid = await bcrypt.compare(request.body.password, user.password);

        if (isPasswordValid) {
            const token = generateToken(user);
            response.send({ message: 'Login successful',token });
        } else {
            response.status(401).send({
                message: 'Invalid username or password',
            });
        }
    } catch (error) {
        console.log(error.message);
        response.status(500).send({ message: error.message });
    }
});

// logout routes
router.post('/logout', (request, response) => {
    // Retrieve the token from the Authorization header
    const tokenHeader = request.headers.authorization;

    if (!tokenHeader) {
        // Token is missing
        return response.status(401).send({ message: 'Missing Authorization header' });
    }

    // Extract the token from the Authorization header (assuming "Bearer" is used)
    const token = tokenHeader.split(' ')[1];

    if (token && verifyToken(token)) {
        // Token is valid, remove it
        response.send({ message: 'Logout successful', token: null });
    } else {
        // Token is either missing or invalid
        response.status(401).send({ message: 'Invalid or missing token' });
    }
});


export default router;