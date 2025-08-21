const express = require('express');
const db = require('../db');

const router = express.Router();

// Get all faq's
router.get('/', async (req, res) => {
    try {
        const [updates] = await db.query(`SELECT * FROM faq`);
        res.json(updates);
    } catch (err) {
        console.error(err);
        res.status(500).send('Database error');
    }
});

// Create a new faq
router.post('/create', async (req, res) => {
    const { question, answer } = req.body;

    if (!question || !answer) {
        return res.status(400).json({ message: 'Please provide all fields' });
    }

    try {
        const [result] = await db.query('INSERT INTO faq (question, answer) VALUES (?, ?)', [title, content]);
        res.status(201).json({ id: result.insertId, question, answer });
    } catch (err) {
        console.error(err);
        res.status(500).send('Database error');
    }
});

// Update an existing faq
router.put('/:id', async (req, res) => {
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
router.delete('/:id', async (req, res) => {
    const { id } = req.params;

    try {
        await db.query('DELETE FROM faq WHERE id = ?', [id]);
        res.json({ message: 'FAQ deleted successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).send('Database error');
    }
});

module.exports = router;