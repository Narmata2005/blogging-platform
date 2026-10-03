import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

function Navbar() {

    const navigate = useNavigate();

    const [token, setToken] = useState(
        localStorage.getItem("token")
    );

    const user = JSON.parse(
        localStorage.getItem("user")
    );

    const handleLogout = () => {

        localStorage.removeItem("token");
        localStorage.removeItem("user");

        setToken(null);

        navigate("/login");
    };

    return (
        <nav>

            <div className="navbar-brand">

                <Link to="/">
                    <h2>Blogging Platform</h2>
                </Link>

            </div>

            <div className="navbar-links">

                <Link to="/">
                    Home
                </Link>

                {token && (
                    <>
                        <Link to="/create-blog">
                            Create Blog
                        </Link>

                        <span className="welcome-text">
                            Welcome, {user?.username}
                        </span>

                        <button
                            onClick={handleLogout}
                            className="logout-button"
                        >
                            Logout
                        </button>
                    </>
                )}

                {!token && (
                    <>
                        <Link to="/login">
                            Login
                        </Link>

                        <Link to="/register">
                            Register
                        </Link>
                        <Link to="/my-blogs">
    My Blogs
</Link>
                    </>
                )}

            </div>

        </nav>
    );
}

export default Navbar;