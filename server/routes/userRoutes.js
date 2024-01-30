import express from "express";
import { User } from "../models/userModel.js";
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const router = express.Router();

router.use(express.json());

// Move calculateAge outside of the middleware
const calculateAge = (birthdate) => {
    const today = new Date();
    const birthDate = new Date(birthdate);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
    }

    return age;
};

const validateInput = (req, res, next) => {
    const user = req.body;

    // Check if birthdate is provided
    if (!user.birthdate) {
        return res.status(400).json({ message: 'Birthdate is required' });
    }

    // Check age and give an error if less than 15
    const age = calculateAge(user.birthdate);
    if (age < 15) {
        return res.status(400).json({ message: 'Age must be 15 or older' });
    }

    // Validate each input field as needed
    if (!user.first_name || !user.last_name || !user.gender || !user.address || !user.contact || !user.precinct_number) {
        return res.status(400).json({ message: 'Missing required fields' });
    }

    // Attach the age to the request object
    req.age = age;

    next(); // Proceed to the next middleware or route handler
};

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
router.get('/', verifyToken, async (req, res) => {
    try {
        const { searchTerm, page = 1, limit = 10, sortOrder = 'asc' } = req.query; // Use req.query instead of req.body

        const query = searchTerm
            ? {
                $or: [
                    { first_name: { $regex: new RegExp(searchTerm, 'i') } },
                    { middle_name: { $regex: new RegExp(searchTerm, 'i') } },
                    { last_name: { $regex: new RegExp(searchTerm, 'i') } },
                    { address: { $regex: new RegExp(searchTerm, 'i') } },
                    { precinct_number: { $regex: new RegExp(searchTerm, 'i') } },
                ],
            }
            : {};

        // Perform a count query to get the total number of users
        const totalUsersCount = await User.countDocuments(query);

        const skip = (page - 1) * limit;

        const sortOption = sortOrder === 'asc' ? { last_name: 1 } : { last_name: -1 };

        const users = await User.find(query)
            .select('_id first_name middle_name last_name gender address precinct_number') // Specify the fields you want
            .skip(skip)
            .limit(limit)
            .sort(sortOption); // Sort by last_name

        return res.status(200).json({
            count: users.length,
            currentPage: page,
            totalPages: Math.ceil(totalUsersCount / limit),
            data: users,
            //   admin: req.user //this is for getting the admin ID
        });
    } catch (error) {
        console.log(error.message);
        res.status(500).send({ message: error.message });
    }
});
  


// Your existing route for adding multiple users
router.post('/addmultiple', verifyToken, async (req, res) => {
    try {
        const users = req.body; // Assuming an array of users

        for (const user of users) {
            const existingUser = await User.findOne({
                first_name: user.first_name,
                middle_name: user.middle_name,
                last_name: user.last_name
            });

            if (existingUser) {
                // User with the same name already exists, handle accordingly
                res.status(400).send({ message: 'User already exists' });
                return;
            }

            const newUser = {
                first_name: user.first_name,
                middle_name: user.middle_name,
                last_name: user.last_name,
                gender: user.gender,
                address: user.address,
                contact: user.contact,
                precinct_number: user.precinct_number
            };

            await User.create(newUser);
        }

        res.status(201).send({ message: 'Users created successfully' });
    } catch (error) {
        console.log(error.message);
        res.status(500).send({ message: error.message });
    }
});

router.post('/add', verifyToken, validateInput, async (req, res) => {
    try {
        const user = req.body; // Assuming a single user object

        const existingUser = await User.findOne({
            first_name: user.first_name,
            middle_name: user.middle_name,
            last_name: user.last_name
        });

        if (existingUser) {
            // User with the same name already exists, handle accordingly
            res.status(400).json({ error: 'User already exists' });
            return;
        }
        
        const newUser = {
            first_name: user.first_name,
            middle_name: user.middle_name,
            last_name: user.last_name,
            gender: user.gender,
            birthdate: user.birthdate, // Add birthdate to the newUser object
            address: user.address,
            contact: user.contact,
            precinct_number: user.precinct_number,
            age: req.age // Access the age from the request object
        };

        await User.create(newUser);

        res.status(201).json({ message: 'User created successfully' });
    } catch (error) {
        // Check for specific validation errors and send appropriate messages
        if (error.errors) {
            const validationErrors = {};
            for (const key in error.errors) {
                validationErrors[key] = error.errors[key].message;
            }
            res.status(400).json({ validationErrors });
        } else {
            console.error(error.message);
            res.status(500).json({ error: 'Internal server error' });
        }
    }
});


// Route for fetching a single user
router.get('/:userId', verifyToken, async (req, res) => {
    try {
        const userId = req.params.userId;
        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        const decodedUser = user._id;

        // Compare the userId with the decodedUser _id
        if (userId !== decodedUser.toString()) {
            return res.status(403).json({ message: "Unauthorized access" });
        }

        // Create a new object with limited data
        const limitedUserData = {
            first_name: user.first_name,
            last_name: user.last_name,
            middle_name: user.middle_name,
            gender: user.gender,
            birthdate: user.birthdate.toISOString().split('T')[0],
            age: user.age,
            address: user.address,
            contact: user.contact,
            precinct_number: user.precinct_number,
            
             
        };

        return res.status(200).json({ data: limitedUserData });
    } catch (error) {
        console.log(error.message);
        res.status(500).send({ message: error.message });
    }
});

// Route for updating a single user
router.put('/:userId', verifyToken, async (req, res) => {
    try {
        const userId = req.params.userId;
        const updatedUser = {
            first_name: req.body.first_name,
            middle_name: req.body.middle_name,
            last_name: req.body.last_name,
            gender: req.body.gender,
            birthdate: req.body.birthdate,
            address: req.body.address,
            contact: req.body.contact,
            precinct_number: req.body.precinct_number,
            
        };

        const user = await User.findByIdAndUpdate(userId, updatedUser, { new: true });

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        return res.status(200).json({ message: 'User updated successfully'});
    } catch (error) {
        console.log(error.message);
        res.status(500).send({ message: error.message });
    }
});

// Route for deleting a single user
router.delete('/:userId', verifyToken, async (req, res) => {
    try {
        const userId = req.params.userId;

        const user = await User.findByIdAndDelete(userId);

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        return res.status(200).json({ message: 'User deleted successfully' });
    } catch (error) {
        console.log(error.message);
        res.status(500).send({ message: error.message });
    }
});


export default router;
