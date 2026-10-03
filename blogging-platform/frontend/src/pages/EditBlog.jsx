import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../services/api";

function EditBlog() {

    const { id } = useParams();
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        title: "",
        content: "",
        category: "",
        tags: "",
        status: "published"
    });

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        fetchBlog();
    }, [id]);

    const fetchBlog = async () => {

        try {

            const response = await api.get(
                `/blogs/${id}`
            );

            const blog = response.data.blog;

            setFormData({
                title: blog.title || "",
                content: blog.content || "",
                category: blog.category || "",
                tags: blog.tags
                    ? blog.tags.join(", ")
                    : "",
                status: blog.status || "published"
            });

        } catch (error) {

            console.error(error);

            setError("Failed to fetch blog");

        } finally {

            setLoading(false);

        }
    };

    const handleChange = (e) => {

        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });

    };

    const handleSubmit = async (e) => {

        e.preventDefault();

        setError("");

        try {

            const blogData = {
                title: formData.title,
                content: formData.content,
                category: formData.category,
                tags: formData.tags
                    .split(",")
                    .map(tag => tag.trim())
                    .filter(tag => tag !== ""),
                status: formData.status
            };

            await api.put(
                `/blogs/${id}`,
                blogData
            );

            navigate(`/blogs/${id}`);

        } catch (error) {

            console.error(error);

            setError(
                error.response?.data?.message ||
                "Failed to update blog"
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

    if (error && !formData.title) {

        return (
            <main>
                <h2>{error}</h2>
            </main>
        );

    }

    return (
        <main>

            <div className="editor-header">

                <div>
                    <h1>Edit Blog</h1>

                    <p>
                        Update your blog and keep your content
                        up to date.
                    </p>
                </div>

            </div>

            <form
                onSubmit={handleSubmit}
                className="blog-editor-form"
            >

                <div className="form-group">

                    <label>Title</label>

                    <input
                        type="text"
                        name="title"
                        value={formData.title}
                        onChange={handleChange}
                        placeholder="Enter blog title"
                        required
                    />

                </div>

                <div className="form-group">

                    <label>Content</label>

                    <textarea
                        name="content"
                        value={formData.content}
                        onChange={handleChange}
                        placeholder="Write your blog..."
                        rows="12"
                        required
                    />

                </div>

                <div className="form-row">

                    <div className="form-group">

                        <label>Category</label>

                        <input
                            type="text"
                            name="category"
                            value={formData.category}
                            onChange={handleChange}
                            placeholder="e.g. Technology"
                            required
                        />

                    </div>

                    <div className="form-group">

                        <label>Status</label>

                        <select
                            name="status"
                            value={formData.status}
                            onChange={handleChange}
                        >
                            <option value="published">
                                Published
                            </option>

                            <option value="draft">
                                Draft
                            </option>
                        </select>

                    </div>

                </div>

                <div className="form-group">

                    <label>Tags</label>

                    <input
                        type="text"
                        name="tags"
                        value={formData.tags}
                        onChange={handleChange}
                        placeholder="technology, coding, javascript"
                    />

                    <small>
                        Separate multiple tags with commas.
                    </small>

                </div>

                {error && (
                    <p className="error-message">
                        {error}
                    </p>
                )}

                <div className="editor-actions">

                    <button
                        type="button"
                        className="cancel-button"
                        onClick={() =>
                            navigate(`/blogs/${id}`)
                        }
                    >
                        Cancel
                    </button>

                    <button
                        type="submit"
                        className="auth-button"
                    >
                        Update Blog
                    </button>

                </div>

            </form>

        </main>
    );
}

export default EditBlog;