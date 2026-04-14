const { getDB } = require('./db');

const defaults = { enabled: false, sendHour: 12, sendMinute: 0, displayName: '' };

const getUserSettings = async (userId) => {
    const doc = await getDB().collection('settings').findOne({ userId });
    return { ...defaults, ...doc };
};

const setUserSettings = async (userId, updates) => {
    const current = await getUserSettings(userId);
    const settings = { ...current, ...updates };
    await getDB().collection('settings').updateOne(
        { userId },
        { $set: { userId, ...settings } },
        { upsert: true }
    );
    return settings;
};

const getAllSettings = async () => {
    const docs = await getDB().collection('settings').find({ enabled: true }).toArray();
    return docs.reduce((acc, doc) => { acc[doc.userId] = doc; return acc; }, {});
};

module.exports = { getUserSettings, setUserSettings, getAllSettings };
