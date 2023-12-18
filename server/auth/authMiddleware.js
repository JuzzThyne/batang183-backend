// authMiddleware.js
import jwt from "jsonwebtoken";

const authenticateToken = (request, response, next) => {
    const tokenHeader = request.headers.authorization;

    if (!tokenHeader) {
        return response.status(401).send({ message: 'Missing Authorization header' });
    }

    const token = tokenHeader.split(' ')[1];

    if (token) {
        try {
            const decodedToken = jwt.verify(token, process.env.SECRET_KEY);
            request.user = decodedToken;
            next();
        } catch (error) {
            return response.status(401).send({ message: 'Invalid token' });
        }
    } else {
        return response.status(401).send({ message: 'Invalid or missing token' });
    }
};

export default authenticateToken;
