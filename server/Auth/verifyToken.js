import dotenv from "dotenv";
dotenv.config();

// Middleware to verify JWT
const verifyToken = (req, res, next) => {
    const authorizationHeader = req.headers.authorization;
    
    if (!authorizationHeader) {
      return res.status(401).json({ message: "Missing token" });
    }
    const token = authorizationHeader.split(" ")[1]; // Extract the token from the Authorization header
  
    try {
      const decoded = jwt.verify(token, process.env.SECRET_KEY);
      req.user = decoded; // Attach the decoded user information to the request object
      next();
    } catch (error) {
      if (error.name === "TokenExpiredError") {
        return res.status(401).json({ message: "Token has expired" });
      } else {
        return res.status(401).json({ message: "Invalid token" });
      }
    }
  };

  export default verifyToken;