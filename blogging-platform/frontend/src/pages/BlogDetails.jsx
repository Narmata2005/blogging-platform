
import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import api from "../services/api";

function BlogDetails() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [blog, setBlog] = useState(null);

    const [comments, setComments] = useState([]);
    const [commentContent, setCommentContent] = useState("");

    const [likeCount, setLikeCount] = useState(0);
    const [isLiked, setIsLiked] = useState(false);

    const [loading, setLoading] = useState(true);
    const [commentsLoading, setCommentsLoading] = useState(true);

    const [error, setError] = useState("");
    const [commentError, setCommentError] = useState("");
    const [likeError, setLikeError] = useState("");

    useEffect(() => {
        fetchBlog();
        fetchComments();
        fetchLikes();
    }, [id]);

    const fetchBlog = async () => {
        try {
            const response = await api.get(`/blogs/${id}`);

            setBlog(response.data.blog);
        } catch (error) {
            console.error(error);

            setError("Failed to fetch blog");
        } finally {
            setLoading(false);
        }
    };

    const fetchComments = async () => {
        try {
            const response = await api.get(
                `/blogs/${id}/comments`
            );

            setComments(response.data.comments || []);
        } catch (error) {
            console.error(error);

            setCommentError("Failed to fetch comments");
        } finally {
            setCommentsLoading(false);
        }
    };

    const fetchLikes = async () => {
        try {
            const response = await api.get(
                `/blogs/${id}/likes`
            );

            setLikeCount(response.data.count || 0);

            // Get current user's like status
            setIsLiked(response.data.liked || false);

        } catch (error) {
            console.error(error);

            setLikeError("Failed to fetch likes");
        }
    };

    const handleLike = async () => {
        const token = localStorage.getItem("token");

        // If user is not logged in,
        // take them to the login page.
        if (!token) {
            navigate("/login");
            return;
        }

        setLikeError("");

        try {
            if (isLiked) {

                const response = await api.delete(
                    `/blogs/${id}/like`
                );

                setLikeCount(
                    response.data.count
                );

                setIsLiked(false);

            } else {

                const response = await api.post(
                    `/blogs/${id}/like`
                );

                setLikeCount(
                    response.data.count
                );

                setIsLiked(true);
            }

        } catch (error) {
            console.error(error);

            setLikeError(
                error.response?.data?.message ||
                "Failed to update like"
            );
        }
    };

    const handleCommentSubmit = async (e) => {
        e.preventDefault();

        setCommentError("");

        if (!commentContent.trim()) {
            setCommentError(
                "Comment cannot be empty"
            );

            return;
        }

        try {
            await api.post(
                `/blogs/${id}/comments`,
                {
                    content: commentContent
                }
            );

            setCommentContent("");

            fetchComments();

        } catch (error) {
            console.error(error);

            setCommentError(
                error.response?.data?.message ||
                "Failed to add comment"
            );
        }
    };

    const handleDeleteComment = async (commentId) => {
        const confirmed = window.confirm(
            "Are you sure you want to delete this comment?"
        );

        if (!confirmed) {
            return;
        }

        try {
            await api.delete(
                `/blogs/comments/${commentId}`
            );

            setComments(
                comments.filter(
                    (comment) =>
                        comment._id !== commentId
                )
            );

        } catch (error) {
            console.error(error);

            setCommentError(
                error.response?.data?.message ||
                "Failed to delete comment"
            );
        }
    };

    const handleDeleteBlog = async () => {
        const confirmed = window.confirm(
            "Are you sure you want to delete this blog?"
        );

        if (!confirmed) {
            return;
        }

        try {
            await api.delete(
                `/blogs/${id}`
            );

            navigate("/");

        } catch (error) {
            console.error(error);

            setError(
                error.response?.data?.message ||
                "Failed to delete blog"
            );
        }
    };

    if (loading) {
        return (
            <main>
                <h2>Loading blog...</h2>
            </main>
        );
    }

    if (error) {
        return (
            <main>
                <h2>{error}</h2>
            </main>
        );
    }

    if (!blog) {
        return (
            <main>
                <h2>Blog not found</h2>
            </main>
        );
    }

    const loggedInUser = JSON.parse(
        localStorage.getItem("user")
    );

    const isOwner =
        loggedInUser &&
        blog.author &&
        String(blog.author._id) ===
            String(loggedInUser.id);

    return (
        <main>

            {/* BLOG DETAILS */}

            <article className="blog-details-card">

                <div className="blog-category">
                    {blog.category}
                </div>

                <h1>
                    {blog.title}
                </h1>

                <div className="blog-meta">
                    <span>
                        Status: {blog.status}
                    </span>
                </div>

                <hr />

                <div className="blog-content">
                    {blog.content}
                </div>

                {/* TAGS */}

                {blog.tags &&
                    blog.tags.length > 0 && (
                        <div className="blog-tags">

                            {blog.tags.map(
                                (tag, index) => (
                                    <span key={index}>
                                        #{tag}
                                    </span>
                                )
                            )}

                        </div>
                    )}

                {/* OWNER ACTIONS */}

                {isOwner && (
                    <div className="blog-actions">

                        <Link
                            to={`/edit-blog/${blog._id}`}
                            className="edit-button"
                        >
                            Edit Blog
                        </Link>

                        <button
                            onClick={handleDeleteBlog}
                            className="delete-button"
                        >
                            Delete Blog
                        </button>

                    </div>
                )}

                {/* LIKE SECTION */}

                <div className="like-section">

                    <button
                        onClick={handleLike}
                        className={
                            isLiked
                                ? "liked-button"
                                : ""
                        }
                    >
                        {isLiked
                            ? "♥ Liked"
                            : "♡ Like"}
                    </button>

                    <span>
                        {likeCount}{" "}
                        {likeCount === 1
                            ? "Like"
                            : "Likes"}
                    </span>

                    {likeError && (
                        <p className="error-message">
                            {likeError}
                        </p>
                    )}

                </div>

            </article>

            {/* COMMENTS */}

            <section className="comments-section">

                <h2>
                    Comments
                </h2>

                {/* COMMENT FORM */}

                {loggedInUser ? (
                    <form
                        onSubmit={handleCommentSubmit}
                        className="comment-form"
                    >

                        <textarea
                            value={commentContent}
                            onChange={(e) =>
                                setCommentContent(
                                    e.target.value
                                )
                            }
                            placeholder="Write a comment..."
                            rows="4"
                        />

                        <button type="submit">
                            Add Comment
                        </button>

                    </form>
                ) : (
                    <p className="login-comment-message">
                        Please login to add a comment.
                    </p>
                )}

                {commentError && (
                    <p className="error-message">
                        {commentError}
                    </p>
                )}

                {/* COMMENTS LIST */}

                <div className="comments-list">

                    {commentsLoading ? (
                        <p>
                            Loading comments...
                        </p>
                    ) : comments.length === 0 ? (
                        <p>
                            No comments yet.
                        </p>
                    ) : (
                        comments.map((comment) => {

                            const isCommentOwner =
                                loggedInUser &&
                                comment.user &&
                                String(
                                    comment.user._id
                                ) ===
                                    String(
                                        loggedInUser.id
                                    );

                            return (
                                <div
                                    className="comment"
                                    key={comment._id}
                                >

                                    <strong>
                                        {comment.user?.username ||
                                            "Unknown User"}
                                    </strong>

                                    <p>
                                        {comment.content}
                                    </p>

                                    {isCommentOwner && (
                                        <button
                                            onClick={() =>
                                                handleDeleteComment(
                                                    comment._id
                                                )
                                            }
                                        >
                                            Delete Comment
                                        </button>
                                    )}

                                </div>
                            );
                        })
                    )}

                </div>

            </section>

            {/* BACK TO HOME */}

            <Link
                to="/"
                className="back-home"
            >
                ← Back to Home
            </Link>

        </main>
    );
}

export default BlogDetails;
