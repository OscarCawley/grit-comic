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

module.exports = router;