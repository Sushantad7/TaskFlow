const { getSectionsForUser } = require('../data/store');

exports.validateSection = (req, res, next) => {
    const sections = getSectionsForUser(req.auth.userId);
    const sectionId = req.params.sectionId || req.params.id;
    const section = sections.find(s => s.id === sectionId);

    if (!section) {
        return res.status(404).json({ error: 'Section not found' });
    }

    req.section = section;
    next();
};
