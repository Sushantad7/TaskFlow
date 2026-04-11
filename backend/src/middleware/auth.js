const { verifyToken } = require('@clerk/backend');

exports.requireAuth = async (req, res, next) => {
    try {
        const header = req.headers.authorization;
        if (!header || !header.startsWith('Bearer ')) {
            return res.status(401).json({ error: 'Unauthorized' });
        }
        const token = header.slice(7);
        const payload = await verifyToken(token, {
            secretKey: process.env.CLERK_SECRET_KEY,
        });
        req.auth = { userId: payload.sub };
        next();
    } catch {
        return res.status(401).json({ error: 'Unauthorized' });
    }
};
