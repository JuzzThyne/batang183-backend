import express from "express";
import { User } from "../models/userModel.js";
import verifyToken from "../auth/authMiddleware.js";
// import enforceHttps from "../auth/httpMiddleware.js";


const router = express.Router();
// router.use(enforceHttps);

// Protected route
router.get('/', verifyToken, async (request, response) => {
    try {
        // Access the decoded user information from the request object
        const user = request.user;

        // Your route logic here (e.g., fetching data from the database)
        const users = await User.find({});

        return response.status(200).json({
            count: users.length,
            data: users,
            user // You can include the user information in the response if needed
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
