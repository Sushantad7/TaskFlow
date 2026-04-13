const express = require('express');
const router = express.Router();
const { run } = require('../jobs/dailySummary');

// Protected by a secret key — never exposed to the frontend
router.post('/send-summary', async (req, res) => {
    const key = req.headers['x-internal-key'];
    if (!key || key !== process.env.INTERNAL_KEY) {
        return res.status(401).json({ error: 'Unauthorized' });
    }
    const results = await run();
    res.json({ sent: results.length, results });
});

module.exports = router;
