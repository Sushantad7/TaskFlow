const { MongoClient } = require('mongodb');

let db;

async function connectDB() {
    const client = new MongoClient(process.env.MONGODB_URI);
    await client.connect();
    db = client.db('taskflow');
    await db.collection('sections').createIndex({ userId: 1 }, { unique: true });
    await db.collection('settings').createIndex({ userId: 1 }, { unique: true });
    console.log('✅ MongoDB connected');
}

function getDB() {
    if (!db) throw new Error('Database not connected');
    return db;
}

module.exports = { connectDB, getDB };
