import mongoose from "mongoose";
const adminSchema = mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
        },
        username: {
            type: String,
            required: true,
        },
        password: {
            type: String,
            required: true,
        },
        adminType: {
            type: String,
            required: true,
        }
    },
    {
        timestamps: {
            currentTime: () => new Date().toLocaleString("en-US", { timeZone: "Asia/Manila" })
        },
    }
);
adminSchema.index({ username: 1 }, { unique: true });
export const Admin = mongoose.model('Admin', adminSchema);
