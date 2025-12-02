const express = require('express');
const multer = require('multer');
const db = require('../db');
const AdminOnly = require('../middleware/AdminOnly.js');
const { BlobServiceClient } = require("@azure/storage-blob");
require("dotenv").config();

const router = express.Router();

// -----------------------------
// Azure Blob Storage
// -----------------------------
const blobService = BlobServiceClient.fromConnectionString(
    process.env.AZURE_STORAGE_CONNECTION_STRING
);
const containerName = "uploads";
const containerClient = blobService.getContainerClient(containerName);

// Multer (memory buffer)

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
        console.warn("Could not delete blob:", err);
    }
}

// -----------------------------------------------------------------------------
// GET — All posts or paginated
// -----------------------------------------------------------------------------
router.get('/posts', async (req, res) => {
    try {
        const search = req.query.search ? req.query.search.toLowerCase() : null;
        const limit = req.query.limit ? parseInt(req.query.limit) : null;
        const offset = req.query.offset ? parseInt(req.query.offset) : null;

        const isPaginated = search !== null || limit !== null || offset !== null;

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

        let where = "";
        let params = [];

        if (search !== null) {
            where = `WHERE LOWER(wiki.title) LIKE ? OR LOWER(wiki.content) LIKE ?`;
            params.push(`%${search}%`, `%${search}%`);
        }

        const safeLimit = limit ?? 10;
        const safeOffset = offset ?? 0;

        const [countRows] = await db.query(
            `SELECT COUNT(*) AS total FROM wiki ${where}`,
            params
        );

        const total = countRows[0].total;

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

// -----------------------------------------------------------------------------
// GET — Single post by slug
// -----------------------------------------------------------------------------
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

// -----------------------------------------------------------------------------
// POST — Create post
// -----------------------------------------------------------------------------
router.post('/create', AdminOnly, upload.single('image'), async (req, res) => {
    const { title, slug, content } = req.body;

    if (!title || !slug || !content) {
        return res.status(400).json({ message: 'Please provide all fields' });
    }

    let imageUrl = null;

    try {
        if (req.file) {
            imageUrl = await uploadToAzureBlob(req.file.buffer, req.file.originalname);
        }

        await db.query(
            'INSERT INTO wiki (title, slug, content, image) VALUES (?, ?, ?, ?)',
            [title, slug, content, imageUrl]
        );

        res.status(201).json({ message: 'Post created successfully!' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error inserting post', error: err });
    }
});

// -----------------------------------------------------------------------------
// PUT — Update post
// -----------------------------------------------------------------------------
router.put('/:id', AdminOnly, upload.single('image'), async (req, res) => {
    const { id } = req.params;
    const { title, slug, content } = req.body;

    if (!title || !slug || !content) {
        return res.status(400).json({ message: 'Please provide all fields' });
    }

    try {
        let newImageUrl = null;

        if (req.file) {
            // Delete old blob
            const [rows] = await db.query('SELECT image FROM wiki WHERE id = ?', [id]);
            const oldUrl = rows[0]?.image;
            if (oldUrl) await deleteBlobFromUrl(oldUrl);

            // Upload new blob
            newImageUrl = await uploadToAzureBlob(req.file.buffer, req.file.originalname);
        }

        let query = 'UPDATE wiki SET title = ?, slug = ?, content = ?';
        const params = [title, slug, content];

        if (newImageUrl) {
            query += ', image = ?';
            params.push(newImageUrl);
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

// -----------------------------------------------------------------------------
// DELETE — Remove post + blob
// -----------------------------------------------------------------------------
router.delete('/:id', AdminOnly, async (req, res) => {
    const { id } = req.params;

    try {
        const [rows] = await db.query('SELECT image FROM wiki WHERE id = ?', [id]);
        const url = rows[0]?.image;

        if (url) {
            console.log(url);
            result = await deleteBlobFromUrl(url);
            console.log(result);
        }

        await db.query('DELETE FROM wiki WHERE id = ?', [id]);

        res.status(200).json({ message: 'Post deleted successfully!' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error deleting post', error: err });
    }
});

module.exports = router;
