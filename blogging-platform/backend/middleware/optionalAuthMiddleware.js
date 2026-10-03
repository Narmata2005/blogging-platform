
const jwt = require("jsonwebtoken");

const optionalAuthMiddleware = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        // No token is okay.
        // User can still access the likes count.
        if (
            !authHeader ||
            !authHeader.startsWith("Bearer ")
        ) {
            req.user = null;
            return next();
        }

        const token = authHeader.split(" ")[1];

        if (!token) {
            req.user = null;
            return next();
        }

        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET
        );

        req.user = decoded;

        next();

    } catch (error) {
        // If token is invalid or expired,
        // treat the user as logged out.
        req.user = null;

        next();
    }
};

module.exports = optionalAuthMiddleware;
