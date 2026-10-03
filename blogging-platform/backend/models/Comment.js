const mongoose = require("mongoose");

const commentSchema = new mongoose.Schema({

    content: {
        type: String,
        required: true,
        trim: true
    },

    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },

    blog: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Blog",
        required: true
    }

}, {
    timestamps: true
});

commentSchema.index({ blog: 1, createdAt: -1 });

module.exports = mongoose.model("Comment", commentSchema);