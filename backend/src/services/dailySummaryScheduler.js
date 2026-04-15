const {
    runDueNow,
    getNptNow,
    DAILY_SEND_HOUR_NPT,
    DAILY_SEND_MINUTE_NPT,
} = require('../jobs/dailySummary');

let intervalRef = null;

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function tick() {
    const nptNow = getNptNow();
    try {
        const results = await runDueNow();
        if (results.length > 0) {
            console.log(`📬 Scheduler tick ${String(nptNow.hour).padStart(2, '0')}:${String(nptNow.minute).padStart(2, '0')} NPT → processed ${results.length} summary jobs`);
        }
    } catch (err) {
        console.error('Daily summary scheduler tick failed:', err.message);
    }
}

function startDailySummaryScheduler() {
    if (intervalRef) return;

    const now = new Date();
    const msUntilNextMinute = (60 - now.getSeconds()) * 1000 - now.getMilliseconds();

    sleep(msUntilNextMinute).then(() => {
        tick();
        intervalRef = setInterval(tick, 60_000);
    });

    console.log(`⏱️  Daily summary scheduler started (checks every minute; sends daily at ${String(DAILY_SEND_HOUR_NPT).padStart(2, '0')}:${String(DAILY_SEND_MINUTE_NPT).padStart(2, '0')} NPT).`);
}

module.exports = { startDailySummaryScheduler };
