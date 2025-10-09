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

// router to get assets using parameters
router.get('/', async (req, res) => {
    const names = req.query.names

    try {
        let query = 'SELECT * FROM assets WHERE ';
        let params = [];

        if (names) {
            const nameList = Array.isArray(names) ? names : [names];
            const placeholders = nameList.map(() => '?').join(', ');
            query += `name IN (${placeholders})`;
            params = nameList;
        }

        const [rows] = await db.query(query, params);
        res.json(rows);
    } catch (err) {
        console.error('Error fetching chapter assets:', err);
        res.status(500).send('Server error');
    }
});

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
router.get('/text-assets', async (req, res) => {
    try {
        const [textAssets] = await db.query('SELECT * FROM assets WHERE type = "text"');
        res.json(textAssets);
    } catch (err) {
        console.error(err);
        res.status(500).send('Database error');
    }
});

router.put('/images/:id', upload.single('image'), async (req, res) => {
    const imageId = req.params.id;
    const image = req.file ? `/uploads/${req.file.filename}` : null;

    if (!image) {
        return res.status(400).send('No file uploaded');
    }

    // Save the new file, update DB reference, and delete old image if needed
    try {
        const [rows] = await db.query('SELECT content FROM assets WHERE id = ?', [imageId])
        const oldImage = rows[0]?.content;
        if (oldImage) {
            const oldPath = path.join(__dirname, '..', oldImage);
            try {
                if (fs.existsSync(oldPath)) {
                    fs.unlinkSync(oldPath);
                }
            } catch (e) {
                console.warn('Failed to delete old image:', e);
            }
        }

        await db.query('UPDATE assets SET content = ? WHERE id = ?', [image, imageId])
        res.status(200).json({ message: 'Image updated successfully!' })
    } catch (e) {
        console.warn('Failed to delete old image:', e);
    }

});

router.put('/text-assets/:id', async (req, res) => {
    const textId = req.params.id;
    const { content } = req.body;

    if (typeof content !== 'string' || content.trim() === '') {
        return res.status(400).json({ error: 'Invalid or empty content.' });
    }

    try {
        const [result] = await db.query('UPDATE assets SET content = ? WHERE id = ?', [content, textId]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Text asset not found.' });
        }

        res.status(200).json({ message: 'Text asset updated successfully!' });
    } catch (err) {
        console.error('Failed to update text asset:', err);
        res.status(500).json({ error: 'Internal server error.' });
    }
});

module.exports = router;