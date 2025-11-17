'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const TEAM_MEMBERS = [
  { id: '1', name: 'Mike Johnson', email: 'mike.johnson@civic.gov', department: 'Electricity', joinDate: '2024-01-15' },
  { id: '2', name: 'Sarah Williams', email: 'sarah.williams@civic.gov', department: 'Electricity', joinDate: '2024-02-20' },
  { id: '3', name: 'David Brown', email: 'david.brown@civic.gov', department: 'Electricity', joinDate: '2024-03-10' },
  { id: '4', name: 'Emily Davis', email: 'emily.davis@civic.gov', department: 'Electricity', joinDate: '2024-04-05' },
];

export default function TeamPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Team Members</h1>
        <p className="text-gray-600 mt-2">All admins in the Electricity Department</p>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {TEAM_MEMBERS.length === 0 ? (
          <Card className="col-span-full border-gray-200">
            <CardContent className="flex items-center justify-center py-12">
              <p className="text-gray-600">No team members found</p>
            </CardContent>
          </Card>
        ) : (
          TEAM_MEMBERS.map((member) => (
            <Card key={member.id} className="border-gray-200 hover:border-blue-300 transition">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-gray-900">{member.name}</CardTitle>
                  <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-semibold">Admin</span>
                </div>
                <CardDescription>{member.email}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div>
                  <span className="font-semibold text-gray-900">Department:</span>
                  <p className="text-gray-600">{member.department}</p>
                </div>
                <div>
                  <span className="font-semibold text-gray-900">Member Since:</span>
                  <p className="text-gray-600">{member.joinDate}</p>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Team Stats */}
      <Card className="border-gray-200 bg-blue-50">
        <CardHeader>
          <CardTitle className="text-gray-900">Team Statistics</CardTitle>
        </CardHeader>
        <CardContent className="grid md:grid-cols-3 gap-4">
          <div>
            <p className="text-sm text-gray-600 font-semibold">Total Members</p>
            <p className="text-2xl font-bold text-blue-600 mt-2">{TEAM_MEMBERS.length}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600 font-semibold">Department</p>
            <p className="text-2xl font-bold text-blue-600 mt-2">Electricity</p>
          </div>
          <div>
            <p className="text-sm text-gray-600 font-semibold">Active</p>
            <p className="text-2xl font-bold text-green-600 mt-2">{TEAM_MEMBERS.length}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
