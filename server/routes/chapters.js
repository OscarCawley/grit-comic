const express = require('express');
const multer = require('multer');
const db = require('../db');
const AdminOnly = require('../middleware/AdminOnly.js');
const { BlobServiceClient } = require("@azure/storage-blob");
require("dotenv").config();

const router = express.Router();

// -----------------------------------------------------------------------------
// Azure Blob Storage
// -----------------------------------------------------------------------------
const blobService = BlobServiceClient.fromConnectionString(
    process.env.AZURE_STORAGE_CONNECTION_STRING
);
const containerName = "uploads";
const containerClient = blobService.getContainerClient(containerName);

// Multer (buffer mode)
const upload = multer({ storage: multer.memoryStorage() });

// -----------------------------------------------------------------------------
// Helper: Upload blob
// -----------------------------------------------------------------------------
async function uploadToAzureBlob(fileBuffer, originalName) {
    const timestamp = Date.now();
    const safeName = originalName.replace(/\s+/g, "-");
    const blobName = `${timestamp}-${safeName}`;

    const blockBlobClient = containerClient.getBlockBlobClient(blobName);

    await blockBlobClient.uploadData(fileBuffer, {
        blobHTTPHeaders: { blobContentType: "image/jpeg" }
    });

    return blockBlobClient.url;
}

// -----------------------------------------------------------------------------
// Helper: Delete blob from full URL
// -----------------------------------------------------------------------------
async function deleteBlobFromUrl(url) {
    try {
        const blobName = url.split("/").pop();
        const blobClient = containerClient.getBlobClient(blobName);
        await blobClient.deleteIfExists();
    } catch (err) {
        console.warn("Failed to delete blob:", err);
    }
}

// -----------------------------------------------------------------------------
// GET — All chapters
// -----------------------------------------------------------------------------
router.get('/', async (req, res) => {
    try {
        const results = await db.query(`
            SELECT 
                c.chapter_num,
                c.title,
                COUNT(p.page_num) AS pageCount
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

// -----------------------------------------------------------------------------
// POST — Create chapter
// -----------------------------------------------------------------------------
router.post('/create', AdminOnly, upload.none(), async (req, res) => {
    const { chapter_num, title } = req.body;

    if (!chapter_num || !title) {
        return res.status(400).json('Chapter number and title are required');
    }

    try {
        await db.query(
            'INSERT INTO chapters (chapter_num, title) VALUES (@chapter_num, @title)',
            { chapter_num, title }
        );

        res.status(201).json({ message: 'Chapter created successfully!' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error inserting chapter', error: err });
    }
});

// -----------------------------------------------------------------------------
// PUT — Update chapter
// -----------------------------------------------------------------------------
router.put('/update/:oldchapter_num', AdminOnly, upload.none(), async (req, res) => {
    const { oldchapter_num } = req.params;
    const { chapter_num, title } = req.body;

    if (!chapter_num || !title) {
        return res.status(400).send('Chapter number and title are required');
    }

    try {
        const result = await db.query(
            'UPDATE chapters SET chapter_num = @chapter_num, title = @title WHERE chapter_num = @oldchapter_num',
            { chapter_num, title, oldchapter_num }
        );

        if (result.rowsAffected[0] === 0) {
            return res.status(404).send('Chapter not found');
        }

        res.sendStatus(204);
    } catch (err) {
        console.error(err);
        res.status(500).send('Database error');
    }
});

// -----------------------------------------------------------------------------
// DELETE — Entire chapter + all pages + blobs
// -----------------------------------------------------------------------------
router.delete('/delete/:chapter_num', AdminOnly, async (req, res) => {
    const { chapter_num } = req.params;

    try {
        const images = await db.query(
            'SELECT image FROM pages WHERE chapter_num = @chapter_num',
            { chapter_num }
        );

        for (const img of images) {
            await deleteBlobFromUrl(img.image);
        }

        await db.query('DELETE FROM pages WHERE chapter_num = @chapter_num', { chapter_num });
        const result = await db.query('DELETE FROM chapters WHERE chapter_num = @chapter_num', { chapter_num });

        if (result.rowsAffected[0] === 0) {
            return res.status(404).send('Chapter not found');
        }

        res.sendStatus(204);
    } catch (err) {
        console.error(err);
        res.status(500).send('Database error');
    }
});

// -----------------------------------------------------------------------------
// GET — Pages for one chapter
// -----------------------------------------------------------------------------
router.get('/:chapter_num/pages', async (req, res) => {
    const { chapter_num } = req.params;

    try {
        const pages = await db.query(
            'SELECT * FROM pages WHERE chapter_num = @chapter_num ORDER BY page_num ASC',
            { chapter_num }
        );

        res.json(pages);
    } catch (err) {
        console.error(err);
        res.status(500).send('Database error');
    }
});

// -----------------------------------------------------------------------------
// POST — Upload new pages to chapter
// -----------------------------------------------------------------------------
router.post('/upload/:chapter_num', AdminOnly, upload.array('images'), async (req, res) => {
    const { chapter_num } = req.params;

    if (!req.files || req.files.length === 0) {
        return res.status(400).send('No files uploaded');
    }

    try {
        const result = await db.query(
            'SELECT MAX(page_num) AS maxPage FROM pages WHERE chapter_num = @chapter_num',
            { chapter_num }
        );

        let nextPage = result[0].maxPage ? result[0].maxPage + 1 : 1;

        for (const file of req.files) {
            const imageUrl = await uploadToAzureBlob(file.buffer, file.originalname);

            await db.query(
                'INSERT INTO pages (page_num, chapter_num, image) VALUES (@page_num, @chapter_num, @image)',
                { page_num: nextPage, chapter_num, image: imageUrl }
            );

            nextPage++;
        }

        res.status(201).json({ message: 'Images uploaded successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).send('Database error');
    }
});

// -----------------------------------------------------------------------------
// PUT — Reorder pages
// -----------------------------------------------------------------------------
router.put('/reorder/:chapter_num', AdminOnly, async (req, res) => {
    const { pages } = req.body;

    if (!Array.isArray(pages) || pages.length === 0) {
        return res.status(400).send('Invalid page order');
    }

    try {
        const operations = pages.map((page, index) =>
            db.query(
                'UPDATE pages SET page_num = @page_num WHERE id = @id',
                { page_num: index + 1, id: page.id }
            )
        );

        await Promise.all(operations);
        res.sendStatus(204);
    } catch (err) {
        console.error(err);
        res.status(500).send('Database error');
    }
});

// -----------------------------------------------------------------------------
// DELETE — Single page
// -----------------------------------------------------------------------------
router.delete('/delete/:chapter_num/page/:page_num', AdminOnly, async (req, res) => {
    const { chapter_num, page_num } = req.params;

    try {
        const rows = await db.query(
            'SELECT image FROM pages WHERE chapter_num = @chapter_num AND page_num = @page_num',
            { chapter_num, page_num }
        );

        if (rows.length === 0) {
            return res.status(404).send('Page not found');
        }

        await deleteBlobFromUrl(rows[0].image);

        await db.query(
            'DELETE FROM pages WHERE chapter_num = @chapter_num AND page_num = @page_num',
            { chapter_num, page_num }
        );

        res.sendStatus(204);
    } catch (err) {
        console.error(err);
        res.status(500).send('Database error');
    }
});

// -----------------------------------------------------------------------------
// DELETE — All pages in a chapter (but keep chapter)
// -----------------------------------------------------------------------------
router.delete('/delete/:chapter_num/all', AdminOnly, async (req, res) => {
    const { chapter_num } = req.params;

    try {
        const images = await db.query(
            'SELECT image FROM pages WHERE chapter_num = @chapter_num',
            { chapter_num }
        );

        for (const img of images) {
            await deleteBlobFromUrl(img.image);
        }

        await db.query('DELETE FROM pages WHERE chapter_num = @chapter_num', { chapter_num });

        res.sendStatus(204);
    } catch (err) {
        console.error(err);
        res.status(500).send('Database error');
    }
});

module.exports = router;
