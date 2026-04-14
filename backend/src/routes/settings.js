const express = require('express');
const router = express.Router();
const { getUserSettings, setUserSettings } = require('../data/settingsStore');
const { getSectionsForUser } = require('../data/store');
const { sendDailySummary } = require('../services/emailService');
const { updateCrontab } = require('../services/crontabService');

router.get('/email', async (req, res, next) => {
    try {
        res.json(await getUserSettings(req.auth.userId));
    } catch (err) { next(err); }
});

router.post('/email', async (req, res, next) => {
    try {
        const { enabled, displayName, sendHour, sendMinute } = req.body;
        const settings = await setUserSettings(req.auth.userId, { enabled, displayName, sendHour, sendMinute });
        if (enabled) updateCrontab(settings.sendHour, settings.sendMinute);
        res.json(settings);
    } catch (err) { next(err); }
});

router.post('/email/test', async (req, res, next) => {
    if (!process.env.RESEND_API_KEY) {
        return res.status(500).json({ error: 'RESEND_API_KEY not set in .env' });
    }
    try {
        const [settings, sections] = await Promise.all([
            getUserSettings(req.auth.userId),
            getSectionsForUser(req.auth.userId),
        ]);
        await sendDailySummary({ userId: req.auth.userId, displayName: settings.displayName, sections });
        res.json({ ok: true });
    } catch (err) {
        console.error('Test email failed:', err.message);
        res.status(500).json({ error: 'Failed to send email. Check server logs.' });
    }
});

module.exports = router;
