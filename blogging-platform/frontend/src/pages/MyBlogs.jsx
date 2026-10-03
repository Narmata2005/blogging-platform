
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";

function MyBlogs() {
    const navigate = useNavigate();

    const [blogs, setBlogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        fetchMyBlogs();
    }, []);

    const fetchMyBlogs = async () => {
        try {
            setLoading(true);
            setError("");

            const response = await api.get(
                "/blogs/my-blogs"
            );

            setBlogs(response.data.blogs || []);

        } catch (error) {
            console.error(error);

            setError(
                error.response?.data?.message ||
                "Failed to fetch your blogs"
            );

        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (blogId) => {
        const confirmed = window.confirm(
            "Are you sure you want to delete this blog?"
        );

        if (!confirmed) {
            return;
        }

        try {
            await api.delete(
                `/blogs/${blogId}`
            );

            setBlogs(
                blogs.filter(
                    (blog) =>
                        blog._id !== blogId
                )
            );

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
                <h2>Loading your blogs...</h2>
            </main>
        );
    }

    return (
        <main>

            <div className="home-header">

                <div>
                    <h1>My Blogs</h1>

                    <p>
                        Manage the blogs you have
                        created.
                    </p>
                </div>

                <Link
                    to="/create-blog"
                    className="create-blog-button"
                >
                    + Create Blog
                </Link>

            </div>

            {error && (
                <p className="error-message">
                    {error}
                </p>
            )}

            {blogs.length === 0 ? (

                <div className="empty-state">

                    <h2>
                        You haven't created any blogs yet.
                    </h2>

                    <p>
                        Start sharing your thoughts
                        with the community.
                    </p>

                    <Link
                        to="/create-blog"
                        className="create-blog-button"
                    >
                        Create Your First Blog
                    </Link>

                </div>

            ) : (

                <div className="blog-grid">

                    {blogs.map((blog) => (

                        <article
                            className="blog-card"
                            key={blog._id}
                        >

                            <div className="blog-category">
                                {blog.category}
                            </div>

                            <h2>
                                {blog.title}
                            </h2>

                            <p>
                                {blog.content.length > 180
                                    ? blog.content.substring(
                                        0,
                                        180
                                    ) + "..."
                                    : blog.content}
                            </p>

                            {blog.tags &&
                                blog.tags.length > 0 && (

                                    <div className="blog-tags">

                                        {blog.tags.map(
                                            (tag, index) => (
                                                <span
                                                    key={index}
                                                >
                                                    #{tag}
                                                </span>
                                            )
                                        )}

                                    </div>

                                )}

                            <div className="my-blog-actions">

                                <Link
                                    to={`/blogs/${blog._id}`}
                                    className="read-more"
                                >
                                    View Blog →
                                </Link>

                                <Link
                                    to={`/edit-blog/${blog._id}`}
                                    className="edit-button"
                                >
                                    Edit
                                </Link>

                                <button
                                    onClick={() =>
                                        handleDelete(
                                            blog._id
                                        )
                                    }
                                    className="delete-button"
                                >
                                    Delete
                                </button>

                            </div>

                        </article>

                    ))}

                </div>

            )}

        </main>
    );
}

export default MyBlogs;
