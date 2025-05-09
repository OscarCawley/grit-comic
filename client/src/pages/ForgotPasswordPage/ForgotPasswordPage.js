import React, { useState } from 'react';
import './ForgotPasswordPage.css';
import { Link } from 'react-router-dom';

const ForgotPasswordPage = () => {

        const [email, setEmail] = useState('');
        const [message, setMessage] = useState('');
        const [error, setError] = useState('');
    
        const handleForgotPassword = async (e) => {
            e.preventDefault();
            try {
                const response = await fetch('http://localhost:5000/api/users/forgot-password', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email }),
                });
    
                const data = await response.json();
    
                if (!response.ok) {
                    throw new Error(data.message || 'Something went wrong');
                }
    
                setMessage(data.message);
                setError('');
            } catch (err) {
                setError(err.message);
                setMessage('');
            }
        };

    return (
        <div className='forgot-password-page'>
            <h1>Forgot Password</h1>
            <div>
                <form className="forgot-password-form" onSubmit={handleForgotPassword}>
                    <input
                        type="email"
                        placeholder="Enter your email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                    <button type="submit">Send Reset Email</button>
                </form>
                {message && <p className="success-message">{message}</p>}
                {error && <p className="error-message">{error}</p>}
            </div>
            <p>If you remember your password, <Link to="/login"><button>Login</button></Link></p>
        </div>
    );
};

export default ForgotPasswordPage;