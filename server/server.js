const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const db = require('./db');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

app.get('/api/users', (req, res) => {
  db.query('SELECT * FROM users', (err, results) => {
    if (err) return res.status(500).send(err);
    res.json(results);
  });
});

app.post('/api/users/register', async (req, res) => {
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