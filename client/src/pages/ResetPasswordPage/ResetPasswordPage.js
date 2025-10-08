import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import './ResetPasswordPage.css';
import axios from 'axios';

const ResetPasswordPage = () => {
    const [searchParams] = useSearchParams();
    const token = searchParams.get('token');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [message, setMessage] = useState('');
    const navigate = useNavigate();

    const handleResetPassword = async (e) => {
        e.preventDefault();
        setMessage('');

        if (password !== confirmPassword) {
            setMessage('Passwords do not match');
            setTimeout(() => setMessage(''), 3000);
            return;
        }

        try {
            const res = await axios.put(`${process.env.REACT_APP_API_URL}/api/users/reset-password`, {
                token,
                password,
            });

            setMessage(res.data.message);
            setTimeout(() => {
                setMessage('');
                navigate('/login');
            }, 3000);
        } catch (err) {
            const errorMsg = err.response?.data?.message || err.message || 'Something went wrong';
            setMessage(errorMsg);
            setTimeout(() => setMessage(''), 3000);
        }
    };

    return (
        <div className="reset-password-page">
            <h1>Reset Password</h1>
            <form className="reset-password-form" onSubmit={handleResetPassword}>
                <input
                    type="password"
                    placeholder="Enter new password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />
                <input
                    type="password"
                    placeholder="Confirm new password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                />
                <button type="submit">Reset Password</button>
                <p className={`message ${message ? 'visible' : 'hidden'}`}>{message || ' '}</p>
            </form>
        </div>
    );
};

export default ResetPasswordPage;