const express = require('express');
const db = require('../db');

const router = express.Router();

router.get('/', async (req, res) => {
    try {
        const [updates] = await db.query(`
            SELECT *, DATE_FORMAT(updates.created_at, '%d/%m/%Y %H:%i') AS created_at_formatted, 
            DATE_FORMAT(updates.updated_at, '%d/%m/%Y %H:%i') AS updated_at_formatted
            FROM updates ORDER BY created_at DESC`);
        res.json(updates);
    } catch (err) {
        console.error(err);
        res.status(500).send('Database error');
    }
});


module.exports = router;