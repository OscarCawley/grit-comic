import React, { useState, useContext } from 'react';
import './AccountPage.css';
import { UserContext, normalizeUser } from '../../context/UserContext';
import { Link } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';

const AccountPage = () => {
    const { user, signOut, setUser } = useContext(UserContext);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [isUpdatingSubscribe, setIsUpdatingSubscribe] = useState(false);

    const handleForgotPassword = async () => {
        if (!user?.email) {
            setError('Email address not available.');
            return;
        }

        try {
            const response = await fetch(`${process.env.REACT_APP_API_URL}/api/users/forgot-password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: user.email }),
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

    const handleToggleSubscribe = async () => {
        if (!user?.id) {
            setError('You need to be logged in to change your subscription.');
            return;
        }

        const nextSubscribe = !user.subscribe;
        setMessage('');
        setError('');
        setIsUpdatingSubscribe(true);

        try {
            const response = await fetch(`${process.env.REACT_APP_API_URL}/api/users/${user.id}/subscribe`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ subscribe: nextSubscribe }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Unable to update subscription.');
            }

            if (data.token) {
                localStorage.setItem('token', data.token);
                const decodedUser = jwtDecode(data.token);
                setUser(normalizeUser(decodedUser));
            } else {
                setUser((prev) => (prev ? { ...prev, subscribe: nextSubscribe } : prev));
            }

            setMessage(
                data.message ||
                (nextSubscribe ? 'You are subscribed to the newsletter.' : 'You have unsubscribed from the newsletter.')
            );
        } catch (err) {
            setError(err.message || 'Unable to update subscription.');
        } finally {
            setIsUpdatingSubscribe(false);
        }
    };

    return (
        <div className="account-page">
            <h1>My Account</h1>
            <div className="account-details">
                <h2>Account Details</h2>
                <p>{user?.username}</p>
                <p>{user?.email}</p>
                <p>Newsletter: {user?.subscribe ? 'Subscribed' : 'Not Subscribed'}</p>
            </div>
            <div className="account-actions">
                <button onClick={handleForgotPassword}>Reset Password</button>
                <Link to="/login">
                    <button onClick={signOut}>Sign Out</button>
                </Link>
                <button onClick={handleToggleSubscribe} disabled={isUpdatingSubscribe}>
                    {isUpdatingSubscribe
                        ? 'Updating...'
                        : user?.subscribe
                        ? 'Unsubscribe from Newsletter'
                        : 'Subscribe to Newsletter'}
                </button>
                {message && <p className="success-message">{message}</p>}
                {error && <p className="error-message">{error}</p>}
            </div>
        </div>
    );
};

export default AccountPage;
