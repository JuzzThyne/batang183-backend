import express from "express";
import { Admin } from "../models/adminModel.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import dotenv from 'dotenv';
import verifyToken from "../auth/authMiddleware.js";
import generateToken from "../auth/authUtils.js";
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
            response.send({ message: 'Login successful', token });
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

// Logout route
router.post('/logout', verifyToken, (request, response) => {
        // Token is valid, remove it
        response.send({ message: 'Logout successful'});
});

export default router;