import React from 'react';
import SignUp from '../../components/SignUp/SignUp.js';
import './SignUpPage.css';
import { Link } from 'react-router-dom';

const SignUpPage = () => {
    return (
        <div className='sign-up-page'>
            <h1>Sign Up</h1>
            <SignUp />
            <p>Already have an account? <Link to="/login"><button>Login</button></Link></p>
        </div>
    );
};

export default SignUpPage;