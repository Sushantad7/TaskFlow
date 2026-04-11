const express = require('express');
const { requireAuth } = require('../middleware/auth');
const sectionsRouter = require('./sections');
const tasksRouter = require('./tasks');

const router = express.Router();

router.use(requireAuth);

router.use('/sections', sectionsRouter);
router.use('/sections/:sectionId/tasks', tasksRouter);

module.exports = router;
