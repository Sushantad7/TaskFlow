require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { connectDB } = require('./src/data/db');

const routes = require('./src/routes');
const internalRoutes = require('./src/routes/internal');
const { notFound, errorHandler } = require('./src/middleware/error');

const app = express();
const PORT = process.env.PORT || 3001;

const allowedOrigins = (process.env.ALLOWED_ORIGINS || 'http://localhost:5173')
    .split(',')
    .map(origin => origin.trim())
    .filter(Boolean);
app.use(cors({ origin: allowedOrigins, allowedHeaders: ['Content-Type', 'Authorization'] }));
app.use(express.json());

app.use('/internal', internalRoutes);
app.use('/api', routes);

app.use(notFound);
app.use(errorHandler);

connectDB().then(() => {
    app.listen(PORT, () => console.log(`✅  TaskFlow API  →  http://localhost:${PORT}`));
}).catch(err => {
    console.error('Failed to connect to MongoDB:', err.message);
    process.exit(1);
});
