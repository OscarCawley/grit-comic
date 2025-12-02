const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const db = require('../db');
const { sendPasswordResetEmail, sendVerificationEmail } = require('../emailUtils');
const AdminOnly = require('../middleware/AdminOnly.js');
const AuthenticateToken = require('../middleware/AuthenticateToken.js');

const router = express.Router();

// GET all users
router.get('/', AdminOnly, async (req, res) => {
    try {
        const users = await db.query('SELECT * FROM users');
        res.json(users);
    } catch (err) {
        console.error(err);
        res.status(500).send('Database error');
    }
});

// GET pending users
router.get('/pending', AdminOnly, async (req, res) => {
    try {
        const pendingUsers = await db.query('SELECT * FROM pending_users');
        res.json(pendingUsers);
    } catch (err) {
        console.error(err);
        res.status(500).send('Database error');
    }
});

// GET subscribers
router.get('/subscribers', AdminOnly, async (req, res) => {
    try {
        const subscribers = await db.query('SELECT * FROM users WHERE subscribe = @subscribe', { subscribe: 1 });
        res.json(subscribers);
    } catch (err) {
        console.error(err);
        res.status(500).send('Database error');
    }
});

// SIGN UP
router.post('/signup', async (req, res) => {
    let { username, email, password, subscribe } = req.body;

    if (!username || !email || !password) {
        return res.status(400).json({ message: 'Please provide all fields (username, email, password)' });
    }

    username = username.trim();
    const usernameRegex = /^[a-zA-Z0-9._-]{3,15}$/;
    if (!usernameRegex.test(username)) {
        return res.status(400).json({ 
            message: "Username must be 3–15 characters and contain only letters, numbers, '.', '-', or '_'" 
        });
    }

    try {
        const existing = await db.query(`
            SELECT id FROM users WHERE email = @email
            UNION
            SELECT id FROM pending_users WHERE email = @email
        `, { email });

        if (existing.length > 0) {
            return res.status(400).json({ message: 'Email already registered or pending verification.' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const verificationToken = crypto.randomBytes(32).toString('hex');

        await db.query(`
            INSERT INTO pending_users (username, email, password, subscribe, verification_token)
            VALUES (@username, @email, @password, @subscribe, @token)
        `, { username, email, password: hashedPassword, subscribe, token: verificationToken });

        await sendVerificationEmail(email, verificationToken);
        res.status(201).json({ message: 'User registered successfully!' });

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error inserting user', error: err });
    }
});

// LOGIN
router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        const users = await db.query('SELECT * FROM users WHERE email = @email', { email });

        if (users.length === 0) {
            const pending = await db.query('SELECT * FROM pending_users WHERE email = @email', { email });
            if (pending.length > 0) {
                return res.status(403).json({ message: 'Please verify your account before logging in.' });
            }
            return res.status(400).json({ message: 'User not found' });
        }

        const user = users[0];
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ message: 'Incorrect password' });

        const token = jwt.sign(
            { id: user.id, username: user.username, email: user.email, subscribe: Boolean(user.subscribe), auth: Boolean(user.auth), owner: Boolean(user.owner) },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        res.json({ token });

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Database error', error: err });
    }
});

// FORGOT PASSWORD
router.post('/forgot-password', async (req, res) => {
    const { email } = req.body;

    try {
        const users = await db.query('SELECT * FROM users WHERE email = @email', { email });
        if (users.length === 0) return res.status(404).json({ message: 'Email not found' });

        const token = crypto.randomBytes(32).toString('hex');
        const tokenExpiry = new Date(Date.now() + 3600000); // 1 hour

        await db.query(`
            UPDATE users SET reset_token = @token, reset_token_expiry = @expiry WHERE email = @email
        `, { token, expiry: tokenExpiry, email });

        const resetLink = `http://localhost:3000/reset-password?token=${token}`;
        await sendPasswordResetEmail(email, resetLink);

        res.json({ message: 'Password reset email sent!' });

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'An error occurred. Please try again.' });
    }
});

// RESET PASSWORD
router.put('/reset-password', async (req, res) => {
    const { token, password } = req.body;

    try {
        const users = await db.query(`
            SELECT * FROM users WHERE reset_token = @token AND reset_token_expiry > SYSDATETIME()
        `, { token });

        if (users.length === 0) return res.status(400).json({ message: 'Invalid or expired token' });

        const hashedPassword = await bcrypt.hash(password, 10);
        await db.query(`
            UPDATE users SET password = @password, reset_token = NULL, reset_token_expiry = NULL WHERE reset_token = @token
        `, { password: hashedPassword, token });

        res.json({ message: 'Password has been reset successfully!' });

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'An error occurred. Please try again.' });
    }
});

// PATCH — Toggle subscription
router.patch('/:id/subscribe', async (req, res) => {
    const { id } = req.params;
    const { subscribe } = req.body;

    if (typeof subscribe !== 'boolean') return res.status(400).json({ message: 'subscribe must be a boolean.' });

    try {
        await db.query('UPDATE users SET subscribe = @subscribe WHERE id = @id', { subscribe: subscribe ? 1 : 0, id });
        const [rows] = await db.query('SELECT * FROM users WHERE id = @id', { id });

        if (rows.length === 0) return res.status(404).json({ message: 'User not found.' });

        const user = rows[0];
        const token = jwt.sign(
            { id: user.id, username: user.username, email: user.email, subscribe: Boolean(user.subscribe), auth: Boolean(user.auth), owner: Boolean(user.owner) },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        res.json({ message: 'Subscription preference updated.', token });

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Unable to update subscription at the moment.' });
    }
});

// VERIFY EMAIL
router.get('/verify-email', async (req, res) => {
    const { token } = req.query;
    if (!token) return res.status(400).json({ message: 'Missing token' });

    try {
        const users = await db.query('SELECT * FROM pending_users WHERE verification_token = @token', { token });
        if (users.length === 0) return res.status(404).json({ message: 'Verification link is invalid or expired.' });

        const pendingUser = users[0];
        const unsubscribeToken = crypto.randomBytes(32).toString('hex');

        await db.query(`
            INSERT INTO users (username, email, password, subscribe, unsubscribe_token)
            VALUES (@username, @email, @password, @subscribe, @unsubscribe)
        `, { 
            username: pendingUser.username,
            email: pendingUser.email,
            password: pendingUser.password,
            subscribe: pendingUser.subscribe,
            unsubscribe: unsubscribeToken
        });

        await db.query('DELETE FROM pending_users WHERE id = @id', { id: pendingUser.id });

        res.json({ message: 'Email verified successfully! You can now log in.' });

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Unable to verify email at the moment.' });
    }
});

// Other admin/user management routes (toggle admin, delete users) follow same pattern using named params @id, etc.

module.exports = router;
