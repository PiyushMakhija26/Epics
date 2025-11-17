'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { createClient } from '@/lib/supabase/client';

const DEPARTMENTS = ['Electricity', 'Water', 'Agriculture', 'Law', 'Medical', 'Services'];

export default function SignupPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const roleParam = searchParams.get('role');
  
  const [step, setStep] = useState(1);
  const [role, setRole] = useState<'user' | 'admin' | null>(roleParam === 'admin' ? 'admin' : roleParam === 'user' ? 'user' : null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    address: '',
    state: '',
    city: '',
    department: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRoleSelect = (selectedRole: 'user' | 'admin') => {
    setRole(selectedRole);
    setStep(2);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleDepartmentChange = (value: string) => {
    setFormData(prev => ({ ...prev, department: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (formData.password !== formData.confirmPassword) {
        setError('Passwords do not match');
        setLoading(false);
        return;
      }

      if (role === 'user' && (!formData.address || !formData.state || !formData.city)) {
        setError('Please fill in all location fields');
        setLoading(false);
        return;
      }

      if (role === 'admin' && !formData.department) {
        setError('Please select a department');
        setLoading(false);
        return;
      }

      const supabase = createClient();
      
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          emailRedirectTo: process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL || `${window.location.origin}/auth/verify-email`,
        },
      });

      if (authError) {
        setError(authError.message);
        setLoading(false);
        return;
      }

      if (authData.user) {
        const { error: profileError } = await supabase
          .from('profiles')
          .insert({
            id: authData.user.id,
            email: formData.email,
            full_name: formData.name,
            user_type: role,
            address: role === 'user' ? formData.address : null,
            city: role === 'user' ? formData.city : null,
            state: role === 'user' ? formData.state : null,
            department: role === 'admin' ? formData.department : null,
          });

        if (profileError) {
          setError('Failed to create profile: ' + profileError.message);
          setLoading(false);
          return;
        }

        // Redirect to email verification
        router.push(`/auth/verify-email?email=${encodeURIComponent(formData.email)}`);
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred during signup');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-orange-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md border-gray-200">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">CS</span>
            </div>
            <span className="font-bold text-gray-900">CivicServe</span>
          </div>
          <CardTitle className="text-gray-900">Create Your Account</CardTitle>
          <CardDescription>Join CivicServe and make a difference</CardDescription>
        </CardHeader>
        <CardContent>
          {/* Step 1: Role Selection */}
          {step === 1 && !role && (
            <div className="space-y-4">
              <p className="text-sm text-gray-600 text-center mb-6">Are you a citizen or authority?</p>
              <Button 
                onClick={() => handleRoleSelect('user')}
                className="w-full bg-blue-600 hover:bg-blue-700 h-12"
              >
                I'm a Citizen
              </Button>
              <Button 
                onClick={() => handleRoleSelect('admin')}
                variant="outline"
                className="w-full border-blue-200 h-12"
              >
                I'm an Authority
              </Button>
              <div className="text-center text-sm text-gray-600 mt-6">
                Already have an account? <Link href="/login" className="text-blue-600 hover:underline">Sign In</Link>
              </div>
            </div>
          )}

          {/* Step 2: Registration Form */}
          {step === 2 && role && (
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-md p-3 text-sm text-red-700">
                  {error}
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="name" className="text-gray-700">Full Name</Label>
                <Input
                  id="name"
                  name="name"
                  type="text"
                  placeholder="John Doe"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  className="border-gray-200 bg-white"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-gray-700">Email Address</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="john@example.com"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  className="border-gray-200 bg-white"
                />
              </div>

              {role === 'user' && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="address" className="text-gray-700">Address</Label>
                    <Input
                      id="address"
                      name="address"
                      type="text"
                      placeholder="123 Main St"
                      value={formData.address}
                      onChange={handleInputChange}
                      required
                      className="border-gray-200 bg-white"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="state" className="text-gray-700">State</Label>
                      <Input
                        id="state"
                        name="state"
                        type="text"
                        placeholder="California"
                        value={formData.state}
                        onChange={handleInputChange}
                        required
                        className="border-gray-200 bg-white"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="city" className="text-gray-700">City</Label>
                      <Input
                        id="city"
                        name="city"
                        type="text"
                        placeholder="San Francisco"
                        value={formData.city}
                        onChange={handleInputChange}
                        required
                        className="border-gray-200 bg-white"
                      />
                    </div>
                  </div>
                </>
              )}

              {role === 'admin' && (
                <div className="space-y-2">
                  <Label htmlFor="department" className="text-gray-700">Department</Label>
                  <Select value={formData.department} onValueChange={handleDepartmentChange}>
                    <SelectTrigger className="border-gray-200 bg-white">
                      <SelectValue placeholder="Select your department" />
                    </SelectTrigger>
                    <SelectContent>
                      {DEPARTMENTS.map(dept => (
                        <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="password" className="text-gray-700">Password</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleInputChange}
                  required
                  className="border-gray-200 bg-white"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-gray-700">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  placeholder="••••••••"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  required
                  className="border-gray-200 bg-white"
                />
              </div>

              <Button 
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 h-10 mt-6"
              >
                {loading ? 'Creating Account...' : 'Create Account'}
              </Button>

              <Button
                type="button"
                variant="ghost"
                onClick={() => setStep(1)}
                className="w-full"
              >
                Back
              </Button>

              <div className="text-center text-sm text-gray-600 mt-4">
                Already have an account? <Link href="/login" className="text-blue-600 hover:underline">Sign In</Link>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
