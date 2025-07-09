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

router.get('/', async (req, res) => {
    try {
        const [results] = await db.query(`
            SELECT c.chapterNum, c.title, COUNT(p.pageNum) AS pageCount
            FROM chapters c
            LEFT JOIN pages p ON c.chapterNum = p.chapterNum
            GROUP BY c.chapterNum, c.title
            ORDER BY c.chapterNum ASC
        `);
        res.json(results);
    } catch (err) {
        console.error(err);
        res.status(500).send('Database error');
    }
});

router.post('/create', upload.none(), async (req, res) => {
    const { chapterNum, title } = req.body;

    if (!chapterNum || !title) {
        return res.status(400).json('Chapter number and title are required');
    }

    try {
        console.log('Inserting chapter:', chapterNum, title);
        await db.query('INSERT INTO chapters (chapterNum, title) VALUES (?, ?)', [chapterNum, title]);

        res.status(201).json({ message: 'Chapter created successfully!' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error inserting chapter', error: err });
    }
});

router.put('/update/:oldChapterNum', upload.none(), async (req, res) => {
    const { oldChapterNum } = req.params;
    const { chapterNum, title } = req.body;
    const newChapterNum = chapterNum;
    
    console.log(req.body)
    console.log('Updating chapter:', oldChapterNum, 'to', newChapterNum, title);

    if (!title || !newChapterNum) {
        return res.status(400).send('Chapter number and title are required');
    }

    try {
        const [result] = await db.query('UPDATE chapters SET chapterNum = ?, title = ? WHERE chapterNum = ?', [newChapterNum, title, oldChapterNum]);

        if (result.affectedRows === 0) {
            return res.status(404).send('Chapter not found');
        }

        res.sendStatus(204);
    } catch (err) {
        console.error(err);
        res.status(500).send('Database error');
    }
});

router.delete('/delete/:chapterNum', async (req, res) => {
    const { chapterNum } = req.params;

    try {
        // Delete images from the upload directory
        const [images] = await db.query('SELECT image FROM pages WHERE chapterNum = ?', [chapterNum]);
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
        await db.query('DELETE FROM pages WHERE chapterNum = ?', [chapterNum]);

        // Delete the chapter itself
        const [result] = await db.query('DELETE FROM chapters WHERE chapterNum = ?', [chapterNum]);

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

router.get('/:chapterNum/pages', async (req, res) => {
    const { chapterNum } = req.params;

    try {
        const [pages] = await db.query('SELECT * FROM pages WHERE chapterNum = ? ORDER BY pageNum ASC', [chapterNum]);
        res.json(pages);
    } catch (err) {
        console.error(err);
        res.status(500).send('Database error');
    }
});

router.post('/upload/:chapterNum', upload.array('images'), async (req, res) => {
    const { chapterNum } = req.params;

    if (!req.files || req.files.length === 0) {
        return res.status(400).send('No files uploaded');
    }

    try {
        const [result] = await db.query(
            'SELECT MAX(pageNum) AS maxPage FROM pages WHERE chapterNum = ?',
            [chapterNum]
        );

        let nextPageNum = result[0].maxPage ? result[0].maxPage + 1 : 1;

        for (const file of req.files) {
            const imagePath = path.join('/uploads/', file.filename);
            await db.query('INSERT INTO pages (pageNum, chapterNum, image) VALUES (?, ?, ?)', [nextPageNum, chapterNum, imagePath]);
            nextPageNum++;
        }
        res.status(201).json({ message: 'Images uploaded successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).send('Database error');
    }
});

router.put('/reorder/:chapterNum', async (req, res) => {
    const { chapterNum } = req.params;
    const { pages } = req.body;

    if (!Array.isArray(pages) || pages.length === 0) {
        return res.status(400).send('Invalid page order');
    }

    try {
        const updatePromises = pages.map((page, index) => {
            return db.query('UPDATE pages SET pageNum = ? WHERE id = ?', [index + 1, page.id]);
        });

        await Promise.all(updatePromises);
        res.sendStatus(204);
    } catch (err) {
        console.error(err);
        res.status(500).send('Database error');
    }
});

router.delete('/delete/:chapterNum/page/:pageNum', async (req, res) => {
    const { chapterNum, pageNum } = req.params;

    try {
        // Get the image path before deleting
        const [imageResult] = await db.query('SELECT image FROM pages WHERE chapterNum = ? AND pageNum = ?', [chapterNum, pageNum]);
        if (imageResult.length === 0) {
            return res.status(404).send('Page not found');
        }

        const imagePath = path.join(__dirname, '..', imageResult[0].image);
        
        // Delete the page
        const [result] = await db.query('DELETE FROM pages WHERE chapterNum = ? AND pageNum = ?', [chapterNum, pageNum]);

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

router.delete('/delete/:chapterNum/all', async (req, res) => {
    const { chapterNum } = req.params;

    try {
        // Get all images for the chapter
        const [images] = await db.query('SELECT image FROM pages WHERE chapterNum = ?', [chapterNum]);

        // Delete all pages in the chapter
        await db.query('DELETE FROM pages WHERE chapterNum = ?', [chapterNum]);

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