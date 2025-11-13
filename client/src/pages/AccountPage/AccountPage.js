import React, { useState, useContext } from 'react';
import axios from 'axios';
import './AccountPage.css';
import { UserContext, normalizeUser } from '../../context/UserContext';
import { Link } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';

const AccountPage = () => {
    const { user, signOut, setUser, ensureValidToken } = useContext(UserContext);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [isUpdatingSubscribe, setIsUpdatingSubscribe] = useState(false);
    const token = localStorage.getItem('token');
    
    const handleForgotPassword = async () => {
        if (!user?.email) {
            setError('Email address not available.');
            setTimeout(() => setError(''), 3000);
            return;
        }

        try {
            const response = await axios.post(`${process.env.REACT_APP_API_URL}/api/users/forgot-password`, {
                email: user.email
            });
            setMessage(response.data.message);
            setTimeout(() => setMessage(''), 3000); // clear after 3s
            setError('');
        } catch (err) {
            const errMsg = err.response?.data?.message || 'Something went wrong.';
            setError(errMsg);
            setTimeout(() => setError(''), 3000); // clear after 3s
            setMessage('');
        }
    };

    const handleToggleSubscribe = async () => {
        if (!user?.id) {
            setError('You need to be logged in to change your subscription.');
            setTimeout(() => setError(''), 3000); // clear after 3s
            return;
        }

        const nextSubscribe = !user.subscribe;
        setMessage('');
        setError('');
        setIsUpdatingSubscribe(true);

        try {
            const response = await axios.patch(`${process.env.REACT_APP_API_URL}/api/users/${user.id}/subscribe`, {
                subscribe: nextSubscribe
            });

            const data = response.data;

            if (data.token) {
                localStorage.setItem('token', data.token);
                const decodedUser = jwtDecode(data.token);
                setUser(normalizeUser(decodedUser));
            } else {
                setUser((prev) => (prev ? { ...prev, subscribe: nextSubscribe } : prev));
            }

            const successMsg =
                data.message ||
                (nextSubscribe ? 'You are subscribed to the newsletter.' : 'You have unsubscribed from the newsletter.');
            setMessage(successMsg);
            setTimeout(() => setMessage(''), 3000); // clear success after 3s
        } catch (err) {
            const errMsg = err.response?.data?.message || 'Unable to update subscription.';
            setError(errMsg);
            setTimeout(() => setError(''), 3000); // clear error after 3s
        } finally {
            setIsUpdatingSubscribe(false);
        }
    };

    const handleDelete = async () => {
        console.log('User:', user);
        const confirmed = window.confirm("Are you sure you want to delete your account? This cannot be undone.");
        if (!confirmed) return;

        const valid = await ensureValidToken();
        if (!valid) {
            alert("Session expired. Please log in again.");
            return;
        }

        try {
            await axios.delete(`${process.env.REACT_APP_API_URL}/api/users/delete-account`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            alert('Your account has been deleted.');
            signOut();
            window.location.href = '/';
        } catch (err) {
            alert(`Error: ${err.response?.data?.message || "Something went wrong"}`);
        }
    };

    return (
        <div className="account-page">
            <h1>My Account</h1>
            <div className='account-details'>
                <div className="account-info">
                    <h2>Account Info</h2>
                    <p><span>Username:</span> {user?.username}</p>
                    <p><span>Email:</span> {user?.email}</p>
                    <button onClick={handleDelete}>Delete Account</button>
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
                    {user?.auth === true && (
                        <Link
                            to="/admin"
                            onClick={async (e) => {
                                const valid = await ensureValidToken();
                                if (!valid) {
                                    e.preventDefault();
                                    window.location.href = '/login';
                                }
                            }}
                        >
                            <button>Admin</button>
                        </Link>
                    )}
                </div>
                {message && <p className="success-message">{message}</p>}
                {error && <p className="error-message">{error}</p>}
            </div>
        </div>
    );
};

export default AccountPage;
