import React, { useState } from 'react';
import './SignUpPage.css';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

const SignUpPage = () => {

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [username, setUsername] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleSignUp = async (e) => {
        e.preventDefault();
        setError('');

        try {
            const res = await axios.post('http://localhost:5000/api/users/signup', {
                email,
                password,
                username
            });

            setEmail('');
            setPassword('');
            setUsername('');
            navigate('/login');
            
        } catch (err) {
            setError(err.response?.data?.message || err.message || 'Something went wrong');
        }
    };

    return (
        <div className='sign-up-page'>
            <h1>Sign Up</h1>
            <form className='sign-up-form' onSubmit={handleSignUp}>
                <input
                    type="text"
                    placeholder="Username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                />
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
                <button type="submit">Sign Up</button>
                {error && <p>{error}</p>}
            </form>
            <p>Already have an account? <Link to="/login"><button>Login</button></Link></p>
        </div>
    );
};

export default SignUpPage;