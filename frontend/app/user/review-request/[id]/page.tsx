'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { AlertCircle } from 'lucide-react';
import { RateRequest } from '@/components/rate-request';

interface ServiceRequest {
  id: string;
  title: string;
  description: string;
  status: string;
  priority: string;
  category: string;
  department: string;
  created_at: string;
  updated_at: string;
}

interface StatusHistory {
  id: string;
  old_status: string;
  new_status: string;
  reason: string;
  created_at: string;
}

export default function ReviewRequestPage() {
  const params = useParams();
  const router = useRouter();
  const requestId = params.id as string;

  const [request, setRequest] = useState<ServiceRequest | null>(null);
  const [history, setHistory] = useState<StatusHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showRating, setShowRating] = useState(false);

  useEffect(() => {
    fetchRequest();
  }, []);

  const fetchRequest = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/requests/${requestId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (!response.ok) {
        setError('Failed to load request');
        return;
      }

      const data = await response.json();
      setRequest(data);

      // Fetch status history
      const historyResponse = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/requests/${requestId}/history`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (historyResponse.ok) {
        const historyData = await historyResponse.json();
        setHistory(historyData.data || []);
      }
    } catch (err) {
      setError('Failed to load request details');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'raised':
        return 'bg-blue-100 text-blue-800';
      case 'in_progress':
        return 'bg-yellow-100 text-yellow-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'clarification':
        return 'bg-orange-100 text-orange-800';
      case 'closed':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-1/2"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !request) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-4xl mx-auto">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error || 'Request not found'}</AlertDescription>
          </Alert>
          <Button onClick={() => router.back()} className="mt-4">
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">{request.title}</h1>
          <Button variant="ghost" onClick={() => router.back()}>
            ← Back
          </Button>
        </div>

        {/* Main Request Card */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-2xl">{request.title}</CardTitle>
                <CardDescription>
                  Request ID: {request.id}
                </CardDescription>
              </div>
              <div className="text-right space-y-2">
                <Badge className={getStatusColor(request.status)}>
                  {request.status.replace('_', ' ').toUpperCase()}
                </Badge>
                <Badge className={getPriorityColor(request.priority)}>
                  {request.priority.toUpperCase()}
                </Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-semibold text-sm text-gray-600">Description</h3>
              <p className="text-gray-700 mt-2">{request.description}</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="font-semibold text-sm text-gray-600">Category</h3>
                <p className="text-gray-700">{request.category || 'N/A'}</p>
              </div>
              <div>
                <h3 className="font-semibold text-sm text-gray-600">Department</h3>
                <p className="text-gray-700">{(request as any).location || request.department || 'N/A'}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="font-semibold text-sm text-gray-600">Created</h3>
                <p className="text-gray-700">
                  {new Date(request.created_at).toLocaleDateString()}
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-sm text-gray-600">Last Updated</h3>
                <p className="text-gray-700">
                  {new Date(request.updated_at).toLocaleDateString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Status History */}
        {history.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Status History</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {history.map((item) => (
                  <div key={item.id} className="flex items-start gap-3 pb-3 border-b last:border-b-0">
                    <div className="flex-1">
                      <p className="text-sm text-gray-600">
                        Status changed from <Badge variant="outline">{item.old_status}</Badge> to{' '}
                        <Badge variant="outline">{item.new_status}</Badge>
                      </p>
                      {item.reason && <p className="text-sm text-gray-700 mt-1">{item.reason}</p>}
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(item.created_at).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Rating Section */}
        {request.status === 'completed' && !showRating && (
          <Card className="border-green-200 bg-green-50">
            <CardContent className="pt-6">
              <p className="text-green-700 mb-4">
                Thank you for using our service! Your request has been completed. Please take a moment to rate your experience.
              </p>
              <Button
                onClick={() => setShowRating(true)}
                className="bg-green-600 hover:bg-green-700"
              >
                Rate This Request
              </Button>
            </CardContent>
          </Card>
        )}

        {showRating && request.status === 'completed' && (
          <RateRequest
            requestId={requestId}
            onRatingSubmitted={() => {
              setShowRating(false);
              fetchRequest();
            }}
          />
        )}

        {/* Re-open Request Button and Request Change */}
        {request.status === 'completed' && (
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={async () => {
                const token = localStorage.getItem('token');
                try {
                  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/requests/${requestId}/reopen`, { method: 'POST', headers: { Authorization: `Bearer ${token}` } });
                  if (!res.ok) {
                    const err = await res.json().catch(() => null);
                    alert(err?.error || 'Failed to reopen request');
                    return;
                  }
                  alert('Request reopened successfully');
                  fetchRequest();
                } catch (err) {
                  alert('Failed to reopen request');
                }
              }}
            >
              Need to Re-open This Request?
            </Button>

            <Button
              onClick={async () => {
                const message = prompt('Describe the change you want to request:');
                if (!message) return;
                const token = localStorage.getItem('token');
                try {
                  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/requests/${requestId}/request-change`, { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ message }) });
                  if (!res.ok) {
                    const err = await res.json().catch(() => null);
                    alert(err?.error || 'Failed to submit change request');
                    return;
                  }
                  alert('Change request submitted. Admin will review it.');
                } catch (err) {
                  alert('Failed to submit change request');
                }
              }}
            >
              Request Change
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
