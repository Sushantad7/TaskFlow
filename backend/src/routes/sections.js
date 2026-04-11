const express = require('express');
const router = express.Router();
const sectionsController = require('../controllers/sectionsController');
const { validateSection } = require('../middleware/validate');

// GET all sections
router.get('/', sectionsController.getSections);

// POST create section
router.post('/', sectionsController.createSection);

// PUT update section
router.put('/:id', validateSection, sectionsController.updateSection);

// DELETE section
router.delete('/:id', validateSection, sectionsController.deleteSection);

module.exports = router;
