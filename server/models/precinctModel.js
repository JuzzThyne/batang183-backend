import mongoose from "mongoose";

const precinctSchema = mongoose.Schema(
    {
        category_type: {
            type: String,
            required: [true, "Empty or Invalid"],
            enum: ["Barangay Level", "SK Level", "Both"]
        },
        precinct_number: {
            type: String,
            required: true,
        },
    },
    {
        timestamps: {
            currentTime: () => new Date().toLocaleString("en-US", { timeZone: "Asia/Manila" })
        },
    }
);

export const Precinct_Number = mongoose.model('Precinct_Number', precinctSchema);
