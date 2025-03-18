const express = require('express');
const router = express.Router();
const meetingController = require('./meeting');

// Get all meetings
router.get('/', meetingController.index);

// Create a new meeting
router.post('/', meetingController.create);

// Get a specific meeting
router.get('/:id', meetingController.view);

// Update a meeting
router.put('/:id', meetingController.update);

// Delete a meeting
router.delete('/:id', meetingController.deleteData);

// Delete multiple meetings
router.delete('/', meetingController.deleteMany);

module.exports = router;