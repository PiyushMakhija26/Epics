'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, CheckCircle2, Star } from 'lucide-react';

interface RateRequestProps {
  requestId: string;
  onRatingSubmitted?: () => void;
}

export function RateRequest({ requestId, onRatingSubmitted }: RateRequestProps) {
  const [rating, setRating] = useState<'excellent' | 'good' | 'open_again' | null>(null);
  const [comments, setComments] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!rating) {
      setError('Please select a rating');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/requests/${requestId}/rate`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            rating,
            comments: comments.trim() || null,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Failed to submit rating');
        return;
      }

      setSuccess(true);
      setRating(null);
      setComments('');

      setTimeout(() => {
        onRatingSubmitted?.();
      }, 1500);
    } catch (err) {
      setError('Failed to submit rating. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <Card className="bg-green-50 border-green-200">
        <CardContent className="pt-6">
          <div className="flex items-center gap-2 text-green-700">
            <CheckCircle2 className="h-5 w-5" />
            <p>Thank you for your rating!</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Rate This Request</CardTitle>
        <CardDescription>
          Help us improve by rating how well this request was handled
        </CardDescription>
      </CardHeader>
      <CardContent>
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <Label className="mb-3 block">How would you rate this request?</Label>
            <div className="space-y-2">
              {[
                { value: 'excellent' as const, label: 'Excellent', icon: '⭐⭐⭐' },
                { value: 'good' as const, label: 'Good', icon: '⭐⭐' },
                { value: 'open_again' as const, label: 'Needs Improvement / Reopen', icon: '⭐' },
              ].map((option) => (
                <label
                  key={option.value}
                  className={`flex items-center p-3 border-2 rounded-lg cursor-pointer transition-all ${
                    rating === option.value
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="rating"
                    value={option.value}
                    checked={rating === option.value}
                    onChange={(e) => setRating(e.target.value as typeof option.value)}
                    disabled={loading}
                    className="mr-3"
                  />
                  <span className="flex-1">
                    <span className="font-medium">{option.label}</span>
                    <span className="ml-2 text-yellow-500">{option.icon}</span>
                  </span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <Label htmlFor="comments">Additional Comments (Optional)</Label>
            <Textarea
              id="comments"
              placeholder="Share any additional feedback..."
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              disabled={loading}
              className="mt-2"
              rows={4}
            />
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Submitting...' : 'Submit Rating'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
