'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { createClient } from '@/lib/supabase/client';

const MOCK_REQUESTS = [
  { id: 1, title: 'Pothole on Main Street', status: 'in_progress', date: '2024-11-15', department: 'Public Works' },
  { id: 2, title: 'Water Supply Issue', status: 'raised', date: '2024-11-14', department: 'Water' },
  { id: 3, title: 'Street Light Repair', status: 'completed', date: '2024-11-10', department: 'Electricity' },
];

export default function UserDashboard() {
  const [requests, setRequests] = useState<any[]>([]);
  const [stats, setStats] = useState({
    total: 0,
    raised: 0,
    inProgress: 0,
    completed: 0,
  });
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
          setStats({
            total: data.length,
            raised: data.filter(r => r.status === 'raised').length,
            inProgress: data.filter(r => r.status === 'in_progress').length,
            completed: data.filter(r => r.status === 'completed').length,
          });
        }
        setLoading(false);
      } catch (error) {
        console.error('Error loading requests:', error);
        setLoading(false);
      }
    };

    loadRequests();
  }, []);

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
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-2">Welcome back! Here's your request overview.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid md:grid-cols-4 gap-4">
        <Card className="border-gray-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Requests</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900">{stats.total}</div>
          </CardContent>
        </Card>
        <Card className="border-gray-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Raised</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600">{stats.raised}</div>
          </CardContent>
        </Card>
        <Card className="border-gray-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">In Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-orange-600">{stats.inProgress}</div>
          </CardContent>
        </Card>
        <Card className="border-gray-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Completed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">{stats.completed}</div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid md:grid-cols-2 gap-4">
        <Link href="/user/raise-request">
          <Card className="cursor-pointer hover:border-blue-300 hover:shadow-md transition border-gray-200">
            <CardHeader>
              <CardTitle className="text-gray-900">New Request</CardTitle>
              <CardDescription>Report a new civic issue</CardDescription>
            </CardHeader>
          </Card>
        </Link>
        <Link href="/user/review-request">
          <Card className="cursor-pointer hover:border-blue-300 hover:shadow-md transition border-gray-200">
            <CardHeader>
              <CardTitle className="text-gray-900">Review Requests</CardTitle>
              <CardDescription>Check status of your requests</CardDescription>
            </CardHeader>
          </Card>
        </Link>
      </div>

      {/* Recent Requests */}
      <Card className="border-gray-200">
        <CardHeader>
          <CardTitle className="text-gray-900">Recent Requests</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-gray-600 text-center py-8">Loading requests...</p>
          ) : requests.length === 0 ? (
            <p className="text-gray-600 text-center py-8">No requests yet. Start by raising a new request.</p>
          ) : (
            <div className="space-y-3">
              {requests.slice(0, 5).map((request) => (
                <div key={request.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
                  <div>
                    <p className="font-semibold text-gray-900">{request.title}</p>
                    <p className="text-sm text-gray-600">{new Date(request.created_at).toLocaleDateString()}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(request.status)}`}>
                    {request.status.replace('_', ' ')}
                  </span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
