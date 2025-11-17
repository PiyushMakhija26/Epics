'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

interface Request {
  id: string;
  title: string;
  description: string;
  status: string;
  date: string;
  rating?: 'excellent' | 'good' | 'open_again';
  comments?: string;
}

const COMPLETED_REQUESTS: Request[] = [
  { 
    id: '1',
    title: 'Street Light Repair', 
    status: 'completed', 
    date: '2024-11-10', 
    description: 'Street light on 5th Avenue not working. Fixed by electrical team.' 
  },
  { 
    id: '2',
    title: 'Road Cleaning', 
    status: 'completed', 
    date: '2024-11-05', 
    description: 'Road littered with construction debris. Cleaned successfully.' 
  },
];

export default function ReviewRequestPage() {
  const [requests, setRequests] = useState<Request[]>(COMPLETED_REQUESTS);
  const [selectedRequest, setSelectedRequest] = useState<Request | null>(COMPLETED_REQUESTS[0] || null);
  const [rating, setRating] = useState<'excellent' | 'good' | 'open_again' | ''>('');
  const [comments, setComments] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleRateWork = async () => {
    if (!selectedRequest || !rating) {
      setError('Please select a rating');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`http://localhost:3001/api/auth/ratings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          request_id: selectedRequest.id,
          rating,
          comments,
        }),
      });

      if (!response.ok) throw new Error('Failed to submit rating');

      setSubmitted(true);
      setRequests(requests.map(r => 
        r.id === selectedRequest.id 
          ? { ...r, rating: rating as 'excellent' | 'good' | 'open_again', comments }
          : r
      ));
      setRating('');
      setComments('');
      
      setTimeout(() => {
        setSubmitted(false);
        setSelectedRequest(null);
      }, 2000);
    } catch (err) {
      setError('Failed to submit rating. Please try again.');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const getRatingBadgeColor = (rating: string | undefined) => {
    switch(rating) {
      case 'excellent': return 'bg-green-100 text-green-800';
      case 'good': return 'bg-blue-100 text-blue-800';
      case 'open_again': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Review Completed Requests</h1>
        <p className="text-gray-600 mt-2">Rate the quality of work and provide feedback on completed service requests.</p>
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
                      onClick={() => {
                        setSelectedRequest(req);
                        setRating((req.rating as any) || '');
                        setComments(req.comments || '');
                      }}
                      className={`w-full text-left p-3 rounded-lg border-2 transition ${
                        selectedRequest?.id === req.id
                          ? 'border-blue-600 bg-blue-50'
                          : 'border-gray-200 hover:bg-gray-50'
                      }`}
                    >
                      <p className="font-semibold text-sm text-gray-900 truncate">{req.title}</p>
                      <p className="text-xs text-gray-600 mt-1">{req.date}</p>
                      {req.rating && (
                        <span className={`inline-block text-xs mt-2 px-2 py-1 rounded-full font-semibold ${getRatingBadgeColor(req.rating)}`}>
                          {req.rating === 'open_again' ? 'Open Again' : req.rating.charAt(0).toUpperCase() + req.rating.slice(1)}
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Rating Form */}
        <div className="lg:col-span-2">
          {selectedRequest ? (
            <Card className="border-gray-200">
              <CardHeader>
                <CardTitle className="text-gray-900">{selectedRequest.title}</CardTitle>
                <CardDescription>{selectedRequest.date}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Description</h3>
                  <p className="text-gray-600 text-sm">{selectedRequest.description}</p>
                </div>

                <div className="space-y-4">
                  <div>
                    <Label className="text-gray-700 font-semibold mb-3 block">Rate the Quality of Work</Label>
                    <div className="space-y-2">
                      <button
                        onClick={() => setRating('excellent')}
                        className={`w-full p-4 border-2 rounded-lg text-left transition ${
                          rating === 'excellent'
                            ? 'border-green-500 bg-green-50'
                            : 'border-gray-200 hover:border-green-300'
                        }`}
                      >
                        <div className="font-semibold text-gray-900">⭐ Excellent</div>
                        <div className="text-sm text-gray-600">Work was completed perfectly and meets all expectations</div>
                      </button>

                      <button
                        onClick={() => setRating('good')}
                        className={`w-full p-4 border-2 rounded-lg text-left transition ${
                          rating === 'good'
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-blue-300'
                        }`}
                      >
                        <div className="font-semibold text-gray-900">👍 Good</div>
                        <div className="text-sm text-gray-600">Work was completed satisfactorily with minor issues</div>
                      </button>

                      <button
                        onClick={() => setRating('open_again')}
                        className={`w-full p-4 border-2 rounded-lg text-left transition ${
                          rating === 'open_again'
                            ? 'border-orange-500 bg-orange-50'
                            : 'border-gray-200 hover:border-orange-300'
                        }`}
                      >
                        <div className="font-semibold text-gray-900">⚠️ Reopen Request</div>
                        <div className="text-sm text-gray-600">Work is not satisfactory and needs to be redone</div>
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="comments" className="text-gray-700 font-semibold">Additional Comments (Optional)</Label>
                    <Textarea
                      id="comments"
                      placeholder="Share your feedback or concerns..."
                      value={comments}
                      onChange={(e) => setComments(e.target.value)}
                      className="border-gray-200 resize-none"
                      rows={4}
                    />
                  </div>

                  {error && (
                    <div className="bg-red-50 border border-red-200 rounded-md p-3 text-sm text-red-700">
                      {error}
                    </div>
                  )}

                  <div className="flex gap-2 pt-4">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setSelectedRequest(null);
                        setRating('');
                        setComments('');
                      }}
                      className="flex-1 border-gray-200"
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleRateWork}
                      disabled={!rating || loading}
                      className="flex-1 bg-blue-600 hover:bg-blue-700"
                    >
                      {loading ? 'Submitting...' : 'Submit Rating'}
                    </Button>
                  </div>

                  {submitted && (
                    <div className="bg-green-50 border border-green-200 rounded-md p-3 text-sm text-green-700">
                      ✓ Thank you! Your rating has been recorded.
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="flex items-center justify-center min-h-96 border-gray-200">
              <p className="text-gray-600">Select a completed request to rate</p>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
