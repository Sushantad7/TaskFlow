const { getSectionsForUser, persistSections, uuidv4 } = require('../data/store');

// Returns today's date string and day-of-week in NPT (UTC+5:45)
function getTodayNPT() {
    const utcMs = Date.now();
    const nptMs = utcMs + (5 * 60 + 45) * 60_000;
    const d = new Date(nptMs);
    return {
        dateStr: d.toISOString().substring(0, 10),
        dayOfWeek: d.getUTCDay(), // 0=Sun … 6=Sat
    };
}

function shouldReset(task, today) {
    if (!task.completed || !task.recurrence || task.recurrence === 'none') return false;
    const completedDate = task.completedAt ? task.completedAt.substring(0, 10) : null;
    if (!completedDate || completedDate >= today.dateStr) return false;

    if (task.recurrence === 'daily') return true;

    if (task.recurrence === 'weekly') {
        const days = Array.isArray(task.recurrenceDays) ? task.recurrenceDays : [];
        return days.includes(today.dayOfWeek);
    }
    return false;
}

exports.getSections = async (req, res, next) => {
    try {
        const sections = await getSectionsForUser(req.auth.userId);
        const today = getTodayNPT();
        let dirty = false;

        for (const section of sections) {
            for (const task of section.tasks) {
                if (shouldReset(task, today)) {
                    task.completed   = false;
                    task.completedAt = null;
                    dirty = true;
                }
            }
        }

        if (dirty) await persistSections(req.auth.userId, sections);
        res.json(sections);
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
