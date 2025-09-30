import React, { useState, useContext } from 'react';
import './LogInPage.css';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { UserContext } from '../../context/UserContext';
import { jwtDecode } from 'jwt-decode';

const LogInPage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const { setUser } = useContext(UserContext); // ✅ pull setUser from context

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');

        try {
            // Send login request to the backend
            const res = await axios.post(`${process.env.REACT_APP_API_URL}/api/users/login`, {
                email,
                password
            });

            // Store the JWT token in localStorage
            localStorage.setItem('token', res.data.token);

            // Decode the token and set the user in context
            const decodedUser = jwtDecode(res.data.token);
            setUser(decodedUser); // ✅ update context immediately

            alert('Logged in successfully!');
            
            setEmail('');
            setPassword('');
            navigate('/');

        } catch (err) {
            setError(err.response?.data?.message || err.message || 'Something went wrong');
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
                {error && <p>{error}</p>}
            </form>
            <p>Don't have an account? <Link to="/signup"><button>Sign Up</button></Link></p>
            <p>Forgot your password? <Link to="/forgot-password"><button>Reset Password</button></Link></p>
        </div>
    );
};

export default LogInPage;