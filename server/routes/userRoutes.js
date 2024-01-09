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
        const { searchTerm, page = 1, limit = 10 } = req.body;
    
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
    
        const users = await User.find(query)
          .skip(skip)
          .limit(limit);
    
        return res.status(200).json({
          count: users.length,
          currentPage: page,
          totalPages: Math.ceil(totalUsersCount / limit),
          data: users,
        });
      } catch (error) {
        console.log(error.message);
        res.status(500).send({ message: error.message });
      }
});



// Your existing route for adding users
router.post('/add', verifyToken, async (req, res) => {
    try {
        const users = req.body; // Assuming an array of users

        // Loop through the array and create users
        for (const user of users) {
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
        res.status(201).send({ message: 'User created successfully'});
    } catch (error) {
        console.log(error.message);
        res.status(500).send({ message: error.message });
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
            address: user.address,
            contact: user.contact,
            precinct_number: user.precinct_number
             
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
            address: req.body.address,
            contact: req.body.contact,
            precinct_number: req.body.precinct_number
        };

        const user = await User.findByIdAndUpdate(userId, updatedUser, { new: true });

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        return res.status(200).json({ message: 'User updated successfully', user });
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
