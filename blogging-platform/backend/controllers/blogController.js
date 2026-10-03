const Blog = require("../models/Blog");
const mongoose = require("mongoose");
const Comment = require("../models/Comment");
const Like = require("../models/Like");


// Create Blog
const createBlog = async (req, res) => {
    try {
        let {
            title,
            content,
            category,
            tags,
            status
        } = req.body;


        // Required fields
        if (
            !title ||
            !content ||
            !category
        ) {
            return res.status(400).json({
                message:
                    "Title, content and category are required"
            });
        }


        // Remove unnecessary spaces
        title = title.trim();
        content = content.trim();
        category = category.trim();


        // Validate required fields after trimming
        if (!title) {
            return res.status(400).json({
                message:
                    "Title cannot be empty"
            });
        }

        if (!content) {
            return res.status(400).json({
                message:
                    "Content cannot be empty"
            });
        }

        if (!category) {
            return res.status(400).json({
                message:
                    "Category cannot be empty"
            });
        }


        // Title length
        if (title.length < 3) {
            return res.status(400).json({
                message:
                    "Title must be at least 3 characters long"
            });
        }


        // Content length
        if (content.length < 10) {
            return res.status(400).json({
                message:
                    "Content must be at least 10 characters long"
            });
        }


        // Tags validation
        if (
            tags !== undefined &&
            !Array.isArray(tags)
        ) {
            return res.status(400).json({
                message:
                    "Tags must be an array"
            });
        }


        // Clean tags
        if (Array.isArray(tags)) {
            tags = tags
                .map((tag) =>
                    String(tag).trim()
                )
                .filter(
                    (tag) => tag !== ""
                );
        }


        // Validate status
        if (
            status !== undefined &&
            status !== "published" &&
            status !== "draft"
        ) {
            return res.status(400).json({
                message:
                    "Status must be either published or draft"
            });
        }


        const blog =
            await Blog.create({
                title,
                content,
                category,
                tags: tags || [],
                status:
                    status || "published",
                author: req.user.id
            });


        res.status(201).json({
            message:
                "Blog created successfully",
            blog
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            message:
                "Failed to create blog",
            error: error.message
        });
    }
};


// Get all blogs with search, category filter and pagination
const getBlogs = async (req, res) => {
    try {
        let {
            page = 1,
            limit = 6,
            search = "",
            category = ""
        } = req.query;


        page = parseInt(page);
        limit = parseInt(limit);


        if (
            isNaN(page) ||
            page < 1
        ) {
            page = 1;
        }


        if (
            isNaN(limit) ||
            limit < 1
        ) {
            limit = 6;
        }


        if (limit > 50) {
            limit = 50;
        }


        search =
            String(search).trim();

        category =
            String(category).trim();


        const filter = {};


        // Search in title or content
        if (search) {
            filter.$or = [
                {
                    title: {
                        $regex: search,
                        $options: "i"
                    }
                },
                {
                    content: {
                        $regex: search,
                        $options: "i"
                    }
                }
            ];
        }


        // Filter by category
        if (category) {
            filter.category = category;
        }


        const skip =
            (page - 1) * limit;


        const totalBlogs =
            await Blog.countDocuments(
                filter
            );


        const blogs =
            await Blog.find(filter)
                .populate(
                    "author",
                    "username email"
                )
                .sort({
                    createdAt: -1
                })
                .skip(skip)
                .limit(limit);


        const totalPages =
            Math.ceil(
                totalBlogs / limit
            );


        res.status(200).json({
            blogs,

            pagination: {
                currentPage: page,
                totalPages,
                totalBlogs,
                limit
            }
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            message:
                "Failed to fetch blogs",
            error: error.message
        });
    }
};


// Get current user's blogs
const getMyBlogs = async (req, res) => {
    try {
        const userId = req.user.id;


        const blogs =
            await Blog.find({
                author: userId
            })
                .populate(
                    "author",
                    "username email"
                )
                .sort({
                    createdAt: -1
                });


        res.status(200).json({
            blogs
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            message:
                "Failed to fetch your blogs",
            error: error.message
        });
    }
};


// Get blog by ID
const getBlogById = async (req, res) => {
    try {
        const { id } =
            req.params;


        if (
            !mongoose.Types.ObjectId.isValid(
                id
            )
        ) {
            return res.status(400).json({
                message:
                    "Invalid blog ID"
            });
        }


        const blog =
            await Blog.findById(id)
                .populate(
                    "author",
                    "username email"
                );


        if (!blog) {
            return res.status(404).json({
                message:
                    "Blog not found"
            });
        }


        res.status(200).json({
            blog
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            message:
                "Failed to fetch blog",
            error: error.message
        });
    }
};


// Update Blog
const updateBlog = async (req, res) => {
    try {
        const { id } =
            req.params;


        if (
            !mongoose.Types.ObjectId.isValid(
                id
            )
        ) {
            return res.status(400).json({
                message:
                    "Invalid blog ID"
            });
        }


        const blog =
            await Blog.findById(id);


        if (!blog) {
            return res.status(404).json({
                message:
                    "Blog not found"
            });
        }


        // Ownership check
        if (
            String(blog.author) !==
            String(req.user.id)
        ) {
            return res.status(403).json({
                message:
                    "You are not authorized to update this blog"
            });
        }


        let {
            title,
            content,
            category,
            tags,
            status
        } = req.body;


        // Validate fields if provided
        if (
            title !== undefined
        ) {
            if (
                typeof title !==
                "string"
            ) {
                return res.status(400).json({
                    message:
                        "Title must be a string"
                });
            }

            title =
                title.trim();

            if (!title) {
                return res.status(400).json({
                    message:
                        "Title cannot be empty"
                });
            }

            if (title.length < 3) {
                return res.status(400).json({
                    message:
                        "Title must be at least 3 characters long"
                });
            }
        }


        if (
            content !== undefined
        ) {
            if (
                typeof content !==
                "string"
            ) {
                return res.status(400).json({
                    message:
                        "Content must be a string"
                });
            }

            content =
                content.trim();

            if (!content) {
                return res.status(400).json({
                    message:
                        "Content cannot be empty"
                });
            }

            if (content.length < 10) {
                return res.status(400).json({
                    message:
                        "Content must be at least 10 characters long"
                });
            }
        }


        if (
            category !== undefined
        ) {
            if (
                typeof category !==
                "string"
            ) {
                return res.status(400).json({
                    message:
                        "Category must be a string"
                });
            }

            category =
                category.trim();

            if (!category) {
                return res.status(400).json({
                    message:
                        "Category cannot be empty"
                });
            }
        }


        // Tags validation
        if (
            tags !== undefined
        ) {
            if (
                !Array.isArray(tags)
            ) {
                return res.status(400).json({
                    message:
                        "Tags must be an array"
                });
            }

            tags =
                tags
                    .map((tag) =>
                        String(tag).trim()
                    )
                    .filter(
                        (tag) =>
                            tag !== ""
                    );
        }


        // Status validation
        if (
            status !== undefined &&
            status !== "published" &&
            status !== "draft"
        ) {
            return res.status(400).json({
                message:
                    "Status must be either published or draft"
            });
        }


        // Update only supplied fields
        if (
            title !== undefined
        ) {
            blog.title = title;
        }

        if (
            content !== undefined
        ) {
            blog.content = content;
        }

        if (
            category !== undefined
        ) {
            blog.category =
                category;
        }

        if (
            tags !== undefined
        ) {
            blog.tags = tags;
        }

        if (
            status !== undefined
        ) {
            blog.status = status;
        }


        await blog.save();


        res.status(200).json({
            message:
                "Blog updated successfully",
            blog
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            message:
                "Failed to update blog",
            error: error.message
        });
    }
};


// Delete Blog
const deleteBlog = async (req, res) => {
    try {
        const { id } =
            req.params;


        if (
            !mongoose.Types.ObjectId.isValid(
                id
            )
        ) {
            return res.status(400).json({
                message:
                    "Invalid blog ID"
            });
        }


        const blog =
            await Blog.findById(id);


        if (!blog) {
            return res.status(404).json({
                message:
                    "Blog not found"
            });
        }


        // Ownership check
        if (
            String(blog.author) !==
            String(req.user.id)
        ) {
            return res.status(403).json({
                message:
                    "You are not authorized to delete this blog"
            });
        }


        // Delete related comments
        await Comment.deleteMany({
            blog: id
        });


        // Delete related likes
        await Like.deleteMany({
            blog: id
        });


        // Delete blog
        await Blog.findByIdAndDelete(
            id
        );


        res.status(200).json({
            message:
                "Blog and related data deleted successfully"
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            message:
                "Failed to delete blog",
            error: error.message
        });
    }
};


module.exports = {
    createBlog,
    getBlogs,
    getMyBlogs,
    getBlogById,
    updateBlog,
    deleteBlog
};

