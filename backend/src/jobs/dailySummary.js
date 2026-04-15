const { getAllSettings, getEnabledSettings, markSummarySentForDate } = require('../data/settingsStore');
const { getSectionsForUser } = require('../data/store');
const { sendDailySummary } = require('../services/emailService');

const DAILY_SEND_HOUR_NPT = 15;
const DAILY_SEND_MINUTE_NPT = 30;

async function run() {
    const allSettings = await getAllSettings();
    const results = [];

    for (const [userId, settings] of Object.entries(allSettings)) {
        if (!settings.enabled) continue;
        try {
            const sections = await getSectionsForUser(userId);
            await sendDailySummary({ userId, displayName: settings.displayName || '', sections });
            console.log(`✉️  Daily summary sent for ${userId}`);
            results.push({ userId, ok: true });
        } catch (err) {
            console.error(`Failed to send summary for ${userId}:`, err.message);
            results.push({ userId, ok: false, error: err.message });
        }
    }

    return results;
}

function getNptNow(now = new Date()) {
    const utcMs = now.getTime() + (now.getTimezoneOffset() * 60_000);
    const nptMs = utcMs + ((5 * 60 + 45) * 60_000);
    const npt = new Date(nptMs);
    return {
        year: npt.getUTCFullYear(),
        month: npt.getUTCMonth() + 1,
        day: npt.getUTCDate(),
        hour: npt.getUTCHours(),
        minute: npt.getUTCMinutes(),
    };
}

function getDateKey(nptNow) {
    return `${nptNow.year}-${String(nptNow.month).padStart(2, '0')}-${String(nptNow.day).padStart(2, '0')}`;
}

async function runDueNow(now = new Date()) {
    const nptNow = getNptNow(now);
    const dateKey = getDateKey(nptNow);
    const results = [];

    const isScheduledMinute = nptNow.hour === DAILY_SEND_HOUR_NPT
        && nptNow.minute === DAILY_SEND_MINUTE_NPT;
    if (!isScheduledMinute) return results;

    const enabledSettings = await getEnabledSettings();

    for (const settings of enabledSettings) {
        if (settings.lastSentDateKey === dateKey) continue;

        try {
            const sections = await getSectionsForUser(settings.userId);
            await sendDailySummary({
                userId: settings.userId,
                displayName: settings.displayName || '',
                sections,
            });
            await markSummarySentForDate(settings.userId, dateKey);
            console.log(`✉️  Scheduled summary sent for ${settings.userId} at fixed time 15:30 NPT`);
            results.push({ userId: settings.userId, ok: true });
        } catch (err) {
            console.error(`Failed scheduled summary for ${settings.userId}:`, err.message);
            results.push({ userId: settings.userId, ok: false, error: err.message });
        }
    }

    return results;
}

module.exports = { run, runDueNow, getNptNow, DAILY_SEND_HOUR_NPT, DAILY_SEND_MINUTE_NPT };
