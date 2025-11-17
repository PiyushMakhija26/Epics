import { Router, Response } from 'express';
import { AuthRequest, authMiddleware, adminOnly } from '../middleware/auth';
import { sendStatusUpdateEmail } from '../utils/email';
import { adminWorkAssignmentService } from '../services/adminWorkAssignment';
import { ServiceRequest, StatusHistory, RequestRating, Profile } from '../db/models';
import { v4 as uuidv4 } from 'uuid';

const router = Router();

// Create a new service request
router.post('/', authMiddleware, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { title, description, category, department, priority } = req.body;
    const userId = req.user?.sub;

    if (!title || !description) {
      res.status(400).json({ error: 'Title and description are required' });
      return;
    }

    const newRequest = await ServiceRequest.create({
      id: uuidv4(),
      user_id: userId,
      title,
      description,
      category,
      location: department,
      priority: priority || 'medium',
      status: 'raised',
    });

    res.status(201).json(newRequest);
  } catch (error) {
    console.error('Request creation error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get all service requests (user's own or admin can see all)
router.get('/', authMiddleware, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.sub;
    const isAdmin = req.user?.user_type === 'admin';

    let query = ServiceRequest.find({});

    if (!isAdmin) {
      query = query.where('user_id').equals(userId);
    }

    const data = await query.sort({ created_at: -1 });

    res.json({ data });
  } catch (error) {
    console.error('Error fetching requests:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get a single request
router.get('/:requestId', authMiddleware, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { requestId } = req.params;
    const userId = req.user?.sub;
    const isAdmin = req.user?.user_type === 'admin';

    const data = await ServiceRequest.findOne({ id: requestId });

    if (!data || (!isAdmin && data.user_id !== userId)) {
      res.status(403).json({ error: 'Unauthorized' });
      return;
    }

    res.json(data);
  } catch (error) {
    console.error('Error fetching request:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update request status (admin only)
router.put('/:requestId/status', authMiddleware, adminOnly, async (req: any, res: Response): Promise<void> => {
  try {
    const { requestId } = req.params;
    const { status, message, requiresUserFeedback } = req.body;
    const adminId = req.user?.sub;

    const validStatuses = ['raised', 'assigned', 'in_progress', 'completed', 'closed'];
    if (!validStatuses.includes(status)) {
      res.status(400).json({ error: 'Invalid status' });
      return;
    }

    // Get current request
    const request = await ServiceRequest.findOne({ id: requestId });
    if (!request) {
      res.status(404).json({ error: 'Request not found' });
      return;
    }

    const oldStatus = request.status;

    // Update status
    const updated = await ServiceRequest.findOneAndUpdate(
      { id: requestId },
      { status, updated_at: new Date() },
      { new: true }
    );

    // Log status history
    await StatusHistory.create({
      request_id: requestId,
      old_status: oldStatus,
      new_status: status,
      changed_by: adminId,
      reason: message,
    });

    // Send email notification
    const userProfile = await Profile.findOne({ user_id: request.user_id });
    if (userProfile?.email) {
      await sendStatusUpdateEmail(
        userProfile.email,
        request.title,
        status,
        message || `Your request status has been updated to: ${status}`
      );
    }

    res.json({ 
      data: updated,
      message: 'Status updated successfully' 
    });
  } catch (error) {
    console.error('Status update error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Rate a completed request
router.post('/:requestId/rate', authMiddleware, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { requestId } = req.params;
    const { rating, comments } = req.body;
    const userId = req.user?.sub;

    if (!requestId || !['excellent', 'good', 'open_again'].includes(rating)) {
      res.status(400).json({ error: 'Invalid rating parameters' });
      return;
    }

    // Check if user owns the request
    const request = await ServiceRequest.findOne({ id: requestId, user_id: userId });
    if (!request) {
      res.status(403).json({ error: 'Unauthorized' });
      return;
    }

    if (request.status !== 'completed') {
      res.status(400).json({ error: 'Can only rate completed requests' });
      return;
    }

    const data = await RequestRating.findOneAndUpdate(
      { request_id: requestId, user_id: userId },
      { request_id: requestId, user_id: userId, rating, comments },
      { upsert: true, new: true }
    );

    res.status(201).json({ message: 'Rating submitted successfully', data });
  } catch (error) {
    console.error('Rating error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get ratings for a request
router.get('/:requestId/ratings', authMiddleware, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { requestId } = req.params;
    const data = await RequestRating.find({ request_id: requestId });
    res.json({ data });
  } catch (error) {
    console.error('Error fetching ratings:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get request status history
router.get('/:requestId/history', authMiddleware, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { requestId } = req.params;

    // Verify access
    const request = await ServiceRequest.findOne({ id: requestId });

    if (!request || (request.user_id !== req.user?.sub && req.user?.user_type !== 'admin')) {
      res.status(403).json({ error: 'Unauthorized' });
      return;
    }

    const data = await StatusHistory.find({ request_id: requestId }).sort({ created_at: -1 });

    res.json({ data });
  } catch (error) {
    console.error('History fetch error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Allocate work to team member (admin only)
router.post('/:requestId/allocate', authMiddleware, adminOnly, async (req: any, res: Response): Promise<void> => {
  try {
    const { requestId } = req.params;
    const { teamMemberId, notes } = req.body;
    const adminId = req.user?.sub;

    const assignment = await adminWorkAssignmentService.assignWork(
      requestId,
      adminId!,
      teamMemberId,
      notes
    );

    // Update request status to in_progress
    await ServiceRequest.updateOne(
      { id: requestId },
      { status: 'assigned' }
    );

    res.status(201).json({ message: 'Work allocated successfully', data: assignment });
  } catch (error) {
    console.error('Allocation error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
