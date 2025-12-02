const express = require('express');
const db = require('../db');
const { sendSupportEmail } = require('../emailUtils');
const AdminOnly = require('../middleware/AdminOnly.js');

const router = express.Router();

// -----------------------------------------------------------------------------
// GET — All FAQs
// -----------------------------------------------------------------------------
router.get('/faq', async (req, res) => {
    try {
        const faqs = await db.query(`SELECT * FROM faq`);
        res.json(faqs);
    } catch (err) {
        console.error(err);
        res.status(500).send('Database error');
    }
});

// -----------------------------------------------------------------------------
// POST — Create FAQ
// -----------------------------------------------------------------------------
router.post('/faq/create', AdminOnly, async (req, res) => {
    const { question, answer } = req.body;

    if (!question || !answer) {
        return res.status(400).json({ message: 'Please provide all fields' });
    }

    try {
        const result = await db.query(
            'INSERT INTO faq (question, answer) VALUES (@question, @answer)',
            { question, answer }
        );

        // Get inserted ID (SCOPE_IDENTITY())
        const insertedId = await db.query('SELECT SCOPE_IDENTITY() AS id');
        res.status(201).json({ id: insertedId[0].id, question, answer });
    } catch (err) {
        console.error(err);
        res.status(500).send('Database error');
    }
});

// -----------------------------------------------------------------------------
// PUT — Update FAQ
// -----------------------------------------------------------------------------
router.put('/faq/:id', AdminOnly, async (req, res) => {
    const { id } = req.params;
    const { question, answer } = req.body;

    if (!question || !answer) {
        return res.status(400).json({ message: 'Please provide all fields' });
    }

    try {
        await db.query(
            'UPDATE faq SET question = @question, answer = @answer WHERE id = @id',
            { question, answer, id }
        );
        res.json({ message: 'Update successful' });
    } catch (err) {
        console.error(err);
        res.status(500).send('Database error');
    }
});

// -----------------------------------------------------------------------------
// DELETE — Remove FAQ
// -----------------------------------------------------------------------------
router.delete('/faq/:id', AdminOnly, async (req, res) => {
    const { id } = req.params;

    try {
        await db.query('DELETE FROM faq WHERE id = @id', { id });
        res.json({ message: 'FAQ deleted successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).send('Database error');
    }
});

// -----------------------------------------------------------------------------
// POST — Submit support request
// -----------------------------------------------------------------------------
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
