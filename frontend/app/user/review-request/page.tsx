'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { createClient } from '@/lib/supabase/client';

export default function ReviewRequestPage() {
  const [requests, setRequests] = useState<any[]>([]);
  const [filter, setFilter] = useState('all');
  const [selectedRequest, setSelectedRequest] = useState<any | null>(null);
  const [updates, setUpdates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadRequests = async () => {
      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) return;

        const { data, error } = await supabase
          .from('service_requests')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (error) throw error;

        if (data) {
          setRequests(data);
          if (data.length > 0) {
            setSelectedRequest(data[0]);
            loadUpdates(data[0].id);
          }
        }
        setLoading(false);
      } catch (error) {
        console.error('Error loading requests:', error);
        setLoading(false);
      }
    };

    loadRequests();
  }, []);

  const loadUpdates = async (requestId: string) => {
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('request_updates')
        .select('*')
        .eq('request_id', requestId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setUpdates(data || []);
    } catch (error) {
      console.error('Error loading updates:', error);
    }
  };

  const handleSelectRequest = (request: any) => {
    setSelectedRequest(request);
    loadUpdates(request.id);
  };

  const filteredRequests = filter === 'all' 
    ? requests 
    : requests.filter(r => r.status === filter);

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'in_progress': return 'bg-orange-100 text-orange-800';
      case 'raised': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Review Requests</h1>
        <p className="text-gray-600 mt-2">Track the status of your submitted requests.</p>
      </div>

      <div className="flex gap-2 flex-wrap">
        {['all', 'raised', 'in_progress', 'completed'].map((status) => (
          <Button
            key={status}
            variant={filter === status ? 'default' : 'outline'}
            onClick={() => setFilter(status)}
            className={filter === status ? 'bg-blue-600 hover:bg-blue-700' : ''}
          >
            {status === 'all' ? 'All' : status.replace('_', ' ')}
          </Button>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Request List */}
        <div className="lg:col-span-1">
          <Card className="border-gray-200">
            <CardHeader>
              <CardTitle className="text-lg text-gray-900">Requests</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <p className="text-gray-600 text-center py-8">Loading...</p>
              ) : filteredRequests.length === 0 ? (
                <p className="text-gray-600 text-center py-8">No requests found</p>
              ) : (
                <div className="space-y-2">
                  {filteredRequests.map((req) => (
                    <button
                      key={req.id}
                      onClick={() => handleSelectRequest(req)}
                      className={`w-full text-left p-3 rounded-lg border-2 transition ${
                        selectedRequest?.id === req.id
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

        {/* Request Details */}
        <div className="lg:col-span-2">
          {selectedRequest ? (
            <Card className="border-gray-200">
              <CardHeader>
                <CardTitle className="text-gray-900">{selectedRequest.title}</CardTitle>
                <CardDescription>Created on {new Date(selectedRequest.created_at).toLocaleDateString()}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Description</h3>
                  <p className="text-gray-600">{selectedRequest.description}</p>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Current Status</h3>
                  <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(selectedRequest.status)}`}>
                    {selectedRequest.status.replace('_', ' ')}
                  </span>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-900 mb-4">Updates</h3>
                  {updates.length === 0 ? (
                    <p className="text-gray-600 text-sm">No updates yet. We'll notify you when there's progress.</p>
                  ) : (
                    <div className="space-y-3">
                      {updates.map((update) => (
                        <div key={update.id} className="border-l-4 border-blue-600 pl-4 py-2">
                          <p className="text-sm text-gray-600">{new Date(update.created_at).toLocaleDateString()}</p>
                          <p className="text-gray-900 text-sm mt-1">{update.message}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <Button className="w-full bg-blue-600 hover:bg-blue-700">
                  Send Alarm to Admin for Swift Action
                </Button>
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
