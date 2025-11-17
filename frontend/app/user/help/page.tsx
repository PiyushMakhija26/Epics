'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const RECENT_REQUESTS = [
  { id: 1, title: 'Pothole on Main Street', date: '2024-11-15', latest: 'Work crew assigned, will start tomorrow morning' },
  { id: 2, title: 'Water Supply Issue', date: '2024-11-14', latest: 'Request received and logged' },
  { id: 3, title: 'Street Light Repair', date: '2024-11-10', latest: 'Repair completed successfully' },
];

export default function HelpPage() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleContactAuthority = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => {
      setMessage('');
      setEmail('');
      setSubmitted(false);
    }, 2000);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Help & Support</h1>
        <p className="text-gray-600 mt-2">Get help with your requests and contact authorities.</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Recent Requests */}
        <Card className="border-gray-200">
          <CardHeader>
            <CardTitle className="text-gray-900">Recent Request Updates</CardTitle>
            <CardDescription>Latest activity on your requests</CardDescription>
          </CardHeader>
          <CardContent>
            {RECENT_REQUESTS.length === 0 ? (
              <p className="text-gray-600 text-center py-8">No requests yet</p>
            ) : (
              <div className="space-y-3">
                {RECENT_REQUESTS.map((req) => (
                  <div key={req.id} className="border-l-4 border-blue-600 pl-4 py-2">
                    <p className="font-semibold text-sm text-gray-900">{req.title}</p>
                    <p className="text-xs text-gray-600">{req.date}</p>
                    <p className="text-xs text-gray-700 mt-1">Latest: {req.latest}</p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Contact Authority */}
        <Card className="border-gray-200">
          <CardHeader>
            <CardTitle className="text-gray-900">Contact Authority</CardTitle>
            <CardDescription>Send a message for swift action</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleContactAuthority} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="contact-email" className="text-gray-700">Your Email</Label>
                <Input
                  id="contact-email"
                  type="email"
                  placeholder="your@email.com"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="border-gray-200 bg-white"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="contact-message" className="text-gray-700">Message</Label>
                <textarea
                  id="contact-message"
                  placeholder="Describe your concern..."
                  className="w-full min-h-24 px-3 py-2 border border-gray-200 rounded-md bg-white text-gray-900 font-sans"
                  required
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                />
              </div>
              <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700">
                {submitted ? 'Message Sent!' : 'Send Message'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>

      {/* FAQ */}
      <Card className="border-gray-200">
        <CardHeader>
          <CardTitle className="text-gray-900">Frequently Asked Questions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h3 className="font-semibold text-gray-900">How long does it take to resolve a request?</h3>
            <p className="text-gray-600 text-sm mt-2">Resolution time depends on the issue complexity and department workload. You can track progress in real-time through your dashboard.</p>
          </div>
          <div className="border-t border-gray-200 pt-4">
            <h3 className="font-semibold text-gray-900">Can I edit my request after submitting?</h3>
            <p className="text-gray-600 text-sm mt-2">Contact the authority through this section if you need to modify your request details or provide additional information.</p>
          </div>
          <div className="border-t border-gray-200 pt-4">
            <h3 className="font-semibold text-gray-900">What if I'm not satisfied with the resolution?</h3>
            <p className="text-gray-600 text-sm mt-2">You can reopen a completed request to request further action or escalate it to a supervisor for review.</p>
          </div>
          <div className="border-t border-gray-200 pt-4">
            <h3 className="font-semibold text-gray-900">How do I track my request?</h3>
            <p className="text-gray-600 text-sm mt-2">Visit your Review Requests section to see real-time updates on all your submitted requests with their current status.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
