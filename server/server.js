const express = require('express');
const path = require('path');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Import routes
const chapterRoutes = require('./routes/chapters');
const wikiRoutes = require('./routes/wiki');
const userRoutes = require('./routes/users');
const assetRoutes = require('./routes/assets');


// Mount routes
app.use('/api/chapters', chapterRoutes);
app.use('/api/wiki', wikiRoutes);
app.use('/api/users', userRoutes);
app.use('/api/assets', assetRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));