import { WorkAssignment, ServiceRequest } from '../db/models';
import { v4 as uuidv4 } from 'uuid';

export const adminWorkAssignmentService = {
  // Assign work to another admin
  async assignWork(requestId: string, assignedById: string, assignedToId: string, notes?: string) {
    const assignment = await WorkAssignment.create({
      id: uuidv4(),
      request_id: requestId,
      assigned_by: assignedById,
      assigned_to: assignedToId,
      status: 'pending',
    });

    // Update service request
    await ServiceRequest.updateOne(
      { id: requestId },
      {
        assigned_to: assignedToId,
      }
    );

    return assignment;
  },

  // Get work assignments for an admin
  async getAdminAssignments(adminId: string, status?: string) {
    let query = WorkAssignment.find({ assigned_to: adminId });

    if (status) {
      query = query.where('status').equals(status);
    }

    const data = await query.sort({ created_at: -1 });
    return data;
  },

  // Update assignment status
  async updateAssignmentStatus(assignmentId: string, newStatus: string, adminId: string) {
    const data = await WorkAssignment.findOneAndUpdate(
      { id: assignmentId, assigned_to: adminId },
      { status: newStatus },
      { new: true }
    );

    if (!data) {
      throw new Error('Assignment not found or unauthorized');
    }

    return data;
  },

  // Get all assignments for a request
  async getRequestAssignments(requestId: string) {
    const data = await WorkAssignment.find({ request_id: requestId }).sort({ created_at: -1 });
    return data;
  },
};
