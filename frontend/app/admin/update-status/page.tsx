'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { AlertCircle, CheckCircle2 } from 'lucide-react';

interface ServiceRequest {
  id: string;
  title: string;
  description: string;
  status: string;
  priority: string;
  created_at: string;
}

export default function UpdateStatusPage() {
  const [requests, setRequests] = useState<ServiceRequest[]>([]);
  const [selectedRequestId, setSelectedRequestId] = useState('');
  const [newStatus, setNewStatus] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/requests`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.ok) {
        const data = await response.json();
        // Filter for non-completed requests
        setRequests(data.data.filter((r: ServiceRequest) => r.status !== 'completed'));
      }
    } catch (err) {
      setError('Failed to load requests');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedRequestId || !newStatus) {
      setError('Please select both a request and a new status');
      return;
    }

    setUpdating(true);
    setError('');

    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/requests/${selectedRequestId}/status`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            status: newStatus,
            message: message.trim() || null,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Failed to update status');
        return;
      }

      setSuccess('Status updated successfully!');
      setNewStatus('');
      setMessage('');
      
      setTimeout(() => {
        setSuccess('');
        fetchRequests();
      }, 2000);
    } catch (err) {
      setError('Failed to update status. Please try again.');
    } finally {
      setUpdating(false);
    }
  };

  const selectedRequest = requests.find(r => r.id === selectedRequestId);

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'in_progress': return 'bg-orange-100 text-orange-800';
      case 'raised': return 'bg-blue-100 text-blue-800';
      case 'needs_clarification': return 'bg-yellow-100 text-yellow-800';
      case 'closed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredRequests = requests.filter(
    (r) =>
      r.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/2"></div>
          <div className="h-96 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Update Request Status</h1>
        <p className="text-gray-600 mt-2">Update the status of service requests and provide feedback to citizens.</p>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert className="bg-green-50 border-green-200">
          <CheckCircle2 className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">{success}</AlertDescription>
        </Alert>
      )}

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Request List */}
        <div className="lg:col-span-1">
        <Card className="border-gray-200">
            <CardHeader>
              <CardTitle className="text-lg text-gray-900">Pending Requests</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input
                placeholder="Search requests..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              {filteredRequests.length === 0 ? (
                <p className="text-gray-600 text-center py-8">No pending requests</p>
              ) : (
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {filteredRequests.map((req) => (
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
                    <Select value={newStatus} onValueChange={setNewStatus} disabled={updating}>
                      <SelectTrigger className="border-gray-200 bg-white">
                        <SelectValue placeholder="Select new status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="raised">Raised</SelectItem>
                        <SelectItem value="in_progress">In Progress</SelectItem>
                        <SelectItem value="needs_clarification">Needs Clarification</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                        <SelectItem value="closed">Closed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="message" className="text-gray-700 font-semibold">Message for Citizen</Label>
                    <Textarea
                      id="message"
                      placeholder="Provide updates or ask for clarification..."
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      disabled={updating}
                      rows={4}
                    />
                  </div>

                  <Button type="submit" disabled={!newStatus || updating} className="w-full bg-blue-600 hover:bg-blue-700">
                    {updating ? 'Updating...' : 'Update Status'}
                  </Button>
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
