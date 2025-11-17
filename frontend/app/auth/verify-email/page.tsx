'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';

export default function VerifyEmailPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 to-accent/5 flex items-center justify-center p-4">
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <div className="text-4xl mb-4">📧</div>
          <CardTitle className="text-2xl">Verify Your Email</CardTitle>
          <CardDescription>Check your inbox for verification link</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            We've sent a verification email to your inbox. Click the link to confirm your account and get started.
          </p>
          <Link href="/auth/login" className="inline-block">
            <Button variant="outline">Back to Login</Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
