import { Router, Response, Request } from 'express';
import { AuthRequest, authMiddleware, adminOnly } from '../middleware/auth';
import { adminWorkAssignmentService } from '../services/adminWorkAssignment';

const router = Router();

// Assign work to another admin
router.post('/assign-work', authMiddleware, adminOnly, async (req: any, res: Response): Promise<void> => {
  try {
    const { requestId, assignedToId, notes } = req.body;
    const adminId = req.user?.sub;

    if (!requestId || !assignedToId) {
      res.status(400).json({ error: 'Request ID and assigned admin ID are required' });
      return;
    }

    const assignment = await adminWorkAssignmentService.assignWork(
      requestId,
      adminId!,
      assignedToId,
      notes
    );

    res.status(201).json({ message: 'Work assigned successfully', data: assignment });
  } catch (error) {
    console.error('Work assignment error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get admin's work assignments
router.get('/assignments', authMiddleware, adminOnly, async (req: any, res: Response): Promise<void> => {
  try {
    const adminId = req.user?.sub;
    const { status } = req.query;

    const assignments = await adminWorkAssignmentService.getAdminAssignments(
      adminId!,
      status as string
    );

    res.json({ data: assignments });
  } catch (error) {
    console.error('Error fetching assignments:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update assignment status
router.put('/assignments/:assignmentId/status', authMiddleware, adminOnly, async (req: any, res: Response): Promise<void> => {
  try {
    const { assignmentId } = req.params;
    const { status } = req.body;
    const adminId = req.user?.sub;

    if (!['pending', 'accepted', 'completed', 'rejected'].includes(status)) {
      res.status(400).json({ error: 'Invalid status' });
      return;
    }

    const updated = await adminWorkAssignmentService.updateAssignmentStatus(
      assignmentId,
      status,
      adminId!
    );

    res.json({ message: 'Assignment status updated', data: updated });
  } catch (error) {
    console.error('Error updating assignment:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;

