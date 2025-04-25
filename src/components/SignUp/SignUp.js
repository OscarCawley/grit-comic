import React, { useState } from 'react';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth, db } from '../../firebase';
import { doc, setDoc } from 'firebase/firestore'; // Firestore functions
import './SignUp.css';

const SignUp = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [username, setUsername] = useState('');
    const [error, setError] = useState('');

    const handleSignUp = async (e) => {
        e.preventDefault();
        try {
            // Create user with email and password
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            // Save additional user info (username) in Firestore
            await setDoc(doc(db, 'users', user.uid), {
                email: user.email,
                username: username, // Store the username
                createdAt: new Date(),
            });

            alert('Account created successfully!');
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