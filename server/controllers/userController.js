import { User } from "../models/userModel.js";
import NodeCache from "node-cache";
import dotenv from 'dotenv';

const userCache = new NodeCache({ stdTTL: 300, checkperiod: 60 });

dotenv.config();

export const fetchUsersController = async (req, res) => {
    try {
        // Extracting parameters from the request body
        const { searchTerm, page = 1, limit = 10 } = req.body;
        const cacheKey = `users:${searchTerm || ''}:${page}:${limit}`;

        // Check if the data is already in the cache
        const cachedData = userCache.get(cacheKey);

        // If cached data is present, return it
        if (cachedData) {
            return res.status(200).json({
                count: cachedData.length,
                currentPage: page,
                totalPages: Math.ceil(cachedData.totalUsersCount / limit),
                data: cachedData.users,
            });
        }

        // If data is not in the cache, construct a query for user retrieval
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

        // Fetch a subset of users based on pagination parameters
        const skip = (page - 1) * limit;
        const users = await User.find(query).skip(skip).limit(limit);

        // Store the fetched data in the cache
        userCache.set(cacheKey, { users, totalUsersCount });

        // Return the fetched data in the response
        return res.status(200).json({
            count: users.length,
            currentPage: page,
            totalPages: Math.ceil(totalUsersCount / limit),
            data: users,
        });
    } catch (error) {
        // Handle errors and send a 500 Internal Server Error response
        console.log(error.message);
        res.status(500).send({ message: error.message });
    }
};

export const addMultipleUserController = async (req, res) => {
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
};

export const addSingleUserController = async (req, res) => {
    try {
        const user = req.body; // Assuming a single user object

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

        res.status(201).send({ message: 'User created successfully' });
    } catch (error) {
        console.log(error.message);
        res.status(500).send({ message: error.message });
    }
};

export const fetchSingleUserController = async (req, res) => {
    try {
        const userId = req.params.userId;
        const cacheKey = `user:${userId}`;

        // Check if the data is already in the cache
        const cachedUser = userCache.get(cacheKey);

        if (cachedUser) {
            return res.status(200).json({ data: cachedUser });
        }

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

        // Store the user data in the cache
        userCache.set(cacheKey, limitedUserData);

        return res.status(200).json({ data: limitedUserData });
    } catch (error) {
        console.log(error.message);
        res.status(500).send({ message: error.message });
    }
};

export const updateSingleUserController = async (req, res) => {
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

        return res.status(200).json({ message: 'User updated successfully'});
    } catch (error) {
        console.log(error.message);
        res.status(500).send({ message: error.message });
    }
};

export const deleteSingleUserController = async (req, res) => {
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
};

