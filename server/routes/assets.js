const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const db = require('../db');

const router = express.Router();

const uploadDir = path.join(__dirname, '..', 'uploads');

// Multer config
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir); // Ensure this folder exists
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({ storage });

router.use('/uploads', express.static(uploadDir));

// router to get images
router.get('/images', async (req, res) => {
    try {
        const [images] = await db.query('SELECT * FROM assets WHERE type = "image"');
        res.json(images);
    } catch (err) {
        console.error(err);
        res.status(500).send('Database error');
    }
});

// router to get text assets

module.exports = router;