// userModel.js
import mongoose from "mongoose";

const capitalizeFirstLetter = (value) => {
    return value.charAt(0).toUpperCase() + value.slice(1).toLowerCase();
};

const userSchema = mongoose.Schema(
    {
        first_name: {
            type: String,
            required: [true, "First name is required"],
            validate: {
                validator: (value) => /^[A-Za-z]+$/.test(value), // Only letters allowed
                message: "First name should contain only letters.",
            },
            set: capitalizeFirstLetter, // Capitalize the first letter
        },
        middle_name: {
            type: String,
            required: [true, "Middle name is required"],
            validate: {
                validator: (value) => /^[A-Za-z]+$/.test(value), // Only letters allowed
                message: "Middle name should contain only letters.",
            },
            set: capitalizeFirstLetter, // Capitalize the first letter
        },
        last_name: {
            type: String,
            required: [true, "Last name is required"],
            validate: {
                validator: (value) => /^[A-Za-z]+$/.test(value), // Only letters allowed
                message: "Last name should contain only letters.",
            },
            set: capitalizeFirstLetter, // Capitalize the first letter
        },
        birthdate: {
            type: Date,
            required: [true, "Birthdate is required"],
        },
        age: {
            type: Number, // Store the age directly
            required: true, // Age is now required in the model
        },
        gender: {
            type: String,
            required: [true, "Gender is required"],
        },
        address: {
            type: String,
            required: [true, "Address is required"],
        },
        contact: {
            type: Number,
            required: [true, "Contact number is required"],
        },
        precinct_number: {
            type: String,
            required: [true, "Precinct number is required"],
        },
    },
    {
        timestamps: {
            currentTime: () => new Date().toLocaleString("en-US", { timeZone: "Asia/Manila" })
        },
    }
);

export const User = mongoose.model('User', userSchema);
