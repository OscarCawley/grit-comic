const express = require('express');
const db = require('../db');
const AdminOnly = require('../middleware/AdminOnly');
const AuthenticateToken = require('../middleware/AuthenticateToken');

const router = express.Router();

router.get('/', async (req, res) => {
    try {
        const chapter = req.query.chapter ? parseInt(req.query.chapter) : null;
        const limit = req.query.limit ? parseInt(req.query.limit) : null;
        const offset = req.query.offset ? parseInt(req.query.offset) : null;

        const isPaginated = limit !== null || offset !== null || chapter !== null;

        if (!isPaginated) {
            const [allComments] = await db.query(`
                SELECT 
                    comments.*, 
                    users.username,
                    DATE_FORMAT(comments.created_at, '%d/%m/%Y %H:%i') AS created_at_formatted
                FROM comments
                JOIN users ON comments.user_id = users.id
                ORDER BY comments.created_at DESC
            `);

            return res.json(allComments); // exact old behavior
        }

        let where = "";
        let params = [];

        if (chapter !== null) {
            where = "WHERE comments.chapter_num = ?";
            params.push(chapter);
        }

        const safeLimit = limit ?? 10;    // default limit
        const safeOffset = offset ?? 0;   // default offset

        const [countRows] = await db.query(
            `SELECT COUNT(*) AS total FROM comments ${where}`,
            params
        );
        const total = countRows[0].total;

        const [comments] = await db.query(
            `
            SELECT 
                comments.*, 
                users.username,
                DATE_FORMAT(comments.created_at, '%d/%m/%Y %H:%i') AS created_at_formatted
            FROM comments
            JOIN users ON comments.user_id = users.id
            ${where}
            ORDER BY comments.created_at DESC
            LIMIT ? OFFSET ?
            `,
            [...params, safeLimit, safeOffset]
        );

        const hasMore = safeOffset + comments.length < total;

        return res.json({
            comments,
            total,
            offset: safeOffset,
            limit: safeLimit,
            hasMore
        });

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