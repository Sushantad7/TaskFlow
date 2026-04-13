const { execSync } = require('child_process');

const MARKER = '# taskflow-daily-summary';

// NPT is UTC+5:45, so subtract 5h45m to get UTC
function nptToUtc(hour, minute) {
    let totalMinutes = hour * 60 + minute - (5 * 60 + 45);
    if (totalMinutes < 0) totalMinutes += 24 * 60;
    return {
        hour:   Math.floor(totalMinutes / 60) % 24,
        minute: totalMinutes % 60,
    };
}

function buildCronLine(sendHour, sendMinute) {
    const { hour, minute } = nptToUtc(sendHour, sendMinute);
    const key  = process.env.INTERNAL_KEY;
    const port = process.env.PORT || 3001;
    const cmd  = `curl -s -X POST http://localhost:${port}/internal/send-summary -H "x-internal-key: ${key}" >> /home/${process.env.USER || 'realkop7'}/todo/backend/email.log 2>&1`;
    return `${minute} ${hour} * * * ${cmd} ${MARKER}`;
}

exports.updateCrontab = (sendHour, sendMinute) => {
    try {
        let existing = '';
        try { existing = execSync('crontab -l 2>/dev/null').toString(); } catch { /* no crontab yet */ }

        // Remove old taskflow line, add new one
        const lines = existing.split('\n').filter(l => !l.includes(MARKER) && l.trim() !== '');
        lines.push(buildCronLine(sendHour, sendMinute));

        execSync(`echo "${lines.join('\n')}" | crontab -`);
        console.log(`📅 Crontab updated: daily email at ${String(sendHour).padStart(2,'0')}:${String(sendMinute).padStart(2,'0')} NPT`);
    } catch (err) {
        console.error('Failed to update crontab:', err.message);
    }
};
