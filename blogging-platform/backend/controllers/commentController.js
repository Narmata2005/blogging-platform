
const mongoose = require("mongoose");
const Comment = require("../models/Comment");
const Blog = require("../models/Blog");
const User = require("../models/User");

const createComment = async (req, res) => {
    try {
        const { blogId } = req.params;
        const { content } = req.body;
        const userId = req.user.id;

        if (!mongoose.Types.ObjectId.isValid(blogId)) {
            return res.status(400).json({
                message: "Invalid blog ID"
            });
        }

        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({
                message: "Invalid user ID"
            });
        }

        const blog = await Blog.findById(blogId);

        if (!blog) {
            return res.status(404).json({
                message: "Blog not found"
            });
        }

        if (typeof content !== "string") {
            return res.status(400).json({
                message: "Comment content must be a string"
            });
        }

        const trimmedContent = content.trim();

        if (!trimmedContent) {
            return res.status(400).json({
                message: "Comment content is required"
            });
        }

        if (trimmedContent.length > 1000) {
            return res.status(400).json({
                message:
                    "Comment cannot exceed 1000 characters"
            });
        }

        const comment = await Comment.create({
            blog: blogId,
            user: userId,
            content: trimmedContent
        });

        await comment.populate("user", "username");

        res.status(201).json({
            message: "Comment added successfully",
            comment
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Failed to add comment"
        });
    }
};


const getComments = async (req, res) => {
    try {
        const { blogId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(blogId)) {
            return res.status(400).json({
                message: "Invalid blog ID"
            });
        }

        const blog = await Blog.findById(blogId);

        if (!blog) {
            return res.status(404).json({
                message: "Blog not found"
            });
        }

        let { page, limit } = req.query;

        page = parseInt(page) || 1;
        limit = parseInt(limit) || 10;

        if (page < 1) {
            page = 1;
        }

        if (limit < 1) {
            limit = 10;
        }

        if (limit > 50) {
            limit = 50;
        }

        const skip = (page - 1) * limit;

        /*
         * Only return comments whose author still exists.
         *
         * $lookup joins the comment with the User collection.
         * $unwind removes comments where no matching user exists.
         */
        const comments = await Comment.aggregate([
            {
                $match: {
                    blog: new mongoose.Types.ObjectId(blogId)
                }
            },
            {
                $lookup: {
                    from: "users",
                    localField: "user",
                    foreignField: "_id",
                    as: "user"
                }
            },
            {
                $unwind: "$user"
            },
            {
                $sort: {
                    createdAt: -1
                }
            },
            {
                $skip: skip
            },
            {
                $limit: limit
            },
            {
                $project: {
                    _id: 1,
                    blog: 1,
                    content: 1,
                    createdAt: 1,
                    updatedAt: 1,
                    user: {
                        _id: "$user._id",
                        username: "$user.username"
                    }
                }
            }
        ]);

        /*
         * Count only comments whose author still exists.
         */
        const totalCommentsResult =
            await Comment.aggregate([
                {
                    $match: {
                        blog:
                            new mongoose.Types.ObjectId(
                                blogId
                            )
                    }
                },
                {
                    $lookup: {
                        from: "users",
                        localField: "user",
                        foreignField: "_id",
                        as: "user"
                    }
                },
                {
                    $unwind: "$user"
                },
                {
                    $count: "total"
                }
            ]);

        const totalComments =
            totalCommentsResult.length > 0
                ? totalCommentsResult[0].total
                : 0;

        res.status(200).json({
            page,
            limit,
            totalComments,
            totalPages: Math.ceil(
                totalComments / limit
            ),
            comments
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Failed to fetch comments"
        });
    }
};


const deleteComment = async (req, res) => {
    try {
        const { commentId } = req.params;
        const userId = req.user.id;

        if (!mongoose.Types.ObjectId.isValid(commentId)) {
            return res.status(400).json({
                message: "Invalid comment ID"
            });
        }

        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({
                message: "Invalid user ID"
            });
        }

        const comment = await Comment.findById(commentId);

        if (!comment) {
            return res.status(404).json({
                message: "Comment not found"
            });
        }

        // Check whether the current user owns the comment.
        const isCommentOwner =
            comment.user &&
            comment.user.toString() ===
            userId.toString();

        const blog = await Blog.findById(comment.blog);

        if (!blog) {
            return res.status(404).json({
                message: "Blog not found"
            });
        }

        // Check whether the current user owns the blog.
        const isBlogAuthor =
            blog.author &&
            blog.author.toString() ===
            userId.toString();

        // Comment owner OR blog author can delete.
        if (!isCommentOwner && !isBlogAuthor) {
            return res.status(403).json({
                message:
                    "You are not allowed to delete this comment"
            });
        }

        await Comment.findByIdAndDelete(commentId);

        res.status(200).json({
            message: "Comment deleted successfully"
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Failed to delete comment"
        });
    }
};


module.exports = {
    createComment,
    getComments,
    deleteComment
};