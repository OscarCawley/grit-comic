const express = require('express');
const multer = require('multer');
const db = require('../db');
const AdminOnly = require('../middleware/AdminOnly.js');
const { BlobServiceClient } = require("@azure/storage-blob");
require("dotenv").config();

const router = express.Router();

// Azure Blob Storage setup
const blobService = BlobServiceClient.fromConnectionString(
    process.env.AZURE_STORAGE_CONNECTION_STRING
);
const containerName = "uploads"; // your container name
const containerClient = blobService.getContainerClient(containerName);

// Multer setup (in-memory storage)
const upload = multer({ storage: multer.memoryStorage() });

// Get all chapters
router.get('/', async (req, res) => {
    try {
        const [results] = await db.query(`
            SELECT c.chapter_num, c.title, COUNT(p.page_num) AS pageCount
            FROM chapters c
            LEFT JOIN pages p ON c.chapter_num = p.chapter_num
            GROUP BY c.chapter_num, c.title
            ORDER BY c.chapter_num ASC
        `);
        res.json(results);
    } catch (err) {
        console.error(err);
        res.status(500).send('Database error');
    }
});

// Create a chapter
router.post('/create', AdminOnly, upload.none(), async (req, res) => {
    const { chapter_num, title } = req.body;
    if (!chapter_num || !title) return res.status(400).json('Chapter number and title are required');

    try {
        await db.query('INSERT INTO chapters (chapter_num, title) VALUES (?, ?)', [chapter_num, title]);
        res.status(201).json({ message: 'Chapter created successfully!' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error inserting chapter', error: err });
    }
});

// Update a chapter
router.put('/update/:oldchapter_num', AdminOnly, upload.none(), async (req, res) => {
    const { oldchapter_num } = req.params;
    const { chapter_num, title } = req.body;
    if (!title || !chapter_num) return res.status(400).send('Chapter number and title are required');

    try {
        const [result] = await db.query(
            'UPDATE chapters SET chapter_num = ?, title = ? WHERE chapter_num = ?',
            [chapter_num, title, oldchapter_num]
        );
        if (result.affectedRows === 0) return res.status(404).send('Chapter not found');
        res.sendStatus(204);
    } catch (err) {
        console.error(err);
        res.status(500).send('Database error');
    }
});

// Delete a chapter and all pages
router.delete('/delete/:chapter_num', AdminOnly, async (req, res) => {
    const { chapter_num } = req.params;

    try {
        // Delete blobs from Azure
        const [images] = await db.query('SELECT image FROM pages WHERE chapter_num = ?', [chapter_num]);
        for (const img of images) {
            const blobName = img.image.split('/').pop();
            const blockBlobClient = containerClient.getBlockBlobClient(blobName);
            await blockBlobClient.deleteIfExists();
        }

        // Delete pages and chapter from DB
        await db.query('DELETE FROM pages WHERE chapter_num = ?', [chapter_num]);
        const [result] = await db.query('DELETE FROM chapters WHERE chapter_num = ?', [chapter_num]);

        if (result.affectedRows === 0) return res.status(404).send('Chapter not found');
        res.sendStatus(204);
    } catch (err) {
        console.error(err);
        res.status(500).send('Database error');
    }
});

// Get pages for a chapter
router.get('/:chapter_num/pages', async (req, res) => {
    const { chapter_num } = req.params;
    try {
        const [pages] = await db.query(
            'SELECT * FROM pages WHERE chapter_num = ? ORDER BY page_num ASC',
            [chapter_num]
        );
        res.json(pages);
    } catch (err) {
        console.error(err);
        res.status(500).send('Database error');
    }
});

// Upload pages to Azure Blob Storage
router.post('/upload/:chapter_num', AdminOnly, upload.array('images'), async (req, res) => {
    const { chapter_num } = req.params;
    if (!req.files || req.files.length === 0) return res.status(400).send('No files uploaded');

    try {
        const [result] = await db.query(
            'SELECT MAX(page_num) AS maxPage FROM pages WHERE chapter_num = ?',
            [chapter_num]
        );
        let nextpage_num = result[0].maxPage ? result[0].maxPage + 1 : 1;

        for (const file of req.files) {
            const blobName = Date.now() + '-' + file.originalname;
            const blockBlobClient = containerClient.getBlockBlobClient(blobName);

            await blockBlobClient.uploadData(file.buffer);
            const imageUrl = blockBlobClient.url;

            await db.query(
                'INSERT INTO pages (page_num, chapter_num, image) VALUES (?, ?, ?)',
                [nextpage_num, chapter_num, imageUrl]
            );
            nextpage_num++;
        }

        res.status(201).json({ message: 'Images uploaded successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).send('Database error');
    }
});

// Reorder pages
router.put('/reorder/:chapter_num', AdminOnly, async (req, res) => {
    const { pages } = req.body;
    if (!Array.isArray(pages) || pages.length === 0) return res.status(400).send('Invalid page order');

    try {
        const updatePromises = pages.map((page, index) =>
            db.query('UPDATE pages SET page_num = ? WHERE id = ?', [index + 1, page.id])
        );
        await Promise.all(updatePromises);
        res.sendStatus(204);
    } catch (err) {
        console.error(err);
        res.status(500).send('Database error');
    }
});

// Delete a single page
router.delete('/delete/:chapter_num/page/:page_num', AdminOnly, async (req, res) => {
    const { chapter_num, page_num } = req.params;

    try {
        const [imageResult] = await db.query(
            'SELECT image FROM pages WHERE chapter_num = ? AND page_num = ?',
            [chapter_num, page_num]
        );
        if (imageResult.length === 0) return res.status(404).send('Page not found');

        const blobName = imageResult[0].image.split('/').pop();
        const blockBlobClient = containerClient.getBlockBlobClient(blobName);
        await blockBlobClient.deleteIfExists();

        await db.query(
            'DELETE FROM pages WHERE chapter_num = ? AND page_num = ?',
            [chapter_num, page_num]
        );

        res.sendStatus(204);
    } catch (err) {
        console.error(err);
        res.status(500).send('Database error');
    }
});

// Delete all pages in a chapter
router.delete('/delete/:chapter_num/all', AdminOnly, async (req, res) => {
    const { chapter_num } = req.params;

    try {
        const [images] = await db.query('SELECT image FROM pages WHERE chapter_num = ?', [chapter_num]);
        for (const img of images) {
            const blobName = img.image.split('/').pop();
            const blockBlobClient = containerClient.getBlockBlobClient(blobName);
            await blockBlobClient.deleteIfExists();
        }

        await db.query('DELETE FROM pages WHERE chapter_num = ?', [chapter_num]);
        res.sendStatus(204);
    } catch (err) {
        console.error(err);
        res.status(500).send('Database error');
    }
});

module.exports = router;