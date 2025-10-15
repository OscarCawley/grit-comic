import React, { useContext } from "react";
import { Link } from "react-router-dom";
import "./Header.css";
import { UserContext } from "../../context/UserContext";

const Header = () => {
    const { user } = useContext(UserContext);

    return (
        <div className="header">
            <Link to="/" className="header-title-link">
                <h1>GRIT</h1>
            </Link>
            <div className="account-container">
                {user ? (
                    <Link to="/account">
                        <button className="user">{user.username}</button>
                    </Link>
                ) : (
                    <Link to="/login">
                        <button>LOGIN</button>
                    </Link>
                )}
            </div>
        </div>
    );
};

export default Header;