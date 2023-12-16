import express from "express";
import { Admin } from "../models/adminModel.js";
const router = express.Router();

// add users
router.post('/', async (request, response) => {
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

        const newUser = {
            name: request.body.name,
            username: request.body.username,
            password: request.body.password
        };

        const user = await Admin.create(newUser);
        // You might want to send a response after successfully creating the user
        response.status(201).send({ message: 'Admin created successfully' });
    } catch (error) {
        console.log(error.message);
        response.status(500).send({ message: error.message });
    }
});


export default router;