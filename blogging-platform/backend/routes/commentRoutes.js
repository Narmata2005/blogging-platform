const express = require("express");
const { createComment ,getComments,deleteComment } = require("../controllers/commentController");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/:blogId/comments", authMiddleware, createComment);
router.get("/:blogId/comments", getComments);
router.delete("/comments/:commentId", authMiddleware, deleteComment);   
module.exports = router;