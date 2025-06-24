const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// Import routes
const userRoutes = require('./routes/users');
const wikiRoutes = require('./routes/wiki');

// Mount routes
app.use('/api/users', userRoutes);
app.use('/api/wiki', wikiRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));