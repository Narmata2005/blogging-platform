const mongoose = require("mongoose");

const blogSchema = new mongoose.Schema({

    title: {
        type: String,
        required: true,
        trim: true
    },

    content: {
        type: String,
        required: true,
        trim: true
    },

    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },

    category: {
        type: String,
        trim: true,
        required: true
    },

    tags: [{
        type: String,
        trim: true
    }],

    status: {
        type: String,
        enum: ["draft", "published"],
        default: "draft"
    }

}, {
    timestamps: true
});


/*
 * Indexes
 */

// Public blogs:
// status = published + newest first
blogSchema.index({
    status: 1,
    createdAt: -1
});

// User's blogs:
// author + newest first
blogSchema.index({
    author: 1,
    createdAt: -1
});

// Category filtering
blogSchema.index({
    category: 1
});

// Tag filtering
blogSchema.index({
    tags: 1
});


module.exports = mongoose.model("Blog", blogSchema);