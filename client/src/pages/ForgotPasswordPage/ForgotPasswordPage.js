import React, { useState } from 'react';
import './ForgotPasswordPage.css';
import { Link } from 'react-router-dom';

const ForgotPasswordPage = () => {
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');

    const handleForgotPassword = async (e) => {
        e.preventDefault();
        setMessage('');

        try {
            const response = await fetch(`${process.env.REACT_APP_API_URL}/api/users/forgot-password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Something went wrong');
            }

            // Show success message
            setMessage(data.message);

            // Clear message after 3 seconds
            setTimeout(() => setMessage(''), 3000);

        } catch (err) {
            // Show error message
            setMessage(err.message || 'Something went wrong');

            // Clear message after 3 seconds
            setTimeout(() => setMessage(''), 3000);
        }
    };

    return (
        <div className='forgot-password-page'>
            <h1>Forgot Password</h1>
            <form className="forgot-password-form" onSubmit={handleForgotPassword}>
                <input
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />
                <button type="submit">Send Reset Email</button>

                {/* Always rendered message element to reserve space */}
                <p className={`message ${message ? 'visible' : 'hidden'}`}>{message || ' '}</p>
            </form>

            <p>If you remember your password, <Link to="/login"><button>Login</button></Link></p>
        </div>
    );
};

export default ForgotPasswordPage;