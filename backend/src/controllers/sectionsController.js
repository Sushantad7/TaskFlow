const { getSectionsForUser, uuidv4 } = require('../data/store');

// GET all sections for authenticated user
exports.getSections = (req, res) => {
    const sections = getSectionsForUser(req.auth.userId);
    res.json(sections);
};

// POST create section
exports.createSection = (req, res) => {
    const { name, color, icon } = req.body;
    if (!name || !name.trim()) {
        return res.status(400).json({ error: 'Section name is required' });
    }

    const sections = getSectionsForUser(req.auth.userId);
    const section = {
        id: uuidv4(),
        name: name.trim(),
        color: color || '#6366f1',
        icon: icon || '📋',
        tasks: [],
    };
    sections.push(section);
    res.status(201).json(section);
};

// PUT update section
exports.updateSection = (req, res) => {
    const section = req.section;
    const { name, color, icon } = req.body;
    if (name !== undefined) section.name = name.trim();
    if (color !== undefined) section.color = color;
    if (icon !== undefined) section.icon = icon;

    res.json(section);
};

// DELETE section
exports.deleteSection = (req, res) => {
    const sections = getSectionsForUser(req.auth.userId);
    const sectionId = req.params.id;
    const index = sections.findIndex(s => s.id === sectionId);

    if (index === -1) return res.status(404).json({ error: 'Section not found' });

    sections.splice(index, 1);
    res.status(204).send();
};

