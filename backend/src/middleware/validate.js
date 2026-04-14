const { getSectionsForUser } = require('../data/store');

exports.validateSection = async (req, res, next) => {
    try {
        const sections = await getSectionsForUser(req.auth.userId);
        const sectionId = req.params.sectionId || req.params.id;
        const section = sections.find(s => s.id === sectionId);
        if (!section) return res.status(404).json({ error: 'Section not found' });
        req.section = section;
        req.userSections = sections;
        next();
    } catch (err) {
        next(err);
    }
};
