const Meeting = require('../../model/schema/meeting');

// Get all meetings
const index = async (req, res) => {
    try {
        const query = { ...req.query, deleted: false };
        
        const meetings = await Meeting.find(query)
            .populate('organizer', 'firstName lastName username')
            .populate('participants', 'firstName lastName username')
            .sort({ createdAt: -1 });
        
        res.status(200).json({ meetings });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Create a new meeting
const create = async (req, res) => {
    try {
        const { title, description, startTime, endTime, location, meetingType, meetingLink, participants, organizer } = req.body;
        
        // Validate required fields
        if (!title || !startTime || !endTime || !organizer) {
            return res.status(400).json({ message: 'Missing required fields' });
        }
        
        // Validate start time is before end time
        if (new Date(startTime) >= new Date(endTime)) {
            return res.status(400).json({ message: 'Start time must be before end time' });
        }
        
        const meeting = new Meeting({
            title,
            description,
            startTime,
            endTime,
            location,
            meetingType,
            meetingLink,
            participants,
            organizer,
        });
        
        await meeting.save();
        
        res.status(201).json({ message: 'Meeting created successfully', meeting });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get a specific meeting
const view = async (req, res) => {
    try {
        const meeting = await Meeting.findOne({ _id: req.params.id, deleted: false })
            .populate('organizer', 'firstName lastName username')
            .populate('participants', 'firstName lastName username');
        
        if (!meeting) {
            return res.status(404).json({ message: 'Meeting not found' });
        }
        
        res.status(200).json(meeting);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Update a meeting
const update = async (req, res) => {
    try {
        const { title, description, startTime, endTime, location, meetingType, meetingLink, participants, status } = req.body;
        
        // Validate start time is before end time if both are provided
        if (startTime && endTime && new Date(startTime) >= new Date(endTime)) {
            return res.status(400).json({ message: 'Start time must be before end time' });
        }
        
        const meeting = await Meeting.findById(req.params.id);
        
        if (!meeting) {
            return res.status(404).json({ message: 'Meeting not found' });
        }
        
        // Update the meeting fields
        if (title) meeting.title = title;
        if (description !== undefined) meeting.description = description;
        if (startTime) meeting.startTime = startTime;
        if (endTime) meeting.endTime = endTime;
        if (location !== undefined) meeting.location = location;
        if (meetingType) meeting.meetingType = meetingType;
        if (meetingLink !== undefined) meeting.meetingLink = meetingLink;
        if (participants) meeting.participants = participants;
        if (status) meeting.status = status;
        
        meeting.updatedAt = Date.now();
        
        await meeting.save();
        
        res.status(200).json({ message: 'Meeting updated successfully', meeting });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Soft delete a meeting
const deleteData = async (req, res) => {
    try {
        const meeting = await Meeting.findById(req.params.id);
        
        if (!meeting) {
            return res.status(404).json({ message: 'Meeting not found' });
        }
        
        meeting.deleted = true;
        meeting.updatedAt = Date.now();
        
        await meeting.save();
        
        res.status(200).json({ message: 'Meeting deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Delete multiple meetings
const deleteMany = async (req, res) => {
    try {
        const meetingIds = req.body;
        
        if (!Array.isArray(meetingIds) || meetingIds.length === 0) {
            return res.status(400).json({ message: 'Invalid request. Please provide an array of meeting IDs.' });
        }
        
        const result = await Meeting.updateMany(
            { _id: { $in: meetingIds } },
            { $set: { deleted: true, updatedAt: Date.now() } }
        );
        
        res.status(200).json({
            message: 'Meetings deleted successfully',
            count: result.modifiedCount
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = {
    index,
    create,
    view,
    update,
    deleteData,
    deleteMany
};