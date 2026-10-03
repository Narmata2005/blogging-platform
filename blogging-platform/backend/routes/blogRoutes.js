
const express = require("express");

const {
    createBlog,
    getBlogs,
    getMyBlogs,
    getBlogById,
    updateBlog,
    deleteBlog
} = require("../controllers/blogController");

const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();


// Create blog
router.post(
    "/",
    authMiddleware,
    createBlog
);


// Get all blogs
router.get(
    "/",
    getBlogs
);


// Get current user's blogs
router.get(
    "/my-blogs",
    authMiddleware,
    getMyBlogs
);


// Get blog by ID
router.get(
    "/:id",
    getBlogById
);


// Update blog
router.put(
    "/:id",
    authMiddleware,
    updateBlog
);


// Delete blog
router.delete(
    "/:id",
    authMiddleware,
    deleteBlog
);


module.exports = router;

