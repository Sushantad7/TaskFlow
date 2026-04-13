const fs = require('fs');
const path = require('path');

const FILE = path.join(__dirname, 'userSettings.json');

function load() {
    if (!fs.existsSync(FILE)) return {};
    try { return JSON.parse(fs.readFileSync(FILE, 'utf8')); }
    catch { return {}; }
}

function save(data) {
    fs.writeFileSync(FILE, JSON.stringify(data, null, 2));
}

const defaults = { enabled: false, sendHour: 12, sendMinute: 0, displayName: '' };

exports.getUserSettings = (userId) => {
    return { ...defaults, ...load()[userId] };
};

exports.setUserSettings = (userId, updates) => {
    const all = load();
    all[userId] = { ...defaults, ...all[userId], ...updates };
    save(all);
    return all[userId];
};

exports.getAllSettings = () => load();
