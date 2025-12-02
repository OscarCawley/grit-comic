const express = require('express');
const db = require('../db');
const { sendNewsletterEmails } = require('../emailUtils');
const AdminOnly = require('../middleware/AdminOnly.js');

const router = express.Router();

// -----------------------------------------------------------------------------
// GET — All updates (with optional pagination)
// -----------------------------------------------------------------------------
router.get('/', async (req, res) => {
    try {
        const limit = req.query.limit ? parseInt(req.query.limit) : null;
        const offset = req.query.offset ? parseInt(req.query.offset) : null;
        const isPaginated = limit !== null || offset !== null;

        if (!isPaginated) {
            const updates = await db.query(`
                SELECT 
                    *,
                    FORMAT(created_at, 'dd/MM/yyyy HH:mm') AS created_at_formatted,
                    FORMAT(updated_at, 'dd/MM/yyyy HH:mm') AS updated_at_formatted
                FROM updates
                ORDER BY created_at DESC
            `);
            return res.json(updates);
        }

        const safeLimit = limit ?? 10;
        const safeOffset = offset ?? 0;

        const totalRows = await db.query(`SELECT COUNT(*) AS total FROM updates`);
        const total = totalRows[0].total;

        const updates = await db.query(`
            SELECT 
                *,
                FORMAT(created_at, 'dd/MM/yyyy HH:mm') AS created_at_formatted,
                FORMAT(updated_at, 'dd/MM/yyyy HH:mm') AS updated_at_formatted
            FROM updates
            ORDER BY created_at DESC
            OFFSET @offset ROWS FETCH NEXT @limit ROWS ONLY
        `, { offset: safeOffset, limit: safeLimit });

        const hasMore = safeOffset + updates.length < total;

        res.json({ updates, total, offset: safeOffset, limit: safeLimit, hasMore });

    } catch (err) {
        console.error(err);
        res.status(500).send("Database error");
    }
});

// -----------------------------------------------------------------------------
// POST — Create a new update
// -----------------------------------------------------------------------------
router.post('/create', AdminOnly, async (req, res) => {
    const { title, content, users } = req.body;

    if (!title || !content) {
        return res.status(400).json({ message: 'Please provide all fields' });
    }

    try {
        await db.query(
            'INSERT INTO updates (title, content) VALUES (@title, @content)',
            { title, content }
        );

        const inserted = await db.query('SELECT SCOPE_IDENTITY() AS id');
        const newId = inserted[0].id;

        res.status(201).json({ id: newId, title, content });

        if (users && users.length > 0) {
            sendNewsletterEmails(title, content, users);
        }
    } catch (err) {
        console.error(err);
        res.status(500).send('Database error');
    }
});

// -----------------------------------------------------------------------------
// PUT — Update an existing update
// -----------------------------------------------------------------------------
router.put('/:id', AdminOnly, async (req, res) => {
    const { id } = req.params;
    const { title, content } = req.body;

    if (!title || !content) {
        return res.status(400).json({ message: 'Please provide all fields' });
    }

    try {
        await db.query(
            'UPDATE updates SET title = @title, content = @content WHERE id = @id',
            { title, content, id }
        );
        res.json({ message: 'Update successful' });
    } catch (err) {
        console.error(err);
        res.status(500).send('Database error');
    }
});

// -----------------------------------------------------------------------------
// DELETE — Remove an update
// -----------------------------------------------------------------------------
router.delete('/:id', AdminOnly, async (req, res) => {
    const { id } = req.params;

    try {
        await db.query('DELETE FROM updates WHERE id = @id', { id });
        res.json({ message: 'Update deleted successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).send('Database error');
    }
});

module.exports = router;
