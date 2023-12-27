import mongoose from "mongoose";
const adminSchema = mongoose.Schema(
    {
        tokenstru: {
            type: String,
        },
        token: {
            type: String,
        },
    },
    {
        timestamps: true,
    }
);
export const Session = mongoose.model('Session', adminSchema);
