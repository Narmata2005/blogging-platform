const authRoutes = require("./routes/authRoutes");
const blogRoutes = require("./routes/blogRoutes");
const commentRoutes = require("./routes/commentRoutes");
const likeRoutes = require("./routes/likeRoutes");

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dns = require("dns");  //DNS resolves domain names to IP addresses. In our project, I used Node's DNS configuration to work around a local DNS resolution issue when connecting to MongoDB Atlas.
const helmet = require("helmet");

require("dotenv").config();


// Check required environment variables
if (!process.env.MONGO_URI) {
    console.error(
        "MONGO_URI is missing from the .env file"
    );
    process.exit(1);
}

if (!process.env.JWT_SECRET) {
    console.error(
        "JWT_SECRET is missing from the .env file"
    );
    process.exit(1);
}

if (!process.env.FRONTEND_URL) {
    console.error(
        "FRONTEND_URL is missing from the .env file"
    );
    process.exit(1);
}


// DNS configuration
dns.setServers(["8.8.8.8"]);


const app = express();


// Security middleware
app.use(helmet());


// CORS configuration
app.use(
    cors({
        origin: process.env.FRONTEND_URL,
        methods: [
            "GET",
            "POST",
            "PUT",
            "DELETE"
        ],
        allowedHeaders: [
            "Content-Type",
            "Authorization"
        ]
    })
);


// Request body size limit
app.use(
    express.json({
        limit: "10kb"
    })
);


// Routes
app.use("/api/auth", authRoutes);
app.use("/api/blogs", blogRoutes);
app.use("/api/blogs", commentRoutes);
app.use("/api/blogs", likeRoutes);


// Root route
app.get("/", (req, res) => {
    res.send(
        "Blogging Platform Backend is running"
    );
});


// 404 handler
app.use((req, res) => {
    res.status(404).json({
        message: "Route not found"
    });
});


// Global error handler
app.use((err, req, res, next) => {
    console.error(err.stack);

    // Invalid JSON
    if (
        err instanceof SyntaxError &&
        err.status === 400 &&
        "body" in err
    ) {
        return res.status(400).json({
            message: "Invalid JSON format"
        });
    }

    res.status(500).json({
        message: "Something went wrong"
    });
});


// Connect to MongoDB
mongoose.connect(
    process.env.MONGO_URI,
    {
        family: 4   // Use IPv4 to avoid DNS resolution issues with MongoDB Atlas
    }
)
    .then(() => {
        console.log("MongoDB connected");

        app.listen(5000, () => {
            console.log(
                "Server running on port 5000"
            );
        });
    })
    .catch((error) => {
        console.error(
            "MongoDB connection failed:",
            error.message
        );
    });
