'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const RAISED_REQUESTS = [
  { 
    id: 1, 
    title: 'Pothole on Main Street', 
    description: 'Large pothole on Main Street near the library. Needs urgent repair to prevent accidents.',
    date: '2024-11-15',
    citizen: { name: 'John Doe', address: '123 Main St', city: 'San Francisco', state: 'California' }
  },
  { 
    id: 2, 
    title: 'Road Cleaning', 
    description: 'Road littered with construction debris. Needs immediate cleaning.',
    date: '2024-11-12',
    citizen: { name: 'Jane Smith', address: '456 Oak Ave', city: 'San Francisco', state: 'California' }
  },
];

export default function RaisedRequestsPage() {
  const [selectedRequest, setSelectedRequest] = useState<typeof RAISED_REQUESTS[0] | null>(RAISED_REQUESTS[0]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Raised Requests</h1>
        <p className="text-gray-600 mt-2">View and manage new requests from citizens.</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Request List */}
        <div className="lg:col-span-1">
          <Card className="border-gray-200">
            <CardHeader>
              <CardTitle className="text-lg text-gray-900">New Requests ({RAISED_REQUESTS.length})</CardTitle>
            </CardHeader>
            <CardContent>
              {RAISED_REQUESTS.length === 0 ? (
                <p className="text-gray-600 text-center py-8">No raised requests</p>
              ) : (
                <div className="space-y-2">
                  {RAISED_REQUESTS.map((req) => (
                    <button
                      key={req.id}
                      onClick={() => setSelectedRequest(req)}
                      className={`w-full text-left p-3 rounded-lg border-2 transition ${
                        selectedRequest?.id === req.id
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

        {/* Request Details */}
        <div className="lg:col-span-2">
          {selectedRequest ? (
            <Card className="border-gray-200">
              <CardHeader>
                <CardTitle className="text-gray-900">{selectedRequest.title}</CardTitle>
                <CardDescription>Raised on {selectedRequest.date}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Description</h3>
                  <p className="text-gray-600">{selectedRequest.description}</p>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">Citizen Information</h3>
                  <div className="space-y-2 text-sm text-gray-700">
                    <p><span className="font-semibold">Name:</span> {selectedRequest.citizen.name}</p>
                    <p><span className="font-semibold">Address:</span> {selectedRequest.citizen.address}</p>
                    <p><span className="font-semibold">City:</span> {selectedRequest.citizen.city}</p>
                    <p><span className="font-semibold">State:</span> {selectedRequest.citizen.state}</p>
                  </div>
                </div>

                <Link href={`/admin/update-status?requestId=${selectedRequest.id}`}>
                  <Button className="w-full bg-blue-600 hover:bg-blue-700">
                    Start Processing
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            <Card className="flex items-center justify-center min-h-96 border-gray-200">
              <p className="text-gray-600">Select a request to view details</p>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
