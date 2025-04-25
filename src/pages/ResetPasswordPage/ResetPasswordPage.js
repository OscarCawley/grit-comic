import React from 'react';
import ResetPassword from '../../components/ResetPassword/ResetPassword.js';
import './ResetPasswordPage.css';
import { Link } from 'react-router-dom';

const ResetPasswordPage = () => {
    return (
        <div className='reset-password-page'>
            <h1>Reset Password</h1>
            <ResetPassword />
            <p>If you remember your password, <Link to="/login"><button>Login</button></Link></p>
        </div>
    );
};

export default ResetPasswordPage;