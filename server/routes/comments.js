const express = require('express');
const db = require('../db');

const router = express.Router();

router.get('/', async (req, res) => {
    try {
        const [comments] = await db.query(`SELECT comments.*, users.username AS username, DATE_FORMAT(comments.created_at, '%d/%m/%Y %H:%i') AS created_at_formatted FROM comments JOIN users ON comments.user_id = users.id ORDER BY created_at DESC`);
        res.json(comments);
    } catch (err) {
        console.error(err);
        res.status(500).send('Database error');
    }
});

router.post('/', async (req, res) => {
    const { user_id, chapter_id, content } = req.body;
    if (!user_id || !chapter_id || !content) {
        return res.status(400).send('Missing required fields');
    }
    try {
        const [result] = await db.query('INSERT INTO comments (user_id, chapter_id, content) VALUES (?, ?, ?)', [user_id, chapter_id, content]);
        const [newCommentRows] = await db.query(`SELECT comments.*, users.username AS username, DATE_FORMAT(comments.created_at, '%d/%m/%Y %H:%i') AS created_at_formatted FROM comments JOIN users ON comments.user_id = users.id WHERE comments.id = ?`, [result.insertId]);
        res.status(201).json(newCommentRows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).send('Database error');
    }
});

router.delete('/:id', async (req, res) => {
    const commentId = req.params.id;
    try {
        const [result] = await db.query('DELETE FROM comments WHERE id = ?', [commentId]);
        if (result.affectedRows === 0) {
            return res.status(404).send('Comment not found');
        }
        res.sendStatus(204);
    } catch (err) {
        console.error(err);
        res.status(500).send('Database error');
    }
});

module.exports = router;