const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const db = require('../db');
const { sendPasswordResetEmail } = require('../emailUtils');

const router = express.Router();

// GET all users
router.get('/', async (req, res) => {
  try {
    const [results] = await db.query('SELECT * FROM users');
    res.json(results);
  } catch (err) {
    console.error(err);
    res.status(500).send('Database error');
  }
});

// SIGN UP
router.post('/signup', async (req, res) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({ message: 'Please provide all fields (username, email, password)' });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    await db.query(
      'INSERT INTO users (username, email, password) VALUES (?, ?, ?)',
      [username, email, hashedPassword]
    );

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
    const [results] = await db.query('SELECT * FROM users WHERE email = ?', [email]);

    if (results.length === 0) {
      return res.status(400).json({ message: 'User not found' });
    }

    const user = results[0];
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Incorrect password' });
    }

    const token = jwt.sign(
      { userId: user.id, username: user.username },
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

module.exports = router;