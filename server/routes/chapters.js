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

router.use('/uploads', express.static(uploadDir));

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

router.post('/create', AdminOnly, upload.none(), async (req, res) => {
    const { chapter_num, title } = req.body;

    if (!chapter_num || !title) {
        return res.status(400).json('Chapter number and title are required');
    }

    try {
        console.log('Inserting chapter:', chapter_num, title);
        await db.query('INSERT INTO chapters (chapter_num, title) VALUES (?, ?)', [chapter_num, title]);

        res.status(201).json({ message: 'Chapter created successfully!' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error inserting chapter', error: err });
    }
});

router.put('/update/:oldchapter_num', AdminOnly, upload.none(), async (req, res) => {
    const { oldchapter_num } = req.params;
    const { chapter_num, title } = req.body;
    const newchapter_num = chapter_num;
    
    console.log(req.body)
    console.log('Updating chapter:', oldchapter_num, 'to', newchapter_num, title);

    if (!title || !newchapter_num) {
        return res.status(400).send('Chapter number and title are required');
    }

    try {
        const [result] = await db.query('UPDATE chapters SET chapter_num = ?, title = ? WHERE chapter_num = ?', [newchapter_num, title, oldchapter_num]);

        if (result.affectedRows === 0) {
            return res.status(404).send('Chapter not found');
        }

        res.sendStatus(204);
    } catch (err) {
        console.error(err);
        res.status(500).send('Database error');
    }
});

router.delete('/delete/:chapter_num', AdminOnly, async (req, res) => {
    const { chapter_num } = req.params;

    try {
        // Delete images from the upload directory
        const [images] = await db.query('SELECT image FROM pages WHERE chapter_num = ?', [chapter_num]);
        for (const img of images) {
            const filePath = path.join(__dirname, '..', img.image);
            try {
                if (fs.existsSync(filePath)) {
                    fs.unlinkSync(filePath);
                }
            } catch (e) {
                console.error(`Failed to delete image ${img.image}:`, e);
            }
        }

        // Delete all pages associated with this chapter
        await db.query('DELETE FROM pages WHERE chapter_num = ?', [chapter_num]);

        // Delete the chapter itself
        const [result] = await db.query('DELETE FROM chapters WHERE chapter_num = ?', [chapter_num]);

        if (result.affectedRows === 0) {
            return res.status(404).send('Chapter not found');
        }

        res.sendStatus(204);
    }
    catch (err) {
        console.error(err);
        res.status(500).send('Database error');
    }
});

router.get('/:chapter_num/pages', async (req, res) => {
    const { chapter_num } = req.params;

    try {
        const [pages] = await db.query('SELECT * FROM pages WHERE chapter_num = ? ORDER BY page_num ASC', [chapter_num]);
        res.json(pages);
    } catch (err) {
        console.error(err);
        res.status(500).send('Database error');
    }
});

router.post('/upload/:chapter_num', AdminOnly, upload.array('images'), async (req, res) => {
    const { chapter_num } = req.params;

    if (!req.files || req.files.length === 0) {
        return res.status(400).send('No files uploaded');
    }

    try {
        const [result] = await db.query(
            'SELECT MAX(page_num) AS maxPage FROM pages WHERE chapter_num = ?',
            [chapter_num]
        );

        let nextpage_num = result[0].maxPage ? result[0].maxPage + 1 : 1;

        for (const file of req.files) {
            const imagePath = path.join('/uploads/', file.filename);
            await db.query('INSERT INTO pages (page_num, chapter_num, image) VALUES (?, ?, ?)', [nextpage_num, chapter_num, imagePath]);
            nextpage_num++;
        }
        res.status(201).json({ message: 'Images uploaded successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).send('Database error');
    }
});

router.put('/reorder/:chapter_num', AdminOnly, async (req, res) => {
    const { chapter_num } = req.params;
    const { pages } = req.body;

    if (!Array.isArray(pages) || pages.length === 0) {
        return res.status(400).send('Invalid page order');
    }

    try {
        const updatePromises = pages.map((page, index) => {
            return db.query('UPDATE pages SET page_num = ? WHERE id = ?', [index + 1, page.id]);
        });

        await Promise.all(updatePromises);
        res.sendStatus(204);
    } catch (err) {
        console.error(err);
        res.status(500).send('Database error');
    }
});

router.delete('/delete/:chapter_num/page/:page_num', AdminOnly, async (req, res) => {
    const { chapter_num, page_num } = req.params;

    try {
        // Get the image path before deleting
        const [imageResult] = await db.query('SELECT image FROM pages WHERE chapter_num = ? AND page_num = ?', [chapter_num, page_num]);
        if (imageResult.length === 0) {
            return res.status(404).send('Page not found');
        }

        const imagePath = path.join(__dirname, '..', imageResult[0].image);
        
        // Delete the page
        const [result] = await db.query('DELETE FROM pages WHERE chapter_num = ? AND page_num = ?', [chapter_num, page_num]);

        if (result.affectedRows === 0) {
            return res.status(404).send('Page not found');
        }

        // Delete the image file
        if (fs.existsSync(imagePath)) {
            fs.unlinkSync(imagePath);
        }

        res.sendStatus(204);
    } catch (err) {
        console.error(err);
        res.status(500).send('Database error');
    }
});

router.delete('/delete/:chapter_num/all', AdminOnly, async (req, res) => {
    const { chapter_num } = req.params;

    try {
        // Get all images for the chapter
        const [images] = await db.query('SELECT image FROM pages WHERE chapter_num = ?', [chapter_num]);

        // Delete all pages in the chapter
        await db.query('DELETE FROM pages WHERE chapter_num = ?', [chapter_num]);

        // Delete image files from the server
        for (const img of images) {
            const filePath = path.join(__dirname, '..', img.image);
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
            }
        }

        res.sendStatus(204);
    } catch (err) {
        console.error(err);
        res.status(500).send('Database error');
    }
});

module.exports = router;