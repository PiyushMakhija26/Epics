const express = require('express');
const Request = require('../models/Request');
const { authMiddleware, adminAuthMiddleware } = require('../middleware/auth');

const router = express.Router();

// Create a new request (User)
router.post('/create', authMiddleware, async (req, res) => {
  try {
    const { title, description, department, images } = req.body;

    if (!title || !description || !department) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    if (description.length > 150) {
      return res.status(400).json({ message: 'Description cannot exceed 150 characters' });
    }

    const newRequest = new Request({
      userId: req.userId,
      title,
      description,
      department,
      images: images || [],
    });

    await newRequest.save();
    await newRequest.populate('userId', 'name email');

    res.status(201).json({
      message: 'Request created successfully',
      request: newRequest,
    });
  } catch (error) {
    res.status(500).json({ message: 'Error creating request', error: error.message });
  }
});

// Get all requests for a user
router.get('/user/all', authMiddleware, async (req, res) => {
  try {
    const requests = await Request.find({ userId: req.userId })
      .populate('allocatedTo', 'name department');

    res.json(requests);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching requests', error: error.message });
  }
});

// Get requests by status for user
router.get('/user/:status', authMiddleware, async (req, res) => {
  try {
    const { status } = req.params;
    const requests = await Request.find({ userId: req.userId, status })
      .populate('allocatedTo', 'name department')
      .sort({ createdAt: -1 });

    res.json(requests);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching requests', error: error.message });
  }
});

// Get single request
router.get('/:id', async (req, res) => {
  try {
    const request = await Request.findById(req.params.id)
      .populate('userId', 'name email address city state')
      .populate('allocatedTo', 'name department phone')
      .populate('statusUpdates.updatedBy', 'name');

    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }

    res.json(request);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching request', error: error.message });
  }
});

// Get all raised requests for admin's department
router.get('/admin/raised', adminAuthMiddleware, async (req, res) => {
  try {
    const requests = await Request.find({
      department: req.department,
      status: { $in: ['raised', 'in-progress', 'clarification-needed'] },
    })
      .populate('userId', 'name email address city state phone')
      .populate('allocatedTo', 'name')
      .sort({ createdAt: -1 });

    res.json(requests);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching raised requests', error: error.message });
  }
});

// Get all requests for admin (all departments can view if allocated)
router.get('/admin/assigned', adminAuthMiddleware, async (req, res) => {
  try {
    const requests = await Request.find({ allocatedTo: req.adminId })
      .populate('userId', 'name email address city state phone')
      .sort({ createdAt: -1 });

    res.json(requests);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching assigned requests', error: error.message });
  }
});

// Allocate request to admin
router.put('/:id/allocate', adminAuthMiddleware, async (req, res) => {
  try {
    const { allocatedToAdminId } = req.body;

    const request = await Request.findById(req.params.id);
    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }

    if (request.department !== req.department) {
      return res.status(403).json({ message: 'Can only allocate requests in your department' });
    }

    request.allocatedTo = allocatedToAdminId;
    request.status = 'in-progress';
    request.statusUpdates.push({
      status: 'in-progress',
      message: 'Request allocated to admin',
      updatedBy: req.adminId,
    });

    await request.save();
    await request.populate('allocatedTo', 'name');

    res.json({ message: 'Request allocated successfully', request });
  } catch (error) {
    res.status(500).json({ message: 'Error allocating request', error: error.message });
  }
});

// Update request status
router.put('/:id/status', adminAuthMiddleware, async (req, res) => {
  try {
    const { status, message, clarificationMessage } = req.body;

    // Validate status
    const validStatuses = ['raised', 'in-progress', 'completed', 'closed', 'clarification-needed'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status. Must be one of: ' + validStatuses.join(', ') });
    }

    const request = await Request.findById(req.params.id);
    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }

    // Check if admin is allowed to update (must be from same department or allocated admin)
    if (request.department !== req.department && request.allocatedTo?.toString() !== req.adminId) {
      return res.status(403).json({ message: 'Not authorized to update this request' });
    }

    const oldStatus = request.status;
    request.status = status;
    if (clarificationMessage) {
      request.clarificationNeeded = clarificationMessage;
    }

    request.statusUpdates.push({
      status,
      message: message || `Status updated from ${oldStatus} to ${status}`,
      updatedBy: req.adminId,
    });

    request.updatedAt = Date.now();
    await request.save();
    await request.populate('allocatedTo', 'name');

    res.json({ 
      message: 'Request status updated successfully', 
      request,
      oldStatus,
      newStatus: status,
    });
  } catch (error) {
    res.status(500).json({ message: 'Error updating request status', error: error.message });
  }
});

// Send alarm to admin
router.post('/:id/alarm', authMiddleware, async (req, res) => {
  try {
    const { message } = req.body;

    const request = await Request.findById(req.params.id);
    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }

    request.alarms.push({
      message: message || 'User sent urgent alarm',
      sentAt: Date.now(),
    });

    await request.save();

    res.json({ message: 'Alarm sent to admin successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error sending alarm', error: error.message });
  }
});

// Close request
router.put('/:id/close', authMiddleware, async (req, res) => {
  try {
    const request = await Request.findById(req.params.id);
    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }

    if (request.userId.toString() !== req.userId) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    request.status = 'closed';
    request.updatedAt = Date.now();
    await request.save();

    res.json({ message: 'Request closed successfully', request });
  } catch (error) {
    res.status(500).json({ message: 'Error closing request', error: error.message });
  }
});

// Get recent requests and updates for help section
router.get('/help/recent', authMiddleware, async (req, res) => {
  try {
    const requests = await Request.find({ userId: req.userId })
      .populate('allocatedTo', 'name phone department')
      .sort({ updatedAt: -1 })
      .limit(10);

    res.json(requests);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching recent requests', error: error.message });
  }
});

// Rate completed work (User)
router.put('/:id/rate', authMiddleware, async (req, res) => {
  try {
    const { score, feedback } = req.body;

    // Validate score
    const validScores = ['excellent', 'good', 'poor'];
    if (!validScores.includes(score)) {
      return res.status(400).json({ message: 'Invalid rating. Must be: excellent, good, or poor' });
    }

    const request = await Request.findById(req.params.id);
    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }

    // Check if user owns the request
    if (request.userId.toString() !== req.userId) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    // Only allow rating completed or closed requests
    if (!['completed', 'closed'].includes(request.status)) {
      return res.status(400).json({ message: 'Can only rate completed or closed requests' });
    }

    request.rating = {
      score,
      feedback: feedback || '',
      ratedAt: Date.now(),
      ratedBy: req.userId,
    };

    await request.save();
    await request.populate('allocatedTo', 'name');

    res.json({ 
      message: 'Request rated successfully', 
      request,
    });
  } catch (error) {
    res.status(500).json({ message: 'Error rating request', error: error.message });
  }
});

// Reopen request due to unsatisfactory work (User)
router.put('/:id/reopen', authMiddleware, async (req, res) => {
  try {
    const { reopenReason } = req.body;

    if (!reopenReason) {
      return res.status(400).json({ message: 'Please provide reason for reopening' });
    }

    const request = await Request.findById(req.params.id);
    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }

    // Check if user owns the request
    if (request.userId.toString() !== req.userId) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    // Only allow reopening completed or closed requests
    if (!['completed', 'closed'].includes(request.status)) {
      return res.status(400).json({ message: 'Can only reopen completed or closed requests' });
    }

    request.status = 'in-progress';
    request.reopenReason = reopenReason;
    request.reopenedAt = Date.now();
    request.rating = {
      score: null,
      feedback: '',
      ratedAt: null,
      ratedBy: null,
    };

    request.statusUpdates.push({
      status: 'in-progress',
      message: `Request reopened by user. Reason: ${reopenReason}`,
      updatedBy: req.userId,
    });

    await request.save();
    await request.populate('allocatedTo', 'name');

    res.json({ 
      message: 'Request reopened successfully', 
      request,
    });
  } catch (error) {
    res.status(500).json({ message: 'Error reopening request', error: error.message });
  }
});

module.exports = router;
