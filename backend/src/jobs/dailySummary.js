const { getAllSettings } = require('../data/settingsStore');
const { getSectionsForUser } = require('../data/store');
const { sendDailySummary } = require('../services/emailService');

async function run() {
    const allSettings = getAllSettings();
    const results = [];

    for (const [userId, settings] of Object.entries(allSettings)) {
        if (!settings.enabled || !settings.toEmail) continue;
        try {
            const sections = getSectionsForUser(userId);
            await sendDailySummary({
                userId,
                displayName: settings.displayName || '',
                sections,
            });
            console.log(`✉️  Daily summary sent to ${settings.toEmail}`);
            results.push({ userId, ok: true });
        } catch (err) {
            console.error(`Failed to send summary for ${userId}:`, err.message);
            results.push({ userId, ok: false, error: err.message });
        }
    }

    return results;
}

module.exports = { run };
