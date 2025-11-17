'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const COMPLETED_REQUESTS = [
  { id: 1, title: 'Street Light Repair', status: 'completed', date: '2024-11-10', description: 'Street light on 5th Avenue not working. Fixed by electrical team.' },
  { id: 2, title: 'Road Cleaning', status: 'closed', date: '2024-11-05', description: 'Road littered with construction debris. Cleaned successfully.' },
];

export default function CloseRequestPage() {
  const [requests, setRequests] = useState(COMPLETED_REQUESTS);
  const [selectedRequest, setSelectedRequest] = useState<typeof COMPLETED_REQUESTS[0] | null>(COMPLETED_REQUESTS[0]);

  const closeRequest = (id: number) => {
    setRequests(requests.map(r => r.id === id ? {...r, status: 'closed'} : r));
    setSelectedRequest(null);
  };

  const reopenRequest = (id: number) => {
    setRequests(requests.map(r => r.id === id ? {...r, status: 'raised'} : r));
    setSelectedRequest(null);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Completed Requests</h1>
        <p className="text-gray-600 mt-2">Review and close your completed service requests.</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Request List */}
        <div className="lg:col-span-1">
          <Card className="border-gray-200">
            <CardHeader>
              <CardTitle className="text-lg text-gray-900">Completed Requests</CardTitle>
            </CardHeader>
            <CardContent>
              {requests.length === 0 ? (
                <p className="text-gray-600 text-center py-8">No completed requests</p>
              ) : (
                <div className="space-y-2">
                  {requests.map((req) => (
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
                      <span className={`inline-block text-xs mt-1 px-2 py-1 rounded-full font-semibold ${req.status === 'closed' ? 'bg-gray-100 text-gray-800' : 'bg-green-100 text-green-800'}`}>
                        {req.status}
                      </span>
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
                <CardDescription>Completed on {selectedRequest.date}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Description</h3>
                  <p className="text-gray-600">{selectedRequest.description}</p>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Status</h3>
                  <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${selectedRequest.status === 'closed' ? 'bg-gray-100 text-gray-800' : 'bg-green-100 text-green-800'}`}>
                    {selectedRequest.status}
                  </span>
                </div>

                <div className="flex gap-2">
                  {selectedRequest.status === 'completed' && (
                    <>
                      <Button
                        onClick={() => closeRequest(selectedRequest.id)}
                        className="flex-1 bg-blue-600 hover:bg-blue-700"
                      >
                        Close Request
                      </Button>
                      <Button
                        onClick={() => reopenRequest(selectedRequest.id)}
                        variant="outline"
                        className="flex-1 border-gray-200"
                      >
                        Reopen Request
                      </Button>
                    </>
                  )}
                  {selectedRequest.status === 'closed' && (
                    <Button
                      onClick={() => reopenRequest(selectedRequest.id)}
                      variant="outline"
                      className="w-full border-gray-200"
                    >
                      Reopen Request
                    </Button>
                  )}
                </div>
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
