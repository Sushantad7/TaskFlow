const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const FILE = path.join(__dirname, 'sections.json');

function load() {
    if (!fs.existsSync(FILE)) return {};
    try { return JSON.parse(fs.readFileSync(FILE, 'utf8')); }
    catch { return {}; }
}

function save(data) {
    fs.writeFileSync(FILE, JSON.stringify(data, null, 2));
}

const getSectionsForUser = (userId) => {
    const all = load();
    if (!all[userId]) {
        all[userId] = [
            { id: uuidv4(), name: 'Personal', color: '#6366f1', icon: '🏠', tasks: [] },
            { id: uuidv4(), name: 'Shopping', color: '#10b981', icon: '🛒', tasks: [] },
        ];
        save(all);
    }
    return all[userId];
};

const persistSections = (userId, sections) => {
    const all = load();
    all[userId] = sections;
    save(all);
};

module.exports = { getSectionsForUser, persistSections, uuidv4 };
