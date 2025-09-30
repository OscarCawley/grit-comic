import React, { useContext } from "react";
import { Link } from "react-router-dom";
import "./Header.css";
import { UserContext } from "../../context/UserContext";

const Header = () => {
    const { user, signOut } = useContext(UserContext);

    return (
        <div className="header">
            <Link to="/" className="header-title-link">
                <h1>GRIT COMIC</h1>
            </Link>
            <div className="account-container">
                {user ? (
                    <div className="user-info">
                        <span>{user.username}</span>
                        <button onClick={signOut}>SIGN OUT</button>
                    </div>
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