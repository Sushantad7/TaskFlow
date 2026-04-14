const { getDB } = require('./db');
const { v4: uuidv4 } = require('uuid');

const getSectionsForUser = async (userId) => {
    const doc = await getDB().collection('sections').findOne({ userId });
    if (!doc) {
        const sections = [
            { id: uuidv4(), name: 'Personal', color: '#6366f1', icon: '🏠', tasks: [] },
            { id: uuidv4(), name: 'Shopping', color: '#10b981', icon: '🛒', tasks: [] },
        ];
        await getDB().collection('sections').insertOne({ userId, sections });
        return sections;
    }
    return doc.sections;
};

const persistSections = async (userId, sections) => {
    await getDB().collection('sections').updateOne(
        { userId },
        { $set: { sections } },
        { upsert: true }
    );
};

module.exports = { getSectionsForUser, persistSections, uuidv4 };
