"use client";

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';

interface ChangeRequest {
  id: string;
  request_id: string;
  user_id: string;
  message: string;
  status: string;
  admin_response?: string;
  created_at: string;
}

export default function ChangeRequestsPage() {
  const [items, setItems] = useState<ChangeRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedResponse, setSelectedResponse] = useState<Record<string,string>>({});

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/change-requests`, { headers: { Authorization: `Bearer ${token}` } });
      if (!res.ok) throw new Error('Failed to load');
      const data = await res.json();
      setItems(data.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (changeId: string, requestId: string, approve: boolean) => {
    try {
      const token = localStorage.getItem('token');
      const resp = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/requests/${requestId}/change/${changeId}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ approve, adminResponse: selectedResponse[changeId] || '' }),
      });
      if (!resp.ok) throw new Error('Failed');
      await load();
    } catch (err) {
      alert('Operation failed');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Change Requests</h1>
        <p className="text-sm text-muted-foreground">User-submitted change requests awaiting admin review</p>
      </div>

      {loading ? (
        <div>Loading…</div>
      ) : (
        <div className="space-y-4">
          {items.length === 0 && <div className="text-sm text-muted-foreground">No pending change requests</div>}
          {items.map((c) => (
            <Card key={c.id}>
              <CardHeader>
                <div className="flex justify-between w-full">
                  <div>
                    <CardTitle className="text-sm">Request: {c.request_id}</CardTitle>
                    <div className="text-xs text-muted-foreground">From: {c.user_id} — {new Date(c.created_at).toLocaleString()}</div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="mb-3">{c.message}</div>
                <Textarea placeholder="Admin response (optional)" value={selectedResponse[c.id] || ''} onChange={(e) => setSelectedResponse((s) => ({ ...s, [c.id]: e.target.value }))} />
                <div className="flex gap-2 mt-3">
                  <Button onClick={() => handleApprove(c.id, c.request_id, true)} className="bg-green-600">Approve</Button>
                  <Button onClick={() => handleApprove(c.id, c.request_id, false)} variant="destructive">Reject</Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
