import React, { useState } from 'react';
import './LogInPage.css';
import { Link, useNavigate } from 'react-router-dom';

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
            const res = await fetch('http://localhost:5000/api/users/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.message || 'Something went wrong');
            }

            // Store the JWT token in localStorage (or cookies, or context)
            localStorage.setItem('token', data.token);

            alert('Logged in successfully!');
            
            setEmail('');
            setPassword('');
            navigate('/');

        } catch (err) {
            setError(err.message);
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