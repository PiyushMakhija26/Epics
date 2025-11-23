'use client';

import { useState, Suspense, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import { Label } from '@/components/ui/label';
import { SecurityQuestionsSetup } from '@/components/security-questions-setup';
import INDIA_LOCATIONS from '@/lib/indiaLocations';
import Chatbot from '@/components/chatbot';

function SignupContent() {
  const router = useRouter();
  const [role, setRole] = useState<'user' | 'admin'>('user');
  const [step, setStep] = useState<'role' | 'auth' | 'profile' | 'security'>('role');

  useEffect(() => {
    try {
      const params = new URLSearchParams(typeof window !== 'undefined' ? window.location.search : '');
      const initialRole = (params.get('role') as 'user' | 'admin') || 'user';
      setRole(initialRole);
      setStep(initialRole ? 'auth' : 'role');
    } catch (err) {
      // silently ignore
    }
  }, []);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [repeatPassword, setRepeatPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [department, setDepartment] = useState('');
  const [userId, setUserId] = useState('');
  const [userToken, setUserToken] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const departments = ['Electricity', 'Water', 'Sanitation', 'Medical', 'Services', 'Others'];
  const [availableStates, setAvailableStates] = useState<string[]>(INDIA_LOCATIONS.map((s) => s.state));
  const [availableCities, setAvailableCities] = useState<string[]>([]);

  const handleRoleSelect = (selectedRole: 'user' | 'admin') => {
    setRole(selectedRole);
    setStep('auth');
  };

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password !== repeatPassword) {
      setError('Passwords do not match');
      return;
    }

    setStep('profile');
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      // Call backend signup API
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          password,
          fullName,
          role,
          address: role === 'user' ? address : null,
          city: role === 'user' ? city : null,
          state: role === 'user' ? state : null,
          department: role === 'admin' ? department : null,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Signup failed');
      }

      const data = await response.json();
      
      // Store token and user info
      setUserId(data.user.user_id);
      setUserToken(data.token);
      localStorage.setItem('token', data.token);
      localStorage.setItem('user_id', data.user.user_id);
      localStorage.setItem('user_type', data.user.user_type);

      // Move to security questions step
      setStep('security');
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 to-accent/5 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        {step === 'role' && (
          <>
            <CardHeader>
              <CardTitle className="text-2xl">Join CivicServe</CardTitle>
              <CardDescription>Select your account type</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button
                onClick={() => handleRoleSelect('user')}
                variant="outline"
                className="w-full h-20 flex flex-col items-center justify-center gap-2 text-lg"
              >
                <span className="text-2xl">👤</span>
                Citizen
              </Button>
              <Button
                onClick={() => handleRoleSelect('admin')}
                variant="outline"
                className="w-full h-20 flex flex-col items-center justify-center gap-2 text-lg"
              >
                <span className="text-2xl">⚙️</span>
                Authority
              </Button>
            </CardContent>
          </>
        )}

        {step === 'auth' && (
          <>
            <CardHeader>
              <CardTitle className="text-2xl">Create Account</CardTitle>
              <CardDescription>
                {role === 'user' ? 'Sign up as a citizen' : 'Sign up as an authority member'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleAuthSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="m@example.com"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="repeat-password">Repeat Password</Label>
                  <Input
                    id="repeat-password"
                    type="password"
                    required
                    value={repeatPassword}
                    onChange={(e) => setRepeatPassword(e.target.value)}
                  />
                </div>
                {error && <p className="text-sm text-destructive">{error}</p>}
                <div className="flex gap-2 pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setStep('role')}
                  >
                    Back
                  </Button>
                  <Button type="submit" className="flex-1">Next</Button>
                </div>
              </form>
            </CardContent>
          </>
        )}

        {step === 'profile' && (
          <>
            <CardHeader>
              <CardTitle className="text-2xl">Complete Profile</CardTitle>
              <CardDescription>
                {role === 'user' ? 'Tell us about yourself' : 'Select your department'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleProfileSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    placeholder="John Doe"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                  />
                </div>

                {role === 'user' ? (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="address">Address</Label>
                      <Input
                        id="address"
                        placeholder="123 Main St"
                        required
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="state">State</Label>
                        <select
                          id="state"
                          className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground"
                          required
                          value={state}
                          onChange={(e) => {
                            setState(e.target.value);
                            setCity('');
                            // fetch cities for this state from backend if available
                            (async () => {
                              try {
                                const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/locations/cities?state=${encodeURIComponent(e.target.value)}`);
                                if (!res.ok) return;
                                const data = await res.json();
                                setAvailableCities(data.cities || []);
                              } catch (err) {
                                // fallback to local list
                                setAvailableCities(INDIA_LOCATIONS.find((s) => s.state === e.target.value)?.cities || []);
                              }
                            })();
                          }}
                        >
                          <option value="">Select state</option>
                          {availableStates.map((s) => (
                            <option key={s} value={s}>{s}</option>
                          ))}
                        </select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="city">City</Label>
                        <select
                          id="city"
                          className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground"
                          required
                          value={city}
                          onChange={(e) => setCity(e.target.value)}
                          disabled={!state}
                        >
                          <option value="">Select city</option>
                          {(availableCities.length ? availableCities : INDIA_LOCATIONS.find((s) => s.state === state)?.cities || []).map((c) => (
                            <option key={c} value={c}>{c}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="space-y-2">
                    <Label htmlFor="department">Department</Label>
                    <select
                      id="department"
                      className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground"
                      required
                      value={department}
                      onChange={(e) => setDepartment(e.target.value)}
                    >
                      <option value="">Select a department</option>
                      {departments.map((dept) => (
                        <option key={dept} value={dept}>{dept}</option>
                      ))}
                    </select>
                  </div>
                )}

                {error && <p className="text-sm text-destructive">{error}</p>}
                <div className="flex gap-2 pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setStep('auth')}
                  >
                    Back
                  </Button>
                  <Button type="submit" disabled={isLoading} className="flex-1">
                    {isLoading ? 'Creating Account...' : 'Sign Up'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </>
        )}

        {step !== 'role' && (
          <div className="px-6 py-4 border-t text-center text-sm text-muted-foreground">
            Already have an account?{' '}
            <Link href="/auth/login" className="text-primary hover:underline">
              Sign in
            </Link>
          </div>
        )}

        {step === 'security' && (
          <>
            <CardHeader>
              <CardTitle className="text-2xl">Set Security Questions</CardTitle>
              <CardDescription>
                These help you recover your account if you forget your password
              </CardDescription>
            </CardHeader>
            <CardContent>
              <SecurityQuestionsSetup
                onComplete={async (answers) => {
                  try {
                    setIsLoading(true);
                    // Send security questions to backend
                    const response = await fetch(
                      `${process.env.NEXT_PUBLIC_API_URL}/api/auth/security-answers`,
                      {
                        method: 'POST',
                        headers: {
                          'Content-Type': 'application/json',
                          Authorization: `Bearer ${userToken}`,
                        },
                        body: JSON.stringify({ answers }),
                      }
                    );

                    if (!response.ok) {
                      throw new Error('Failed to set security questions');
                    }

                    // Redirect to dashboard based on role
                    if (role === 'admin') {
                      router.push('/admin/dashboard');
                    } else {
                      router.push('/user/dashboard');
                    }
                  } catch (err) {
                    setError(err instanceof Error ? err.message : 'An error occurred');
                  } finally {
                    setIsLoading(false);
                  }
                }}
                loading={isLoading}
              />
            </CardContent>
          </>
        )}
      </Card>
      {/* Floating chatbot for registration help */}
      <Chatbot />
    </div>
  );
}

export default function SignupPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SignupContent />
    </Suspense>
  );
}
