import mongoose from "mongoose";

const sessionSchema = mongoose.Schema(
    {
        adminId: {
            type: String,
        },
        adminName: {
            type: String,
        },
        token: {
            type: String,
        },
        accountStatus: {
            type: String,
            enum: ["active", "inactive"],
            default: "active", // You can set a default value if needed
        },
        device: {
            type: String,
        },
        adminType: {
            type: String,
        }
    },
    {
        timestamps: {
            currentTime: () => new Date().toLocaleString("en-US", { timeZone: "Asia/Manila" })
        },
    }
);

export const Session = mongoose.model('Session', sessionSchema);
