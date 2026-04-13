const express = require('express');
const router = express.Router();
const { getUserSettings, setUserSettings } = require('../data/settingsStore');
const { getSectionsForUser } = require('../data/store');
const { sendDailySummary } = require('../services/emailService');
const { updateCrontab } = require('../services/crontabService');

// GET email settings for the authenticated user
router.get('/email', (req, res) => {
    res.json(getUserSettings(req.auth.userId));
});

// POST save email settings — also rewrites the system crontab
router.post('/email', (req, res) => {
    const { enabled, displayName, sendHour, sendMinute } = req.body;
    const settings = setUserSettings(req.auth.userId, { enabled, displayName, sendHour, sendMinute });

    // Keep crontab in sync with the stored time
    if (enabled) {
        updateCrontab(settings.sendHour, settings.sendMinute);
    }

    res.json(settings);
});

// POST send a test email right now
router.post('/email/test', async (req, res) => {
    if (!process.env.RESEND_API_KEY) {
        return res.status(500).json({ error: 'RESEND_API_KEY not set in .env' });
    }
    try {
        const settings = getUserSettings(req.auth.userId);
        const sections = getSectionsForUser(req.auth.userId);
        await sendDailySummary({
            userId:      req.auth.userId,
            displayName: settings.displayName || '',
            sections,
        });
        res.json({ ok: true });
    } catch (err) {
        console.error('Test email failed:', err.message);
        res.status(500).json({ error: 'Failed to send email. Check server logs.' });
    }
});

module.exports = router;
