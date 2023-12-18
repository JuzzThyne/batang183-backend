// tokenVerification.js
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config();

// Function to verify if a token is valid
export const verifyToken = (token) => {
    try {
        // Verify the token with the secret key and check for expiration
        const decoded = jwt.verify(token, process.env.SECRET_KEY, { maxAge: '1h' });

        // If the decoding is successful, the token is valid
        return true;
    } catch (error) {
        // Check if the error is due to token expiration
        if (error.name === 'TokenExpiredError') {
            return false; // Token has expired
        } else {
            return false; // Other verification errors
        }
    }
};
