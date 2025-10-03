import React, { useState } from 'react';
import './SignUpPage.css';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

const SignUpPage = () => {

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [username, setUsername] = useState('');
    const [error, setError] = useState('');
    const [subscribe, setSubscribe] = useState(false);
    const navigate = useNavigate();

    const handleSignUp = async (e) => {
        e.preventDefault();
        setError('');

        try {
            await axios.post(`${process.env.REACT_APP_API_URL}/api/users/signup`, {
                email,
                password,
                username,
                subscribe
            });

            setEmail('');
            setPassword('');
            setUsername('');
            setSubscribe(false);
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
                {error && <p>{error}</p>}
            </form>
            <p>Already have an account? <Link to="/login"><button>Login</button></Link></p>
        </div>
    );
};

export default SignUpPage;