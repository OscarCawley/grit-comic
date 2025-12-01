const express = require('express');
const db = require('../db');
const { sendNewsletterEmails } = require('../emailUtils');
const AdminOnly = require('../middleware/AdminOnly.js');

const router = express.Router();

// Get all updates
router.get('/', async (req, res) => {
    try {
        await new Promise(resolve => setTimeout(resolve, 2000)); // 0.5s delay

        const limit = req.query.limit ? parseInt(req.query.limit) : null;
        const offset = req.query.offset ? parseInt(req.query.offset) : null;
        const isPaginated = limit !== null || offset !== null;

        // OLD BEHAVIOR (no pagination)
        if (!isPaginated) {
            const [rows] = await db.query(`
                SELECT 
                    updates.*, 
                    DATE_FORMAT(updates.created_at, '%d/%m/%Y %H:%i') AS created_at_formatted,
                    DATE_FORMAT(updates.updated_at, '%d/%m/%Y %H:%i') AS updated_at_formatted
                FROM updates
                ORDER BY created_at DESC
            `);

            return res.json(rows);
        }

        // PAGINATION LOGIC
        const safeLimit = limit ?? 10;
        const safeOffset = offset ?? 0;

        const [[{ total }]] = await db.query(`SELECT COUNT(*) AS total FROM updates`);

        const [updates] = await db.query(`
            SELECT 
                updates.*,
                DATE_FORMAT(updates.created_at, '%d/%m/%Y %H:%i') AS created_at_formatted,
                DATE_FORMAT(updates.updated_at, '%d/%m/%Y %H:%i') AS updated_at_formatted
            FROM updates
            ORDER BY created_at DESC
            LIMIT ? OFFSET ?
        `, [safeLimit, safeOffset]);

        const hasMore = safeOffset + updates.length < total;

        res.json({
            updates,
            total,
            offset: safeOffset,
            limit: safeLimit,
            hasMore
        });

    } catch (err) {
        console.error(err);
        res.status(500).send("Database error");
    }
});

// Create a new update
router.post('/create', AdminOnly, async (req, res) => {
    const { title, content, users } = req.body;

    if (!title || !content) {
        return res.status(400).json({ message: 'Please provide all fields' });
    }        
    try {
        const [result] = await db.query('INSERT INTO updates (title, content) VALUES (?, ?)', [title, content]);
        res.status(201).json({ id: result.insertId, title, content });

        if (!users || users.length === 0) return;
        sendNewsletterEmails(title, content, users);

    } catch (err) {
        console.error(err);
        res.status(500).send('Database error');
    }
});

// Update an existing update
router.put('/:id', AdminOnly, async (req, res) => {
    const { id } = req.params;
    const { title, content } = req.body;

    if (!title || !content) {
        return res.status(400).json({ message: 'Please provide all fields' });
    }

    try {
        await db.query('UPDATE updates SET title = ?, content = ? WHERE id = ?', [title, content, id]);
        res.json({ message: 'Update successful' });
    } catch (err) {
        console.error(err);
        res.status(500).send('Database error');
    }
});

// Delete an update
router.delete('/:id', AdminOnly, async (req, res) => {
    const { id } = req.params;

    try {
        await db.query('DELETE FROM updates WHERE id = ?', [id]);
        res.json({ message: 'Update deleted successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).send('Database error');
    }
});


module.exports = router;