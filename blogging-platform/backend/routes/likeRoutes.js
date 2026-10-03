
const express = require("express");

const authMiddleware = require("../middleware/authMiddleware");
const optionalAuthMiddleware = require("../middleware/optionalAuthMiddleware");

const {
    likeBlog,
    getLikes,
    unlikeBlog
} = require("../controllers/likeController");

const router = express.Router();


// Like a blog
// Login required
router.post(
    "/:blogId/like",
    authMiddleware,
    likeBlog
);


// Get like count and current user's like status
// Login is optional
router.get(
    "/:blogId/likes",
    optionalAuthMiddleware,
    getLikes
);


// Unlike a blog
// Login required
router.delete(
    "/:blogId/like",
    authMiddleware,
    unlikeBlog
);


module.exports = router;
