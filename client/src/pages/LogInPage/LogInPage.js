import React, { useState, useContext } from 'react';
import './LogInPage.css';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { UserContext, normalizeUser } from '../../context/UserContext';
import { jwtDecode } from 'jwt-decode';

const LogInPage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [message, setMessage] = useState('');
    const navigate = useNavigate();
    const location = useLocation();
    const from = location.state?.from || "navbar";

    const { setUser } = useContext(UserContext);

    const handleLogin = async (e) => {
        e.preventDefault();
        setMessage('');

        try {
            // Send login request to backend
            const res = await axios.post(`${process.env.REACT_APP_API_URL}/api/users/login`, {
                email,
                password
            });

            // Store the JWT token in localStorage
            localStorage.setItem('token', res.data.token);

            // Decode token and update context
            const decodedUser = jwtDecode(res.data.token);
            setUser(normalizeUser(decodedUser));

            // Set success message
            setMessage('Logged in successfully!');

            // Clear message after 3 seconds
            setTimeout(() => {
                setMessage('');
                setEmail('');
                setPassword('');
                if (from === "admin") {
                    navigate('/admin');
                } else {
                    navigate('/');
                }
                
            }, 2000);

        } catch (err) {
            const errorMsg = err.response?.data?.message || err.message || 'Something went wrong';
            setMessage(errorMsg);

            // Clear message after 3 seconds
            setTimeout(() => setMessage(''), 3000);
        }
    };

    return (
        <div className='login-page'>
            <h1>Log In</h1>
            <form className='login-form' onSubmit={handleLogin}>
                <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />
                <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />
                <button type="submit">Log In</button>
                <p className={`message ${message ? 'visible' : 'hidden'}`}>{message || ' '}</p>
            </form>
            <p>Don't have an account? <Link to="/signup"><button>Sign Up</button></Link></p>
            <p>Forgot your password? <Link to="/forgot-password"><button>Reset Password</button></Link></p>
        </div>
    );
};

export default LogInPage;