const express = require('express');
const router = express.Router({ mergeParams: true });
const tasksController = require('../controllers/tasksController');
const { validateSection } = require('../middleware/validate');

// Use validateSection middleware for all task routes since they all need section context
router.use(validateSection);

// GET tasks for a section
router.get('/', tasksController.getTasks);

// POST create task
router.post('/', tasksController.createTask);

// PUT update task
router.put('/:taskId', tasksController.updateTask);

// DELETE task
router.delete('/:taskId', tasksController.deleteTask);

module.exports = router;
