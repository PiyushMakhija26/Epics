'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface Request {
  id: number;
  title: string;
  description: string;
  date: string;
}

interface TeamMember {
  id: string;
  name: string;
}

const REQUESTS_TO_ALLOCATE: Request[] = [
  { id: 1, title: 'Pothole on Main Street', description: 'Large pothole needs repair', date: '2024-11-15' },
  { id: 2, title: 'Road Cleaning', description: 'Road littered with debris', date: '2024-11-12' },
];

const TEAM_MEMBERS: TeamMember[] = [
  { id: '1', name: 'Mike Johnson' },
  { id: '2', name: 'Sarah Williams' },
  { id: '3', name: 'David Brown' },
];

export default function AllocateWorkPage() {
  const [selectedRequestId, setSelectedRequestId] = useState<number | null>(REQUESTS_TO_ALLOCATE[0]?.id || null);
  const [selectedMemberId, setSelectedMemberId] = useState('');
  const [allocated, setAllocated] = useState(false);

  const selectedRequest = REQUESTS_TO_ALLOCATE.find(r => r.id === selectedRequestId);

  const handleAllocateWork = async () => {
    if (!selectedRequest || !selectedMemberId) return;

    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`http://localhost:3001/api/requests/${selectedRequest.id}/allocate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          teamMemberId: selectedMemberId,
        }),
      });

      if (!response.ok) throw new Error('Failed to allocate work');

      setAllocated(true);
      setTimeout(() => {
        setSelectedMemberId('');
        setAllocated(false);
      }, 2000);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Allocate Work</h1>
        <p className="text-gray-600 mt-2">Assign requests to team members in your Electricity Department.</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Request List */}
        <div className="lg:col-span-1">
          <Card className="border-gray-200">
            <CardHeader>
              <CardTitle className="text-lg text-gray-900">Requests to Allocate</CardTitle>
            </CardHeader>
            <CardContent>
              {REQUESTS_TO_ALLOCATE.length === 0 ? (
                <p className="text-gray-600 text-center py-8">No requests to allocate</p>
              ) : (
                <div className="space-y-2">
                  {REQUESTS_TO_ALLOCATE.map((req) => (
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
                      <p className="text-xs text-gray-600 mt-1">{req.date}</p>
                    </button>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Allocation Form */}
        <div className="lg:col-span-2">
          {selectedRequest ? (
            <Card className="border-gray-200">
              <CardHeader>
                <CardTitle className="text-gray-900">{selectedRequest.title}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Description</h3>
                  <p className="text-gray-600 text-sm">{selectedRequest.description}</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="team-member" className="text-gray-700 font-semibold">Assign to Team Member</Label>
                  {TEAM_MEMBERS.length === 0 ? (
                    <p className="text-gray-600 text-sm py-4">No team members available</p>
                  ) : (
                    <Select value={selectedMemberId} onValueChange={setSelectedMemberId}>
                      <SelectTrigger className="border-gray-200 bg-white">
                        <SelectValue placeholder="Select a team member" />
                      </SelectTrigger>
                      <SelectContent>
                        {TEAM_MEMBERS.map((member) => (
                          <SelectItem key={member.id} value={member.id}>{member.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setSelectedRequestId(null)}
                    className="flex-1 border-gray-200"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleAllocateWork}
                    disabled={!selectedMemberId}
                    className="flex-1 bg-blue-600 hover:bg-blue-700"
                  >
                    {allocated ? 'Work Allocated!' : 'Allocate Work'}
                  </Button>
                </div>

                {allocated && (
                  <div className="bg-green-50 border border-green-200 rounded-md p-3 text-sm text-green-700">
                    ✓ Work allocated successfully to {TEAM_MEMBERS.find(m => m.id === selectedMemberId)?.name}.
                  </div>
                )}
              </CardContent>
            </Card>
          ) : (
            <Card className="flex items-center justify-center min-h-96 border-gray-200">
              <p className="text-gray-600">Select a request to allocate</p>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
