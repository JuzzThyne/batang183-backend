// tokenUtils.js
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config();

// Function to generate a JWT token
export const generateToken = (user) => {
    const payload = {
        userId: user._id,
        username: user.username,
        // You can add more information to the payload if needed
    };
    const token = jwt.sign(payload, process.env.SECRET_KEY, { expiresIn: '1h' }); // Adjust the expiration time as needed
    return token;
};
