'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const MOCK_REQUESTS = [
  { id: 1, title: 'Pothole on Main Street', status: 'raised', date: '2024-11-15' },
  { id: 2, title: 'Water Supply Issue', status: 'in_progress', date: '2024-11-14' },
  { id: 3, title: 'Street Light Repair', status: 'completed', date: '2024-11-10' },
  { id: 4, title: 'Road Cleaning', status: 'raised', date: '2024-11-12' },
];

export default function AdminDashboard() {
  const stats = {
    total: MOCK_REQUESTS.length,
    raised: MOCK_REQUESTS.filter(r => r.status === 'raised').length,
    inProgress: MOCK_REQUESTS.filter(r => r.status === 'in_progress').length,
    completed: MOCK_REQUESTS.filter(r => r.status === 'completed').length,
  };

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
        <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="text-gray-600 mt-2">Manage service requests for Electricity Department</p>
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
      <div className="grid md:grid-cols-3 gap-4">
        <Link href="/admin/raised-requests">
          <Card className="cursor-pointer hover:border-blue-300 hover:shadow-md transition border-gray-200">
            <CardHeader>
              <CardTitle className="text-gray-900">View Raised Requests</CardTitle>
              <CardDescription>See all new requests</CardDescription>
            </CardHeader>
          </Card>
        </Link>
        <Link href="/admin/update-status">
          <Card className="cursor-pointer hover:border-blue-300 hover:shadow-md transition border-gray-200">
            <CardHeader>
              <CardTitle className="text-gray-900">Update Request Status</CardTitle>
              <CardDescription>Manage request progress</CardDescription>
            </CardHeader>
          </Card>
        </Link>
        <Link href="/admin/allocate-work">
          <Card className="cursor-pointer hover:border-blue-300 hover:shadow-md transition border-gray-200">
            <CardHeader>
              <CardTitle className="text-gray-900">Allocate Work</CardTitle>
              <CardDescription>Assign tasks to team</CardDescription>
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
          {MOCK_REQUESTS.length === 0 ? (
            <p className="text-gray-600 text-center py-8">No requests yet</p>
          ) : (
            <div className="space-y-3">
              {MOCK_REQUESTS.map((request) => (
                <div key={request.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900">{request.title}</p>
                    <p className="text-sm text-gray-600">{request.date}</p>
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
