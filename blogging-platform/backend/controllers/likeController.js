const mongoose = require("mongoose");
const Like = require("../models/Like");
const Blog = require("../models/Blog");


// Like a blog
const likeBlog = async (req, res) => {
    try {
        const { blogId } = req.params;
        const userId = req.user.id;

        // Validate blog ID
        if (!mongoose.Types.ObjectId.isValid(blogId)) {
            return res.status(400).json({
                message: "Invalid blog ID"
            });
        }

        // Check whether blog exists
        const blog = await Blog.findById(blogId);

        if (!blog) {
            return res.status(404).json({
                message: "Blog not found"
            });
        }

        // Check if user already liked the blog
        const existingLike = await Like.findOne({
            blog: blogId,
            user: userId
        });

        if (existingLike) {
            return res.status(400).json({
                message: "You have already liked this blog"
            });
        }

        // Create like
        await Like.create({
            blog: blogId,
            user: userId
        });

        // Get updated like count
        const likeCount = await Like.countDocuments({
            blog: blogId
        });

        res.status(201).json({
            message: "Blog liked successfully",
            liked: true,
            count: likeCount
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Failed to like blog",
            error: error.message
        });
    }
};


// Get likes and current user's like status
const getLikes = async (req, res) => {
    try {
        const { blogId } = req.params;

        // Validate blog ID
        if (!mongoose.Types.ObjectId.isValid(blogId)) {
            return res.status(400).json({
                message: "Invalid blog ID"
            });
        }

        // Check whether blog exists
        const blog = await Blog.findById(blogId);

        if (!blog) {
            return res.status(404).json({
                message: "Blog not found"
            });
        }

        // Get total likes
        const count = await Like.countDocuments({
            blog: blogId
        });

        let liked = false;

        // If user is logged in, check whether they liked it
        if (req.user?.id) {
            const existingLike = await Like.findOne({
                blog: blogId,
                user: req.user.id
            });

            liked = !!existingLike;
        }

        res.status(200).json({
            count,
            liked
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Failed to fetch likes",
            error: error.message
        });
    }
};


// Unlike a blog
const unlikeBlog = async (req, res) => {
    try {
        const { blogId } = req.params;
        const userId = req.user.id;

        // Validate blog ID
        if (!mongoose.Types.ObjectId.isValid(blogId)) {
            return res.status(400).json({
                message: "Invalid blog ID"
            });
        }

        const deletedLike = await Like.findOneAndDelete({
            blog: blogId,
            user: userId
        });

        if (!deletedLike) {
            return res.status(404).json({
                message: "You have not liked this blog"
            });
        }

        // Get updated like count
        const likeCount = await Like.countDocuments({
            blog: blogId
        });

        res.status(200).json({
            message: "Blog unliked successfully",
            liked: false,
            count: likeCount
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Failed to unlike blog",
            error: error.message
        });
    }
};


module.exports = {
    likeBlog,
    getLikes,
    unlikeBlog
};