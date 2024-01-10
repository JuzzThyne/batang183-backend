import mongoose from "mongoose";

const capitalizeFirstLetter = (value) => {
    return value.charAt(0).toUpperCase() + value.slice(1).toLowerCase();
};

const userSchema = mongoose.Schema(
    {
        first_name: {
            type: String,
            required: true,
            validate: {
                validator: (value) => /^[A-Za-z]+$/.test(value), // Only letters allowed
                message: "First name should contain only letters.",
            },
            set: capitalizeFirstLetter, // Capitalize the first letter
        },
        middle_name: {
            type: String,
            required: true,
            validate: {
                validator: (value) => /^[A-Za-z]+$/.test(value), // Only letters allowed
                message: "Middle name should contain only letters.",
            },
            set: capitalizeFirstLetter, // Capitalize the first letter
        },
        last_name: {
            type: String,
            required: true,
            validate: {
                validator: (value) => /^[A-Za-z]+$/.test(value), // Only letters allowed
                message: "Last name should contain only letters.",
            },
            set: capitalizeFirstLetter, // Capitalize the first letter
        },
        gender: {
            type: String,
            required: true,
        },
        address: {
            type: String,
            required: true,
        },
        contact: {
            type: Number,
            required: true,
        },
        precinct_number: {
            type: String,
            required: true,
        },
    },
    {
        timestamps: true,
    }
);

export const User = mongoose.model('User', userSchema);
