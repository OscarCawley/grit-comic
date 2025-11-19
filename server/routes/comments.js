const express = require('express');
const db = require('../db');
const AdminOnly = require('../middleware/AdminOnly');
const AuthenticateToken = require('../middleware/AuthenticateToken');

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
    const { user_id, chapter_num, content } = req.body;
    if (!user_id || !chapter_num || !content) {
        return res.status(400).send('Missing required fields');
    }
    try {
        const [result] = await db.query('INSERT INTO comments (user_id, chapter_num, content) VALUES (?, ?, ?)', [user_id, chapter_num, content]);
        const [newCommentRows] = await db.query(`SELECT comments.*, users.username AS username, DATE_FORMAT(comments.created_at, '%d/%m/%Y %H:%i') AS created_at_formatted FROM comments JOIN users ON comments.user_id = users.id WHERE comments.id = ?`, [result.insertId]);
        res.status(201).json(newCommentRows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).send('Database error');
    }
});

router.delete('admin/:id', AdminOnly, async (req, res) => {
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

router.delete('/user/:id', AuthenticateToken, async (req, res) => {
    const commentId = req.params.id;
    const userId = req.user.id;

    try {
        // Ensure the comment belongs to this user
        const [rows] = await db.query(
            'SELECT * FROM comments WHERE id = ? AND user_id = ?',
            [commentId, userId]
        );

        if (rows.length === 0) {
            return res.status(403).json({ message: "You can only delete your own comments." });
        }

        // Delete the comment
        await db.query('DELETE FROM comments WHERE id = ?', [commentId]);
        res.json({ message: "Comment deleted successfully." });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Database error." });
    }
});

module.exports = router;