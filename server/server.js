const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('./db');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

app.get('/api/users', (req, res) => {
  // Fetch all users from the database
  db.query('SELECT * FROM users', (err, results) => {
      if (err) return res.status(500).send('Database error');
      res.json(results);
  });
});

app.post('/api/users/signup', async (req, res) => {
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

app.post('/api/users/login', async (req, res) => {
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

app.post('/api/users/reset-password', async (req, res) => {
  const { email } = req.body;

  try {
      // Check if the email exists in the database
      const user = await db.query('SELECT * FROM users WHERE email = ?', [email]);
      if (user.length === 0) {
          return res.status(404).json({ message: 'Email not found' });
      }

      // Generate a reset token
      const token = crypto.randomBytes(32).toString('hex');
      const tokenExpiry = new Date(Date.now() + 3600000); // 1 hour from now

      // Store the token and expiry in the database
      await db.query('UPDATE users SET reset_token = ?, reset_token_expiry = ? WHERE email = ?', [token, tokenExpiry, email]);

      // Send the reset email
      const transporter = nodemailer.createTransport({
          service: 'Gmail',
          auth: {
              user: process.env.GMAIL_USER,
              pass: process.env.GMAIL_PASSWORD,
          },
      });

      const resetLink = `http://your-frontend-url/reset-password?token=${token}`;
      await transporter.sendMail({
          to: email,
          subject: 'Password Reset',
          html: `<p>Click <a href="${resetLink}">here</a> to reset your password. This link will expire in 1 hour.</p>`,
      });

      res.json({ message: 'Password reset email sent!' });
  } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'An error occurred. Please try again.' });
  }
});


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));