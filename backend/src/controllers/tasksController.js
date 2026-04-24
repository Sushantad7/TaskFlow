const { persistSections, uuidv4 } = require('../data/store');

exports.getTasks = (req, res) => {
    res.json(req.section.tasks);
};

exports.createTask = async (req, res, next) => {
    try {
        const { title, description, priority, dueDate } = req.body;
        if (!title || !title.trim()) return res.status(400).json({ error: 'Task title is required' });

        const { recurrence, recurrenceDays } = req.body;
        const task = {
            id: uuidv4(),
            title: title.trim(),
            description: description || '',
            priority: priority || 'medium',
            dueDate: dueDate || null,
            recurrence: recurrence || 'none',
            recurrenceDays: recurrence === 'weekly' && Array.isArray(recurrenceDays) ? recurrenceDays : [],
            completed: false,
            createdAt: new Date().toISOString(),
            completedAt: null,
        };
        req.section.tasks.push(task);
        await persistSections(req.auth.userId, req.userSections);
        res.status(201).json(task);
    } catch (err) { next(err); }
};

exports.updateTask = async (req, res, next) => {
    try {
        const task = req.section.tasks.find(t => t.id === req.params.taskId);
        if (!task) return res.status(404).json({ error: 'Task not found' });

        const { title, description, priority, dueDate, completed, recurrence, recurrenceDays } = req.body;
        if (title           !== undefined) task.title           = title.trim();
        if (description     !== undefined) task.description     = description;
        if (priority        !== undefined) task.priority        = priority;
        if (dueDate         !== undefined) task.dueDate         = dueDate;
        if (recurrence      !== undefined) task.recurrence      = recurrence;
        if (recurrenceDays  !== undefined) task.recurrenceDays  = Array.isArray(recurrenceDays) ? recurrenceDays : [];
        if (completed       !== undefined) {
            task.completed   = completed;
            task.completedAt = completed ? new Date().toISOString() : null;
        }
        await persistSections(req.auth.userId, req.userSections);
        res.json(task);
    } catch (err) { next(err); }
};

exports.deleteTask = async (req, res, next) => {
    try {
        const index = req.section.tasks.findIndex(t => t.id === req.params.taskId);
        if (index === -1) return res.status(404).json({ error: 'Task not found' });
        req.section.tasks.splice(index, 1);
        await persistSections(req.auth.userId, req.userSections);
        res.status(204).send();
    } catch (err) { next(err); }
};
