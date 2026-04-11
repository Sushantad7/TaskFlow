const { v4: uuidv4 } = require('uuid');

// In-memory data store – mapping users to their own sections
const userSections = new Map();

const getSectionsForUser = (userId) => {
    if (!userSections.has(userId)) {
        // Initial default sections for a new user
        userSections.set(userId, [
            { id: uuidv4(), name: 'Personal', color: '#6366f1', icon: '🏠', tasks: [] },
            { id: uuidv4(), name: 'Shopping', color: '#10b981', icon: '🛒', tasks: [] },
        ]);
    }
    return userSections.get(userId);
};

module.exports = { getSectionsForUser, uuidv4 };

