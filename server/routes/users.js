const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const db = require('../db');
const { sendPasswordResetEmail, sendVerificationEmail } = require('../emailUtils');
const AdminOnly = require('../middleware/AdminOnly.js');

const router = express.Router();

// GET all users
router.get('/', AdminOnly, async (req, res) => {
    try {
        const [results] = await db.query('SELECT * FROM users');
        res.json(results);
    } catch (err) {
        console.error(err);
        res.status(500).send('Database error');
    }
});

// GET subscribers
router.get('/subscribers', AdminOnly, async (req, res) => {
    try {
        const [results] = await db.query('SELECT * FROM users WHERE subscribe = 1');
        res.json(results);
    }
    catch (err) {
        console.error(err);
        res.status(500).send('Database error');
    }
});

// SIGN UP
router.post('/signup', async (req, res) => {
    const { username, email, password, subscribe } = req.body;

    if (!username || !email || !password) {
        return res.status(400).json({ message: 'Please provide all fields (username, email, password)' });
    }

    try {
        const [existing] = await db.query(
            'SELECT id FROM users WHERE email = ? UNION SELECT id FROM pending_users WHERE email = ?',
            [email, email]
        );
        if (existing.length > 0) {
            return res.status(400).json({ message: 'Email already registered or pending verification.' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const verificationToken = crypto.randomBytes(32).toString('hex');
        await db.query(
            'INSERT INTO pending_users (username, email, password, subscribe, verification_token) VALUES (?, ?, ?, ?, ?)',
            [username, email, hashedPassword, subscribe, verificationToken]
        );

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
        // Check users table first
        const [users] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
        if (users.length === 0) {
            // If not found, check pending_users table
            const [pending] = await db.query('SELECT * FROM pending_users WHERE email = ?', [email]);
            if (pending.length > 0) {
                return res.status(403).json({ message: 'Please verify your account before logging in.' });
            }
            return res.status(400).json({ message: 'User not found' });
        }

        const user = users[0];
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Incorrect password' });
        }

        const token = jwt.sign(
            { userId: user.id, username: user.username, email: user.email, subscribe: Boolean(user.subscribe), auth: Boolean(user.auth), owner: Boolean(user.owner) },
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
        const [results] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
        if (results.length === 0) {
            return res.status(404).json({ message: 'Email not found' });
        }

        const token = crypto.randomBytes(32).toString('hex');
        const tokenExpiry = new Date(Date.now() + 3600000); // 1 hour from now

        await db.query(
            'UPDATE users SET reset_token = ?, reset_token_expiry = ? WHERE email = ?',
            [token, tokenExpiry, email]
        );

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
        const [user] = await db.query(
            'SELECT * FROM users WHERE reset_token = ? AND reset_token_expiry > NOW()',
            [token]
        );

        if (user.length === 0) {
            return res.status(400).json({ message: 'Invalid or expired token' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        await db.query(
            'UPDATE users SET password = ?, reset_token = NULL, reset_token_expiry = NULL WHERE reset_token = ?',
            [hashedPassword, token]
        );

        res.json({ message: 'Password has been reset successfully!' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'An error occurred. Please try again.' });
    }
});

router.patch('/:id/subscribe', async (req, res) => {
    const { id } = req.params;
    const { subscribe } = req.body;

    if (typeof subscribe !== 'boolean') {
        return res.status(400).json({ message: 'subscribe must be a boolean.' });
    }

    try {
        const [rows] = await db.query('SELECT * FROM users WHERE id = ?', [id]);

        if (rows.length === 0) {
            return res.status(404).json({ message: 'User not found.' });
        }

        const subscribeValue = subscribe ? 1 : 0;
        await db.query('UPDATE users SET subscribe = ? WHERE id = ?', [subscribeValue, id]);

        const user = rows[0];

        const token = jwt.sign(
            { userId: user.id, username: user.username, email: user.email, subscribe },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        res.json({ message: 'Subscription preference updated.', token });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Unable to update subscription at the moment.' });
    }
});

router.get('/unsubscribe', async (req, res) => {
    const { token } = req.query;
    if (!token) {
        return res.status(400).json({ message: 'Missing token' });
    }

    try {
        const [rows] = await db.query(
            'SELECT id, subscribe FROM users WHERE unsubscribe_token = ?',
            [token]
        );

        if (rows.length === 0) {
            return res.status(404).json({ message: 'Unsubscribe link is invalid or expired.' });
        }

        const { id, subscribe } = rows[0];

        if (Number(subscribe) === 0) {
            return res.json({ message: 'You are already unsubscribed.' });
        }

        await db.query(
            'UPDATE users SET subscribe = 0 WHERE id = ?',
            [id]
        );

        res.json({ message: 'You have been unsubscribed.' });
        
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Unable to process unsubscribe request at the moment.' });
    }
});

router.get('/verify-email', async (req, res) => {
    const { token } = req.query;
    if (!token) {
        return res.status(400).json({ message: 'Missing token' });
    }
    try {
        const [rows] = await db.query(
            'SELECT * FROM pending_users WHERE verification_token = ?',
            [token]
        ); 
        if (rows.length === 0) {
            return res.status(404).json({ message: 'Verification link is invalid or expired.' });
        }
        const pendingUser = rows[0];

        const unsubscribeToken = crypto.randomBytes(32).toString('hex');
        await db.query(
            'INSERT INTO users (username, email, password, subscribe, unsubscribe_token) VALUES (?, ?, ?, ?, ?)',
            [pendingUser.username, pendingUser.email, pendingUser.password, pendingUser.subscribe, unsubscribeToken]
        );
        await db.query(
            'DELETE FROM pending_users WHERE id = ?',
            [pendingUser.id]
        );
        res.json({ message: 'Email verified successfully! You can now log in.' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Unable to verify email at the moment.' });
    }
});

// TOGGLE ADMIN
router.put('/:id/admin', AdminOnly, async (req, res) => {
    const userId = req.params.id;
    const { auth } = req.body;
    if (typeof auth !== 'boolean') {
        return res.status(400).json({ message: 'auth must be a boolean.' });
    }
    try {
        const [result] = await db.query('UPDATE users SET auth = ? WHERE id = ?', [auth ? 1 : 0, userId]);
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json({ message: 'User admin status updated successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Database error', error: err });
    }
});

// DELETE user
router.delete('/:id', AdminOnly, async (req, res) => {
    const userId = req.params.id;

    try {
        const [result] = await db.query('DELETE FROM users WHERE id = ?', [userId]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json({ message: 'User deleted successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Database error', error: err });
    }
});

module.exports = router;





