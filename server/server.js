const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('./db');
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

app.post('/api/users/login', async (req, res) => {
  const { email, password } = req.body;

  // Query the database for the user
  db.query('SELECT * FROM users WHERE email = ?', [email], async (err, results) => {
      if (err) return res.status(500).send('Database error');
      if (results.length === 0) return res.status(400).send('User not found');

      const user = results[0];

      // Compare the hashed password from the database
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) return res.status(400).send('Incorrect password');

      // Generate a JWT token (or use session)
      const token = jwt.sign(
          { userId: user.id, username: user.username }, // Payload
          process.env.JWT_SECRET, // Secret (store in .env)
          { expiresIn: '1h' } // Token expiration
      );

      res.json({ token });
  });
});

app.post('/api/users/signup', async (req, res) => {
  const { username, email, password } = req.body;

  // Check if username or email is provided
  if (!username || !email || !password) {
    return res.status(400).json({ message: 'Please provide all fields (username, email, password)' });
  }

  // Hash the password
  try {
    const hashedPassword = await bcrypt.hash(password, 10);  // 10 is the salt rounds (you can adjust it)

    // Insert the user into the database with the hashed password
    db.query('INSERT INTO users (username, email, password) VALUES (?, ?, ?)', 
      [username, email, hashedPassword], 
      (err, results) => {
        if (err) return res.status(500).json({ message: 'Error inserting user', error: err });
        
        res.status(201).json({ message: 'User registered successfully!' });
      });
  } catch (err) {
    return res.status(500).json({ message: 'Error hashing password', error: err });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));