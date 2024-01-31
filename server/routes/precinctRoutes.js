import express from "express";
import { Precinct_Number } from "../models/precinctModel.js";

const router = express.Router();

router.use(express.json());

// Create new precincts
router.post('/add', async (req, res) => {
    try {
        const users = req.body; // Assuming an array of user objects

        // Iterate through the array and check for existing precincts
        for (const user of users) {
            const existingPrecinctNumber = await Precinct_Number.findOne({
                category_type: user.category_type,
                precinct_number: user.precinct_number,
            });

            if (existingPrecinctNumber) {
                // Precinct with the same category type and number already exists, handle accordingly
                res.status(400).json({ message: 'Precinct Number already exists' });
                return;
            }
        }

        // If no existing precincts found, create new precincts
        const newPrecinctNumbers = users.map(user => ({
            category_type: user.category_type,
            precinct_number: user.precinct_number,
        }));

        await Precinct_Number.create(newPrecinctNumbers);

        res.status(201).json({ message: 'Precincts Added successfully' });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Get all precincts of a specific type
router.get('/:precinctType', async (req, res) => {
    try {
        const precinctType = req.params.precinctType;
        
        // Check if precinctType is "Both"
        if (precinctType.toLowerCase() === 'both') {
            // Fetch all precincts without filtering by category_type, sorted in ascending order
            const allPrecincts = await Precinct_Number.find().select('precinct_number').sort({ precinct_number: 1 });
            res.status(201).json({ list: allPrecincts });
        } else {
            // Query the database to find all precincts of the specified type, sorted in ascending order
            const precincts = await Precinct_Number.find({ category_type: precinctType }).select('precinct_number').sort({ precinct_number: 1 });
            res.status(201).json({ list: precincts });
        }

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});


export default router;
