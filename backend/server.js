require('dotenv').config();
const express = require('express');
const cors = require('cors');

const routes = require('./src/routes');
const { notFound, errorHandler } = require('./src/middleware/error');

const app = express();
const PORT = process.env.PORT || 3001;

// ── Middleware ─────────────────────────────────────────────────
app.use(cors({
    origin: 'http://localhost:5173',
    allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json());

// ── Routes ────────────────────────────────────────────────────
app.use('/api', routes);

// ── Errors ────────────────────────────────────────────────────
app.use(notFound);
app.use(errorHandler);

// ── Start ─────────────────────────────────────────────────────
app.listen(PORT, () => {
    console.log(`✅  TaskFlow API  →  http://localhost:${PORT}`);
});
