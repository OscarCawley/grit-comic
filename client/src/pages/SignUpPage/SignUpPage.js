import React, { useState } from 'react';
import './SignUpPage.css';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

const SignUpPage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [username, setUsername] = useState('');
    const [message, setMessage] = useState('');
    const [subscribe, setSubscribe] = useState(false);
    const navigate = useNavigate();

    const handleSignUp = async (e) => {
        e.preventDefault();
        setMessage('');

        try {
            await axios.post(`${process.env.REACT_APP_API_URL}/api/users/signup`, {
                email,
                password,
                username,
                subscribe
            });

            setMessage('Account created successfully! Redirecting to login...');
            setEmail('');
            setPassword('');
            setUsername('');
            setSubscribe(false);

            // Clear message & redirect after 3 seconds
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
        <div className='sign-up-page'>
            <h1>Sign Up</h1>
            <form className='sign-up-form' onSubmit={handleSignUp}>
                <input
                    type="text"
                    placeholder="Username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className='sign-up-input'
                />
                <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className='sign-up-input'
                />
                <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className='sign-up-input'
                />
                <label className='sign-up-checkbox'>
                    <input
                        type="checkbox"
                        checked={subscribe}
                        onChange={(e) => setSubscribe(e.target.checked)}
                    />
                    I'd like to receive comic updates.
                </label>

                <button type="submit">Sign Up</button>
                <p className={`message ${message ? 'visible' : 'hidden'}`}>{message || ' '}</p>
            </form>
            <p>Already have an account? <Link to="/login"><button>Login</button></Link></p>
        </div>
    );
};

export default SignUpPage;