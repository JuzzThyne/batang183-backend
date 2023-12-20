import express from "express";
import { User } from "../models/userModel.js";
import { Admin } from "../models/adminModel.js";
import verifyToken from "../auth/authMiddleware.js";
// import enforceHttps from "../auth/httpMiddleware.js";


const router = express.Router();
// router.use(enforceHttps);

// Protected route
router.get('/', verifyToken, async (request, response) => {
    try {
        const user = request.user;
        const page = parseInt(request.query.page) || 1;
        const limit = 20; // Set the limit to 20 per page
        const skip = (page - 1) * limit;
        const users = await User.find({}).skip(skip).limit(limit);
        return response.status(200).json({
            data: users,
            user,
            currentPage: page,
            totalPages: Math.ceil(users.length / limit)
        });
    } catch (error) {
        console.log(error.message);
        response.status(500).send({ message: error.message });
    }
});


// Your existing route for adding users
router.post('/', verifyToken, async (request, response) => {
    try {
        // ... (unchanged code)

        const newUser = {
            first_name: request.body.first_name,
            middle_name: request.body.middle_name,
            last_name: request.body.last_name,
            address: request.body.address,
            contact: request.body.contact,
            precinct_number: request.body.precinct_number
        };

        const user = await User.create(newUser);
        response.status(201).send({ message: 'User created successfully' });
    } catch (error) {
        console.log(error.message);
        response.status(500).send({ message: error.message });
    }
});

export default router;
