const { getSectionsForUser, persistSections, uuidv4 } = require('../data/store');

exports.getSections = async (req, res, next) => {
    try {
        res.json(await getSectionsForUser(req.auth.userId));
    } catch (err) { next(err); }
};

exports.createSection = async (req, res, next) => {
    try {
        const { name, color, icon } = req.body;
        if (!name || !name.trim()) return res.status(400).json({ error: 'Section name is required' });

        const sections = await getSectionsForUser(req.auth.userId);
        const section = {
            id: uuidv4(),
            name: name.trim(),
            color: color || '#6366f1',
            icon: icon || '📋',
            tasks: [],
        };
        sections.push(section);
        await persistSections(req.auth.userId, sections);
        res.status(201).json(section);
    } catch (err) { next(err); }
};

exports.updateSection = async (req, res, next) => {
    try {
        const { name, color, icon } = req.body;
        if (name  !== undefined) req.section.name  = name.trim();
        if (color !== undefined) req.section.color = color;
        if (icon  !== undefined) req.section.icon  = icon;
        await persistSections(req.auth.userId, req.userSections);
        res.json(req.section);
    } catch (err) { next(err); }
};

exports.deleteSection = async (req, res, next) => {
    try {
        const sections = await getSectionsForUser(req.auth.userId);
        const index = sections.findIndex(s => s.id === req.params.id);
        if (index === -1) return res.status(404).json({ error: 'Section not found' });
        sections.splice(index, 1);
        await persistSections(req.auth.userId, sections);
        res.status(204).send();
    } catch (err) { next(err); }
};
