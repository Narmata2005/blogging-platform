
const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");


// Register User
const registerUser = async (req, res) => {
    try {
        let {
            username,
            email,
            password
        } = req.body;

        // Required fields
        if (
            !username ||
            !email ||
            !password
        ) {
            return res.status(400).json({
                message:
                    "Username, email and password are required"
            });
        }

        // Remove unnecessary spaces
        username = username.trim();
        email = email.trim().toLowerCase();

        // Username validation
        if (username.length < 3) {
            return res.status(400).json({
                message:
                    "Username must be at least 3 characters long"
            });
        }

        // Email validation
        const emailRegex =
            /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!emailRegex.test(email)) {
            return res.status(400).json({
                message:
                    "Please enter a valid email address"
            });
        }

        // Password validation
        if (password.length < 8) {
            return res.status(400).json({
                message:
                    "Password must be at least 8 characters long"
            });
        }

        // Check if user already exists
        const existingUser =
            await User.findOne({
                email
            });

        if (existingUser) {
            return res.status(400).json({
                message:
                    "User already exists"
            });
        }

        // Hash password
        const hashedPassword =
            await bcrypt.hash(
                password,
                10
            );

        // Create user
        const user =
            await User.create({
                username,
                email,
                password: hashedPassword
            });

        res.status(201).json({
            message:
                "User registered successfully",

            user: {
                id: user._id,
                username: user.username,
                email: user.email
            }
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            message:
                "Registration failed",
            error: error.message
        });
    }
};


// Login User
const loginUser = async (req, res) => {
    try {
        let {
            email,
            password
        } = req.body;

        // Required fields
        if (!email || !password) {
            return res.status(400).json({
                message:
                    "Email and password are required"
            });
        }

        // Normalize email
        email = email.trim().toLowerCase();

        // Find user
        const user =
            await User.findOne({
                email
            });

        if (!user) {
            return res.status(400).json({
                message:
                    "Invalid email or password"
            });
        }

        // Check password
        const isPasswordCorrect =
            await bcrypt.compare(
                password,
                user.password
            );

        if (!isPasswordCorrect) {
            return res.status(400).json({
                message:
                    "Invalid email or password"
            });
        }

        // Create JWT
        const token =
            jwt.sign(
                {
                    id: user._id,
                    role: user.role
                },
                process.env.JWT_SECRET,
                {
                    expiresIn: "1d"
                }
            );

        res.status(200).json({
            message:
                "Login successful",

            token,

            user: {
                id: user._id,
                username: user.username,
                email: user.email
            }
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            message:
                "Login failed",
            error: error.message
        });
    }
};


module.exports = {
    registerUser,
    loginUser
};

