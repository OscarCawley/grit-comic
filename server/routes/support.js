const express = require('express');
const db = require('../db');
const { sendSupportEmail } = require('../emailUtils');

const router = express.Router();

// Get all faq's
router.get('/faq', async (req, res) => {
    try {
        const [updates] = await db.query(`SELECT * FROM faq`);
        res.json(updates);
    } catch (err) {
        console.error(err);
        res.status(500).send('Database error');
    }
});

// Create a new faq
router.post('/faq/create', async (req, res) => {
    const { question, answer } = req.body;

    if (!question || !answer) {
        return res.status(400).json({ message: 'Please provide all fields' });
    }

    try {
        const [result] = await db.query('INSERT INTO faq (question, answer) VALUES (?, ?)', [question, answer]);
        res.status(201).json({ id: result.insertId, question, answer });
    } catch (err) {
        console.error(err);
        res.status(500).send('Database error');
    }
});

// Update an existing faq
router.put('/faq/:id', async (req, res) => {
    const { id } = req.params;
    const { question, answer } = req.body;

    if (!question || !answer) {
        return res.status(400).json({ message: 'Please provide all fields' });
    }

    try {
        await db.query('UPDATE faq SET question = ?, answer = ? WHERE id = ?', [title, content, id]);
        res.json({ message: 'Update successful' });
    } catch (err) {
        console.error(err);
        res.status(500).send('Database error');
    }
});

// Delete an faq
router.delete('/faq/:id', async (req, res) => {
    const { id } = req.params;

    try {
        await db.query('DELETE FROM faq WHERE id = ?', [id]);
        res.json({ message: 'FAQ deleted successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).send('Database error');
    }
});

router.post('/submit', async (req, res) => {
    const { username, email, message } = req.body;
    if (!username || !email || !message) {
        return res.status(400).send('Missing required fields');
    }
    try {
        await sendSupportEmail(username, email, message);
        res.status(200).send('Support request submitted successfully');
    } catch (err) {
        console.error(err);
        res.status(500).send('Error submitting support request');
    }
});

module.exports = router;

