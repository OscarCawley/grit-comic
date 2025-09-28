const express = require('express');
const db = require('../db');

const router = express.Router();

router.get('/', async (req, res) => {
    try {
        const [comments] = await db.query(`SELECT comments.*, users.username AS username, DATE_FORMAT(comments.created_at, '%d/%m/%Y %H:%i') AS created_at_formatted FROM comments JOIN users ON comments.user_id = users.id ORDER BY created_at ASC`);
        res.json(comments);
    } catch (err) {
        console.error(err);
        res.status(500).send('Database error');
    }
});

module.exports = router;