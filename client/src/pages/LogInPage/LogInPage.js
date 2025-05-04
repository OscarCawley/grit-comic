import React from 'react';
import LogIn from '../../components/LogIn/LogIn.js';
import './LogInPage.css';
import { Link } from 'react-router-dom';

const LogInPage = () => {
    return (
        <div className='login-page'>
            <h1>Log In</h1>
            <LogIn />
            <p>Don't have an account? <Link to="/signup"><button>Sign Up</button></Link></p>
            <p>Forgot your password? <Link to="/resetpassword"><button>Reset Password</button></Link></p>
        </div>
    );
};

export default LogInPage;