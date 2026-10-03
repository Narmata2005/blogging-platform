import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

function CreateBlog() {

    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        title: "",
        content: "",
        category: "",
        tags: "",
        status: "published"
    });

    const [error, setError] = useState("");

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

            await api.post(
                "/blogs",
                blogData
            );

            navigate("/");

        } catch (error) {

            console.error(error);

            setError(
                error.response?.data?.message ||
                "Failed to create blog"
            );
        }
    };

    return (
        <main>

            <div className="editor-header">

                <div>
                    <h1>Create a New Blog</h1>

                    <p>
                        Share your thoughts, ideas and knowledge
                        with the community.
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
                        onClick={() => navigate("/")}
                    >
                        Cancel
                    </button>

                    <button
                        type="submit"
                        className="auth-button"
                    >
                        Publish Blog
                    </button>

                </div>

            </form>

        </main>
    );
}

export default CreateBlog;