import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import './Header.css';

const Header = () => {
    const [user, setUser] = useState(null);

    useEffect(() => {
        // Check if the user is logged in by looking for a token in localStorage
        const token = localStorage.getItem('token');

        if (token) {
            console.log('Token found:', token);
            // Here you might want to decode the token or make an API call to get user info
            const decodedUser = jwtDecode(token); // Use a library to decode the JWT
            setUser(decodedUser); // Update the user state with decoded user data
        } else {
            console.log('No token found, user is not logged in.');
            setUser(null); // No token, so set user to null
        }
    }, []); // Run only once when component mounts

    const handleSignOut = () => {
        // Remove token and update user state
        localStorage.removeItem('token');
        setUser(null);
        alert('Signed out successfully!');
    };

    return (
        <div className='header'>
            <Link to='/' className='header-title-link'>
                <h1>GRIT COMIC</h1>
            </Link>
            <div className='account-container'>
                {user ? (
                    <div className="user-info">
                        <span>{user.username}</span>
                        <button onClick={handleSignOut}>SIGN OUT</button>
                    </div>
                ) : (
                    <Link to="/login"><button>LOGIN</button></Link>
                )}
            </div>
        </div>
    );
};

export default Header;