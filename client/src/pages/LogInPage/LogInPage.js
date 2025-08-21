import React, { useState } from 'react';
import './LogInPage.css';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

const LogInPage = () => {

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');

        try {
            // Send login request to the backend
            const res = await axios.post(`${process.env.REACT_APP_API_URL}/api/users/login`, {
                email,
                password
            });

            // Store the JWT token in localStorage (or cookies, or context)
            localStorage.setItem('token', res.data.token);

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