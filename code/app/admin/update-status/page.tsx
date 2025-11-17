'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';

interface Request {
  id: number;
  title: string;
  status: string;
  description: string;
}

const PENDING_REQUESTS: Request[] = [
  { id: 1, title: 'Water Supply Issue', status: 'raised', description: 'Low water pressure in residential area.' },
  { id: 2, title: 'Street Light Repair', status: 'in_progress', description: 'Street light on 5th Avenue not working.' },
];

export default function UpdateStatusPage() {
  const [selectedRequestId, setSelectedRequestId] = useState<number | null>(PENDING_REQUESTS[0]?.id || null);
  const [newStatus, setNewStatus] = useState('');
  const [message, setMessage] = useState('');
  const [requiresClarification, setRequiresClarification] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const selectedRequest = PENDING_REQUESTS.find(r => r.id === selectedRequestId);

  const handleUpdateStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newStatus || !selectedRequest) return;

    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`http://localhost:3001/api/requests/${selectedRequest.id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          status: newStatus,
          message,
          requiresUserFeedback: requiresClarification,
        }),
      });

      if (!response.ok) throw new Error('Failed to update status');

      setSubmitted(true);
      setNewStatus('');
      setMessage('');
      setRequiresClarification(false);

      setTimeout(() => {
        setSubmitted(false);
      }, 2000);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'in_progress': return 'bg-orange-100 text-orange-800';
      case 'raised': return 'bg-blue-100 text-blue-800';
      case 'needs_clarification': return 'bg-purple-100 text-purple-800';
      case 'closed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Update Request Status</h1>
        <p className="text-gray-600 mt-2">Update the status of service requests and provide feedback to citizens.</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Request List */}
        <div className="lg:col-span-1">
          <Card className="border-gray-200">
            <CardHeader>
              <CardTitle className="text-lg text-gray-900">Pending Requests</CardTitle>
            </CardHeader>
            <CardContent>
              {PENDING_REQUESTS.length === 0 ? (
                <p className="text-gray-600 text-center py-8">No pending requests</p>
              ) : (
                <div className="space-y-2">
                  {PENDING_REQUESTS.map((req) => (
                    <button
                      key={req.id}
                      onClick={() => setSelectedRequestId(req.id)}
                      className={`w-full text-left p-3 rounded-lg border-2 transition ${
                        selectedRequestId === req.id
                          ? 'border-blue-600 bg-blue-50'
                          : 'border-gray-200 hover:bg-gray-50'
                      }`}
                    >
                      <p className="font-semibold text-sm text-gray-900 truncate">{req.title}</p>
                      <span className={`inline-block text-xs mt-1 px-2 py-1 rounded-full font-semibold ${getStatusColor(req.status)}`}>
                        {req.status.replace('_', ' ')}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Update Form */}
        <div className="lg:col-span-2">
          {selectedRequest ? (
            <Card className="border-gray-200">
              <CardHeader>
                <CardTitle className="text-gray-900">{selectedRequest.title}</CardTitle>
                <CardDescription>Current status: {selectedRequest.status.replace('_', ' ')}</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleUpdateStatus} className="space-y-6">
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Description</h3>
                    <p className="text-gray-600 text-sm">{selectedRequest.description}</p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="status" className="text-gray-700 font-semibold">Update Status</Label>
                    <Select value={newStatus} onValueChange={setNewStatus}>
                      <SelectTrigger className="border-gray-200 bg-white">
                        <SelectValue placeholder="Select new status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="raised">Raised (New Request)</SelectItem>
                        <SelectItem value="in_progress">In Progress</SelectItem>
                        <SelectItem value="needs_clarification">Needs Clarification from Requester</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                        <SelectItem value="closed">Closed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="message" className="text-gray-700 font-semibold">Status Update Message</Label>
                    <Textarea
                      id="message"
                      placeholder="Provide details about this status update..."
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      className="border-gray-200 resize-none"
                      rows={4}
                    />
                    <p className="text-xs text-gray-500">This message will be sent to the requester via email</p>
                  </div>

                  {newStatus === 'needs_clarification' && (
                    <div className="bg-purple-50 border border-purple-200 rounded-md p-4">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={requiresClarification}
                          onChange={(e) => setRequiresClarification(e.target.checked)}
                          className="rounded border-gray-300"
                        />
                        <span className="text-sm font-semibold text-gray-900">
                          Require user response before proceeding
                        </span>
                      </label>
                    </div>
                  )}

                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setSelectedRequestId(null);
                        setNewStatus('');
                        setMessage('');
                      }}
                      className="flex-1 border-gray-200"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      disabled={!newStatus}
                      className="flex-1 bg-blue-600 hover:bg-blue-700"
                    >
                      Update Status
                    </Button>
                  </div>

                  {submitted && (
                    <div className="bg-green-50 border border-green-200 rounded-md p-3 text-sm text-green-700">
                      ✓ Status updated successfully. Notification sent to requester.
                    </div>
                  )}
                </form>
              </CardContent>
            </Card>
          ) : (
            <Card className="flex items-center justify-center min-h-96 border-gray-200">
              <p className="text-gray-600">Select a request to update</p>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
