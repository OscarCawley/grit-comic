const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const db = require('../db');
const AdminOnly = require('../middleware/AdminOnly.js');

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

// Serve static images
router.use('/uploads', express.static(uploadDir));

router.get('/posts', async (req, res) => {
    try {
        const search = req.query.search ? req.query.search.toLowerCase() : null;
        const limit = req.query.limit ? parseInt(req.query.limit) : null;
        const offset = req.query.offset ? parseInt(req.query.offset) : null;

        const isPaginated = search !== null || limit !== null || offset !== null;

        // -------------------------
        // CASE 1: NO PAGINATION → Return all posts (old behavior)
        // -------------------------
        if (!isPaginated) {
            const [results] = await db.query(`
                SELECT 
                    wiki.*,
                    DATE_FORMAT(wiki.created_at, '%d/%m/%Y %H:%i') AS created_at_formatted,
                    DATE_FORMAT(wiki.updated_at, '%d/%m/%Y %H:%i') AS updated_at_formatted
                FROM wiki
                ORDER BY wiki.updated_at DESC
            `);
            return res.json(results);
        }

        // -------------------------
        // CASE 2: PAGINATED + SEARCH
        // -------------------------

        let where = "";
        let params = [];

        if (search !== null) {
            where = `WHERE LOWER(wiki.title) LIKE ? OR LOWER(wiki.content) LIKE ?`;
            params.push(`%${search}%`, `%${search}%`);
        }

        const safeLimit = limit ?? 10;
        const safeOffset = offset ?? 0;

        // Count total
        const [countRows] = await db.query(
            `SELECT COUNT(*) AS total FROM wiki ${where}`,
            params
        );

        const total = countRows[0].total;

        // Fetch paginated results
        const [results] = await db.query(
            `
            SELECT 
                wiki.*,
                DATE_FORMAT(wiki.created_at, '%d/%m/%Y %H:%i') AS created_at_formatted,
                DATE_FORMAT(wiki.updated_at, '%d/%m/%Y %H:%i') AS updated_at_formatted
            FROM wiki
            ${where}
            ORDER BY wiki.updated_at DESC
            LIMIT ? OFFSET ?
            `,
            [...params, safeLimit, safeOffset]
        );

        const hasMore = safeOffset + results.length < total;

        return res.json({
            results,
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

router.get('/posts/:slug', async (req, res) => {
    const { slug } = req.params;
    try {
        const [post] = await db.query(`
            SELECT wiki.*, wiki.image, 
            DATE_FORMAT(wiki.created_at, '%d/%m/%Y %H:%i') AS created_at_formatted, 
            DATE_FORMAT(wiki.updated_at, '%d/%m/%Y %H:%i') AS updated_at_formatted 
            FROM wiki WHERE wiki.slug = ?
        `, [slug]);

        if (post.length === 0) {
            return res.status(404).send('Post not found');
        }

        res.json(post[0]);
    } catch (err) {
        console.error(err);
        res.status(500).send('Database error');
    }
});

router.post('/create', AdminOnly, upload.single('image'), async (req, res) => {
    const { title, slug, content } = req.body;
    const image = req.file ? `/uploads/${req.file.filename}` : null;

    if (!title || !slug || !content) {
        return res.status(400).json({ message: 'Please provide all fields' });
    }

    try {
        await db.query(
            'INSERT INTO wiki (title, slug, content, image) VALUES (?, ?, ?, ?)',
            [title, slug, content, image]
        );

        res.status(201).json({ message: 'Post created successfully!' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error inserting post', error: err });
    }
});

router.put('/:id', AdminOnly, upload.single('image'), async (req, res) => {
    const { id } = req.params;
    const { title, slug, content } = req.body;
    const image = req.file ? `/uploads/${req.file.filename}` : null;

    if (!title || !slug || !content) {
        return res.status(400).json({ message: 'Please provide all fields' });
    }

    try {
        if (image) {
            const [rows] = await db.query('SELECT image FROM wiki WHERE id = ?', [id]);
            const oldImage = rows[0]?.image;
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
        }

        let query = 'UPDATE wiki SET title = ?, slug = ?, content = ?';
        const params = [title, slug, content];

        if (image) {
            query += ', image = ?';
            params.push(image);
        }

        query += ' WHERE id = ?';
        params.push(id);

        await db.query(query, params);

        res.status(200).json({ message: 'Post updated successfully!' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error updating post', error: err });
    }
});

router.delete('/:id', AdminOnly, async (req, res) => {
    const { id } = req.params;

    try {
        const [rows] = await db.query('SELECT image FROM wiki WHERE id = ?', [id]);
        const imagePath = rows[0]?.image;
        if (imagePath) {
            const fullPath = path.join(__dirname, '..', imagePath);
            try {
                if (fs.existsSync(fullPath)) {
                    fs.unlinkSync(fullPath);
                }
            } catch (e) {
                console.warn(`Failed to delete image ${imagePath}:`, e);
            }
        }

        await db.query('DELETE FROM wiki WHERE id = ?', [id]);
        res.status(200).json({ message: 'Post deleted successfully!' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error deleting post', error: err });
    }
});

module.exports = router;