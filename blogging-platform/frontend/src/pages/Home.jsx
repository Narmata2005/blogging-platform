
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";

function Home() {
    const [blogs, setBlogs] = useState([]);

    const [searchTerm, setSearchTerm] = useState("");
    const [selectedCategory, setSelectedCategory] =
        useState("All");

    const [categories, setCategories] = useState([]);

    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const blogsPerPage = 6;

    useEffect(() => {
        fetchBlogs();
    }, [currentPage, searchTerm, selectedCategory]);

    const fetchBlogs = async () => {
        try {
            setLoading(true);
            setError("");

            const params = new URLSearchParams();

            params.append("page", currentPage);
            params.append("limit", blogsPerPage);

            if (searchTerm.trim()) {
                params.append(
                    "search",
                    searchTerm.trim()
                );
            }

            if (
                selectedCategory &&
                selectedCategory !== "All"
            ) {
                params.append(
                    "category",
                    selectedCategory
                );
            }

            const response = await api.get(
                `/blogs?${params.toString()}`
            );

            setBlogs(
                response.data.blogs || []
            );

            setTotalPages(
                response.data.pagination?.totalPages || 1
            );

        } catch (error) {
            console.error(error);

            setError(
                "Failed to fetch blogs"
            );

        } finally {
            setLoading(false);
        }
    };


    // Get categories from the backend
    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        try {
            const response = await api.get(
                "/blogs?limit=50"
            );

            const allBlogs =
                response.data.blogs || [];

            const uniqueCategories = [
                ...new Set(
                    allBlogs
                        .map(
                            (blog) =>
                                blog.category
                        )
                        .filter(
                            (category) =>
                                category
                        )
                )
            ];

            setCategories(
                uniqueCategories
            );

        } catch (error) {
            console.error(error);
        }
    };


    const clearFilters = () => {
        setSearchTerm("");
        setSelectedCategory("All");
        setCurrentPage(1);
    };


    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
        setCurrentPage(1);
    };


    const handleCategoryChange = (e) => {
        setSelectedCategory(
            e.target.value
        );
        setCurrentPage(1);
    };


    const handlePageChange = (page) => {
        if (
            page < 1 ||
            page > totalPages
        ) {
            return;
        }

        setCurrentPage(page);

        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });
    };


    if (loading) {
        return (
            <main>
                <h2>
                    Loading blogs...
                </h2>
            </main>
        );
    }


    if (error) {
        return (
            <main>
                <h2>
                    {error}
                </h2>
            </main>
        );
    }


    return (
        <main>

            <div className="home-header">

                <div>

                    <h1>
                        Latest Blogs
                    </h1>

                    <p>
                        Discover interesting stories,
                        ideas and knowledge from our
                        community.
                    </p>

                </div>

                {localStorage.getItem("token") && (
                    <Link
                        to="/create-blog"
                        className="create-blog-button"
                    >
                        + Create Blog
                    </Link>
                )}

            </div>


            <div className="blog-filters">

                <div className="search-box">

                    <input
                        type="text"
                        placeholder="Search blogs..."
                        value={searchTerm}
                        onChange={
                            handleSearchChange
                        }
                    />

                </div>


                <div className="category-filter">

                    <select
                        value={
                            selectedCategory
                        }
                        onChange={
                            handleCategoryChange
                        }
                    >

                        <option value="All">
                            All Categories
                        </option>

                        {categories.map(
                            (category) => (
                                <option
                                    key={category}
                                    value={category}
                                >
                                    {category}
                                </option>
                            )
                        )}

                    </select>

                </div>


                {(searchTerm ||
                    selectedCategory !==
                        "All") && (

                    <button
                        onClick={clearFilters}
                        className="clear-filter-button"
                    >
                        Clear
                    </button>

                )}

            </div>


            {blogs.length === 0 ? (

                <div className="empty-state">

                    <h2>
                        No blogs found
                    </h2>

                    <p>
                        Try a different search
                        term or category.
                    </p>

                    {(searchTerm ||
                        selectedCategory !==
                            "All") && (

                        <button
                            onClick={clearFilters}
                            className="create-blog-button"
                        >
                            Clear Filters
                        </button>

                    )}

                </div>

            ) : (

                <div className="blog-grid">

                    {blogs.map(
                        (blog) => (

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
                                    {blog.content.length >
                                        180
                                        ? blog.content.substring(
                                            0,
                                            180
                                        ) + "..."
                                        : blog.content}
                                </p>


                                {blog.tags &&
                                    blog.tags.length >
                                        0 && (

                                        <div className="blog-tags">

                                            {blog.tags.map(
                                                (
                                                    tag,
                                                    index
                                                ) => (

                                                    <span
                                                        key={
                                                            index
                                                        }
                                                    >
                                                        #
                                                        {tag}
                                                    </span>

                                                )
                                            )}

                                        </div>

                                    )}


                                <Link
                                    to={`/blogs/${blog._id}`}
                                    className="read-more"
                                >
                                    Read More →
                                </Link>

                            </article>

                        )
                    )}

                </div>

            )}


            {totalPages > 1 && (

                <div className="pagination">

                    <button
                        onClick={() =>
                            handlePageChange(
                                currentPage - 1
                            )
                        }
                        disabled={
                            currentPage === 1
                        }
                    >
                        ← Previous
                    </button>


                    {Array.from(
                        {
                            length: totalPages
                        },
                        (_, index) =>
                            index + 1
                    ).map(
                        (page) => (

                            <button
                                key={page}
                                onClick={() =>
                                    handlePageChange(
                                        page
                                    )
                                }
                                className={
                                    currentPage ===
                                    page
                                        ? "active-page"
                                        : ""
                                }
                            >
                                {page}
                            </button>

                        )
                    )}


                    <button
                        onClick={() =>
                            handlePageChange(
                                currentPage + 1
                            )
                        }
                        disabled={
                            currentPage ===
                            totalPages
                        }
                    >
                        Next →
                    </button>

                </div>

            )}

        </main>
    );
}

export default Home;
