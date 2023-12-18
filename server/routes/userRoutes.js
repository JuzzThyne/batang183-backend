import express from "express";
import { User } from "../models/userModel.js";

import dotenv from 'dotenv';
dotenv.config();

const router = express.Router();

// Example of a protected route
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
        if (
            !request.body.first_name ||
            !request.body.middle_name ||
            !request.body.last_name ||
            !request.body.address ||
            !request.body.contact
        ) {
            return response.status(400).send({
                message: 'Send all required fields',
            });
        }

        const existingUser = await User.findOne({ contact: request.body.contact });

        if (existingUser) {
            return response.status(400).send({
                message: 'User with this contact number already exists',
            });
        }

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
