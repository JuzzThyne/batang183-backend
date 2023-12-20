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
    },
    {
        timestamps: true,
    }
);
adminSchema.index({ username: 1 }, { unique: true });
export const Admin = mongoose.model('Admin', adminSchema);
