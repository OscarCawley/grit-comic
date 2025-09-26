const express = require('express');
const db = require('../db');

const router = express.Router();

router.get('/', async (req, res) => {
    try {
        const [comments] = await db.query('SELECT * FROM comments ORDER BY created_at ASC');
        res.json(comments);
    } catch (err) {
        console.error(err);
        res.status(500).send('Database error');
    }
});

module.exports = router;