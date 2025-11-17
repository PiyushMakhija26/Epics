'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, CheckCircle2 } from 'lucide-react';

type Step = 'email' | 'questions' | 'reset' | 'success';

interface SecurityQuestion {
  question_id: string;
  security_questions: {
    question: string;
  };
}

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>('email');
  const [email, setEmail] = useState('');
  const [questions, setQuestions] = useState<SecurityQuestion[]>([]);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [resetToken, setResetToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setError('Please enter your email');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/auth/forgot-password/questions/${email}`
      );
      const data = await response.json();

      if (data.questions && data.questions.length > 0) {
        setQuestions(data.questions);
        setStep('questions');
        // Initialize answers object
        const answersObj: Record<string, string> = {};
        data.questions.forEach((q: SecurityQuestion) => {
          answersObj[q.question_id] = '';
        });
        setAnswers(answersObj);
      } else {
        setError('No security questions found. Please try the email reset method or contact support.');
      }
    } catch (err) {
      setError('Failed to fetch security questions. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuestionsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Check if all answers are filled
    if (Object.values(answers).some(answer => !answer.trim())) {
      setError('Please answer all security questions');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const answersArray = Object.entries(answers).map(([questionId, answer]) => ({
        questionId,
        answer,
      }));

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/auth/forgot-password/verify-questions`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email,
            answers: answersArray,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Failed to verify security answers');
        return;
      }

      setResetToken(data.resetToken);
      setStep('reset');
      setSuccessMessage('Security answers verified! Please set your new password.');
    } catch (err) {
      setError('Failed to verify security answers. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newPassword || !confirmPassword) {
      setError('Please fill in all password fields');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/auth/password-reset/verify`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            token: resetToken,
            newPassword,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Failed to reset password');
        return;
      }

      setStep('success');
      setSuccessMessage('Password reset successful! Redirecting to login...');
      
      setTimeout(() => {
        router.push('/auth/login');
      }, 2000);
    } catch (err) {
      setError('Failed to reset password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Reset Your Password</CardTitle>
          <CardDescription>
            {step === 'email' && 'Enter your email to get started'}
            {step === 'questions' && 'Answer your security questions'}
            {step === 'reset' && 'Create a new password'}
            {step === 'success' && 'Password reset successful'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {successMessage && (
            <Alert className="mb-4 bg-green-50 border-green-200">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">{successMessage}</AlertDescription>
            </Alert>
          )}

          {step === 'email' && (
            <form onSubmit={handleEmailSubmit} className="space-y-4">
              <div>
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Checking...' : 'Next'}
              </Button>
              <Link href="/auth/login">
                <Button type="button" variant="ghost" className="w-full">
                  Back to Login
                </Button>
              </Link>
            </form>
          )}

          {step === 'questions' && (
            <form onSubmit={handleQuestionsSubmit} className="space-y-4">
              {questions.map((question) => (
                <div key={question.question_id}>
                  <Label htmlFor={question.question_id} className="text-sm">
                    {question.security_questions.question}
                  </Label>
                  <Input
                    id={question.question_id}
                    type="text"
                    placeholder="Your answer"
                    value={answers[question.question_id] || ''}
                    onChange={(e) =>
                      setAnswers({
                        ...answers,
                        [question.question_id]: e.target.value,
                      })
                    }
                    disabled={loading}
                  />
                </div>
              ))}
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Verifying...' : 'Verify Answers'}
              </Button>
              <Button
                type="button"
                variant="ghost"
                className="w-full"
                onClick={() => {
                  setStep('email');
                  setError('');
                }}
              >
                Back
              </Button>
            </form>
          )}

          {step === 'reset' && (
            <form onSubmit={handlePasswordReset} className="space-y-4">
              <div>
                <Label htmlFor="newPassword">New Password</Label>
                <Input
                  id="newPassword"
                  type="password"
                  placeholder="Enter new password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  disabled={loading}
                />
              </div>
              <div>
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="Confirm new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  disabled={loading}
                />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Resetting...' : 'Reset Password'}
              </Button>
              <Button
                type="button"
                variant="ghost"
                className="w-full"
                onClick={() => {
                  setStep('questions');
                  setError('');
                }}
              >
                Back
              </Button>
            </form>
          )}

          {step === 'success' && (
            <div className="text-center space-y-4">
              <CheckCircle2 className="h-12 w-12 text-green-600 mx-auto" />
              <p className="text-green-700">Your password has been reset successfully!</p>
              <p className="text-sm text-gray-600">Redirecting to login page...</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
