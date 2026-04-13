const { getSectionsForUser, uuidv4 } = require('../data/store');

// GET tasks for a section
exports.getTasks = (req, res) => {
    res.json(req.section.tasks);
};

// POST create task
exports.createTask = (req, res) => {
    const section = req.section;

    const { title, description, priority, dueDate } = req.body;
    if (!title || !title.trim()) {
        return res.status(400).json({ error: 'Task title is required' });
    }

    const task = {
        id: uuidv4(),
        title: title.trim(),
        description: description || '',
        priority: priority || 'medium',
        dueDate: dueDate || null,
        completed: false,
        createdAt: new Date().toISOString(),
    };
    section.tasks.push(task);
    res.status(201).json(task);
};

// PUT update task
exports.updateTask = (req, res) => {
    const section = req.section;
    const task = section.tasks.find(t => t.id === req.params.taskId);
    if (!task) return res.status(404).json({ error: 'Task not found' });

    const { title, description, priority, dueDate, completed } = req.body;
    if (title !== undefined) task.title = title.trim();
    if (description !== undefined) task.description = description;
    if (priority !== undefined) task.priority = priority;
    if (dueDate !== undefined) task.dueDate = dueDate;
    if (completed !== undefined) {
        task.completed = completed;
        task.completedAt = completed ? new Date().toISOString() : null;
    }

    res.json(task);
};

// DELETE task
exports.deleteTask = (req, res) => {
    const section = req.section;
    const index = section.tasks.findIndex(t => t.id === req.params.taskId);
    if (index === -1) return res.status(404).json({ error: 'Task not found' });
    section.tasks.splice(index, 1);
    res.status(204).send();
};
