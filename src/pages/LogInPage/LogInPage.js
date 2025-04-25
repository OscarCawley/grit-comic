import React from 'react';
import LogIn from '../../components/LogIn/LogIn.js';
import './LogInPage.css';

const LogInPage = () => {
    return (
        <div className='login-page'>
            <h1>Log In</h1>
            <LogIn />
            <p>Don't have an account? <a href="/signup">Sign Up</a></p>
            <p>Forgot your password? <a href="/reset-password">Reset Password</a></p>
        </div>
    );
};

export default LogInPage;