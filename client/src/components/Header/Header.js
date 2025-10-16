import React, { useContext } from "react";
import { Link } from "react-router-dom";
import "./Header.css";
import { UserContext } from "../../context/UserContext";
import logo from "../../assets/icons/grit-logo.png";

const Header = () => {
    const { user } = useContext(UserContext);

    return (
        <div className="header">
            <Link to="/" className="header-title-link">
                <img className="grit-logo" src={logo} alt="GRIT Logo" />
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