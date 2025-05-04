import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './SignUp.css';

const SignUp = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [username, setUsername] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleSignUp = async (e) => {
        e.preventDefault();
        setError('');

        try {
            const res = await fetch('http://localhost:5000/api/users/signup', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password, username }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.message || 'Something went wrong');
            }

            setEmail('');
            setPassword('');
            setUsername('');
            navigate('/');
            
        } catch (err) {
            setError(err.message);
        }
    };

    return (
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
    );
};

export default SignUp;