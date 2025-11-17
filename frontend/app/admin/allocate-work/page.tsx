'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { AlertCircle, CheckCircle2 } from 'lucide-react';

interface ServiceRequest {
  id: string;
  title: string;
  description: string;
  status: string;
  created_at: string;
}

interface AdminUser {
  id: string;
  full_name: string;
  email: string;
}

export default function AllocateWorkPage() {
  const [requests, setRequests] = useState<ServiceRequest[]>([]);
  const [admins, setAdmins] = useState<AdminUser[]>([]);
  const [selectedRequestId, setSelectedRequestId] = useState('');
  const [selectedMemberId, setSelectedMemberId] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(true);
  const [allocating, setAllocating] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('authToken');

      // Fetch requests
      const requestsResponse = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/requests`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (requestsResponse.ok) {
        const data = await requestsResponse.json();
        // Filter for unassigned or in_progress requests
        setRequests(data.data.filter((r: ServiceRequest) => 
          r.status === 'raised' || r.status === 'in_progress'
        ));
      }

      // Fetch other admins (in a real app, you'd have an endpoint for this)
      // For now, we'll use a placeholder
      setAdmins([
        { id: '1', full_name: 'John Doe', email: 'john@example.com' },
        { id: '2', full_name: 'Jane Smith', email: 'jane@example.com' },
      ]);
    } catch (err) {
      setError('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleAllocateWork = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedRequestId || !selectedMemberId) {
      setError('Please select both a request and an admin');
      return;
    }

    setAllocating(true);
    setError('');

    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/requests/${selectedRequestId}/allocate`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            teamMemberId: selectedMemberId,
            notes: notes.trim() || null,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Failed to allocate work');
        return;
      }

      setSuccess('Work allocated successfully!');
      setSelectedRequestId('');
      setSelectedMemberId('');
      setNotes('');

      setTimeout(() => {
        setSuccess('');
        fetchData();
      }, 2000);
    } catch (err) {
      setError('Failed to allocate work. Please try again.');
    } finally {
      setAllocating(false);
    }
  };

  const filteredRequests = requests.filter(
    (r) =>
      r.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selectedRequest = requests.find(r => r.id === selectedRequestId);
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
        <h1 className="text-3xl font-bold text-gray-900">Allocate Work</h1>
        <p className="text-gray-600 mt-2">Assign service requests to team members</p>
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
        {/* Allocation Form */}
        <Card>
          <CardHeader>
            <CardTitle>Allocate Work</CardTitle>
            <CardDescription>Assign work to a team member</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAllocateWork} className="space-y-4">
              <div>
                <Label htmlFor="request">Select Request</Label>
                <Select 
                  value={selectedRequestId} 
                  onValueChange={setSelectedRequestId}
                  disabled={allocating}
                >
                  <SelectTrigger id="request">
                    <SelectValue placeholder="Choose a request" />
                  </SelectTrigger>
                  <SelectContent>
                    {filteredRequests.map((req) => (
                      <SelectItem key={req.id} value={req.id}>
                        {req.title.substring(0, 40)}...
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="admin">Assign to Admin</Label>
                <Select 
                  value={selectedMemberId} 
                  onValueChange={setSelectedMemberId}
                  disabled={allocating}
                >
                  <SelectTrigger id="admin">
                    <SelectValue placeholder="Choose an admin" />
                  </SelectTrigger>
                  <SelectContent>
                    {admins.map((admin) => (
                      <SelectItem key={admin.id} value={admin.id}>
                        {admin.full_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="notes">Notes (Optional)</Label>
                <Textarea
                  id="notes"
                  placeholder="Add any special instructions..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  disabled={allocating}
                  rows={3}
                />
              </div>

              <Button type="submit" className="w-full" disabled={allocating}>
                {allocating ? 'Allocating...' : 'Allocate Work'}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Requests List */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Available Requests</CardTitle>
            <CardDescription>Search and select a request to allocate</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              placeholder="Search requests..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />

            <div className="space-y-2 max-h-96 overflow-y-auto">
              {filteredRequests.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No requests available</p>
              ) : (
                filteredRequests.map((req) => (
                  <div
                    key={req.id}
                    onClick={() => setSelectedRequestId(req.id)}
                    className={`p-3 border-2 rounded-lg cursor-pointer transition-all ${
                      selectedRequestId === req.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-medium">{req.title}</h4>
                        <p className="text-sm text-gray-600 mt-1">{req.description.substring(0, 100)}...</p>
                        <div className="mt-2 flex gap-2">
                          <Badge variant="outline">{req.status.replace('_', ' ')}</Badge>
                          <span className="text-xs text-gray-500">
                            {new Date(req.created_at).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
