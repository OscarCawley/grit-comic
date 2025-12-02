const express = require('express');
const db = require('../db');
const AdminOnly = require('../middleware/AdminOnly');
const AuthenticateToken = require('../middleware/AuthenticateToken');

const router = express.Router();

// -----------------------------------------------------------------------------
// GET — All comments (with optional pagination/filter by chapter)
// -----------------------------------------------------------------------------
router.get('/', async (req, res) => {
    try {
        const chapter = req.query.chapter ? parseInt(req.query.chapter) : null;
        const limit = req.query.limit ? parseInt(req.query.limit) : null;
        const offset = req.query.offset ? parseInt(req.query.offset) : null;

        const isPaginated = limit !== null || offset !== null || chapter !== null;

        if (!isPaginated) {
            const allComments = await db.query(`
                SELECT 
                    comments.*, 
                    users.username,
                    FORMAT(comments.created_at, 'dd/MM/yyyy HH:mm') AS created_at_formatted
                FROM comments
                JOIN users ON comments.user_id = users.id
                ORDER BY comments.created_at DESC
            `);

            return res.json(allComments); // exact old behavior
        }

        let where = "";
        let params = {};

        if (chapter !== null) {
            where = "WHERE comments.chapter_num = @chapter_num";
            params.chapter_num = chapter;
        }

        const safeLimit = limit ?? 10;
        const safeOffset = offset ?? 0;

        const countRows = await db.query(
            `SELECT COUNT(*) AS total FROM comments ${where}`,
            params
        );
        const total = countRows[0].total;

        // MSSQL pagination using OFFSET/FETCH
        const comments = await db.query(
            `
            SELECT 
                comments.*, 
                users.username,
                FORMAT(comments.created_at, 'dd/MM/yyyy HH:mm') AS created_at_formatted
            FROM comments
            JOIN users ON comments.user_id = users.id
            ${where}
            ORDER BY comments.created_at DESC
            OFFSET @offset ROWS FETCH NEXT @limit ROWS ONLY
            `,
            { ...params, offset: safeOffset, limit: safeLimit }
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

// -----------------------------------------------------------------------------
// POST — Create comment
// -----------------------------------------------------------------------------
router.post('/', async (req, res) => {
    const { user_id, chapter_num, content } = req.body;
    if (!user_id || !chapter_num || !content) {
        return res.status(400).send('Missing required fields');
    }
    try {
        const result = await db.query(
            'INSERT INTO comments (user_id, chapter_num, content) VALUES (@user_id, @chapter_num, @content)',
            { user_id, chapter_num, content }
        );

        // MSSQL: retrieve newly inserted comment by SCOPE_IDENTITY()
        const newCommentRows = await db.query(
            `SELECT comments.*, users.username AS username, FORMAT(comments.created_at, 'dd/MM/yyyy HH:mm') AS created_at_formatted
             FROM comments
             JOIN users ON comments.user_id = users.id
             WHERE comments.id = @id`,
            { id: result.recordset[0]?.id || await db.query('SELECT SCOPE_IDENTITY() AS id').then(r => r[0].id) }
        );

        res.status(201).json(newCommentRows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).send('Database error');
    }
});

// -----------------------------------------------------------------------------
// DELETE — Admin delete comment
// -----------------------------------------------------------------------------
router.delete('/admin/:id', AdminOnly, async (req, res) => {
    const commentId = req.params.id;
    try {
        const result = await db.query(
            'DELETE FROM comments WHERE id = @id',
            { id: commentId }
        );

        if (result.rowsAffected[0] === 0) {
            return res.status(404).send('Comment not found');
        }
        res.sendStatus(204);
    } catch (err) {
        console.error(err);
        res.status(500).send('Database error');
    }
});

// -----------------------------------------------------------------------------
// DELETE — User delete own comment
// -----------------------------------------------------------------------------
router.delete('/user/:id', AuthenticateToken, async (req, res) => {
    const commentId = req.params.id;
    const userId = req.user.id;

    try {
        const rows = await db.query(
            'SELECT * FROM comments WHERE id = @id AND user_id = @user_id',
            { id: commentId, user_id: userId }
        );

        if (rows.length === 0) {
            return res.status(403).json({ message: "You can only delete your own comments." });
        }

        await db.query(
            'DELETE FROM comments WHERE id = @id',
            { id: commentId }
        );

        res.json({ message: "Comment deleted successfully." });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Database error." });
    }
});

module.exports = router;
