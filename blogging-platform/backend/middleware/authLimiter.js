const rateLimit = require("express-rate-limit");

const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,

    max: 10,

    message: {
        message:
            "Too many authentication attempts. Please try again after 15 minutes."
    },

    standardHeaders: true,

    legacyHeaders: false
});

module.exports = authLimiter;

