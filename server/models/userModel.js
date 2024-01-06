import mongoose from "mongoose";

const userSchema = mongoose.Schema(
    {
        first_name: {
            type: String,
            required: true,
        },
        middle_name: {
            type: String,
            required: true,
        },
        last_name: {
            type: String,
            required: true,
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