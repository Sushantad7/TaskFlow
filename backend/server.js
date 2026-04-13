require('dotenv').config();
const express = require('express');
const cors = require('cors');

const routes = require('./src/routes');
const internalRoutes = require('./src/routes/internal');
const { notFound, errorHandler } = require('./src/middleware/error');

const app = express();
const PORT = process.env.PORT || 3001;

// ── Middleware ─────────────────────────────────────────────────
const allowedOrigins = (process.env.ALLOWED_ORIGINS || 'http://localhost:5173').split(',');
app.use(cors({
    origin: allowedOrigins,
    allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json());

// ── Routes ────────────────────────────────────────────────────
app.use('/internal', internalRoutes);
app.use('/api', routes);

// ── Errors ────────────────────────────────────────────────────
app.use(notFound);
app.use(errorHandler);

// ── Start ─────────────────────────────────────────────────────
app.listen(PORT, () => {
    console.log(`✅  TaskFlow API  →  http://localhost:${PORT}`);
});
