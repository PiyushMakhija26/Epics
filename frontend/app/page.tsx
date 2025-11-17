'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function LandingPage() {
  const [role, setRole] = useState<'user' | 'admin' | null>(null);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-orange-50">
      {/* Header */}
      <header className="border-b bg-white/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">CS</span>
            </div>
            <h1 className="text-xl font-bold text-gray-900">CivicServe</h1>
          </div>
          <div className="flex gap-2">
            <Link href="/login">
              <Button variant="outline">Sign In</Button>
            </Link>
            <Link href="/signup">
              <Button>Get Started</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 container mx-auto px-4 py-20">
        <div className="grid lg:grid-cols-2 gap-12 items-center mb-20">
          <div>
            <h2 className="text-5xl md:text-6xl font-bold mb-6 text-gray-900">
              Civic Services Made Simple
            </h2>
            <p className="text-lg text-gray-600 mb-8">
              Report issues, track progress, and connect with local authorities. Fast, transparent, and efficient service requests.
            </p>
            <div className="flex gap-4">
              <Link href="/signup?role=user">
                <Button size="lg" className="bg-blue-600 hover:bg-blue-700 gap-2">
                  I'm a Citizen
                </Button>
              </Link>
              <Link href="/signup?role=admin">
                <Button size="lg" variant="outline">
                  I'm an Authority
                </Button>
              </Link>
            </div>
          </div>
          <div className="relative h-96 bg-gradient-to-br from-blue-100 to-orange-100 rounded-2xl border border-gray-200 flex items-center justify-center">
            <div className="text-center">
              <div className="text-6xl mb-4">📋</div>
              <p className="text-gray-700 font-semibold">Request Management System</p>
            </div>
          </div>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-6 mb-20">
          <Card className="border border-gray-200 hover:border-blue-300 transition-colors">
            <CardHeader>
              <div className="text-4xl mb-3">🎯</div>
              <CardTitle className="text-gray-900">Quick Reporting</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">Submit civic issues with detailed descriptions and images in minutes.</p>
            </CardContent>
          </Card>

          <Card className="border border-gray-200 hover:border-blue-300 transition-colors">
            <CardHeader>
              <div className="text-4xl mb-3">📊</div>
              <CardTitle className="text-gray-900">Track Progress</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">Real-time updates on your request status from authorities.</p>
            </CardContent>
          </Card>

          <Card className="border border-gray-200 hover:border-blue-300 transition-colors">
            <CardHeader>
              <div className="text-4xl mb-3">⚡</div>
              <CardTitle className="text-gray-900">Fast Resolution</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">Efficient workflow management for quick problem solving.</p>
            </CardContent>
          </Card>
        </div>

        {/* How it Works */}
        <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center shadow-sm">
          <h3 className="text-2xl font-bold text-gray-900 mb-8">How It Works</h3>
          <div className="grid md:grid-cols-4 gap-6">
            <div>
              <div className="text-4xl font-bold text-blue-600 mb-3">1</div>
              <p className="font-semibold text-gray-900">Register</p>
              <p className="text-sm text-gray-600 mt-1">Create your account</p>
            </div>
            <div>
              <div className="text-4xl font-bold text-blue-600 mb-3">2</div>
              <p className="font-semibold text-gray-900">Report</p>
              <p className="text-sm text-gray-600 mt-1">Describe your issue</p>
            </div>
            <div>
              <div className="text-4xl font-bold text-blue-600 mb-3">3</div>
              <p className="font-semibold text-gray-900">Track</p>
              <p className="text-sm text-gray-600 mt-1">Monitor progress</p>
            </div>
            <div>
              <div className="text-4xl font-bold text-blue-600 mb-3">4</div>
              <p className="font-semibold text-gray-900">Resolve</p>
              <p className="text-sm text-gray-600 mt-1">Issue completed</p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t bg-white/50 backdrop-blur-sm mt-20">
        <div className="container mx-auto px-4 py-12">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <h4 className="font-bold text-gray-900 mb-4">CivicServe</h4>
              <p className="text-sm text-gray-600">Making civic services transparent and efficient.</p>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-4 text-sm">For Citizens</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li><a href="#" className="hover:text-gray-900 transition">Report Issue</a></li>
                <li><a href="#" className="hover:text-gray-900 transition">Track Request</a></li>
                <li><a href="#" className="hover:text-gray-900 transition">Contact Us</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-4 text-sm">For Authorities</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li><a href="#" className="hover:text-gray-900 transition">Manage Requests</a></li>
                <li><a href="#" className="hover:text-gray-900 transition">Team Dashboard</a></li>
                <li><a href="#" className="hover:text-gray-900 transition">Analytics</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-4 text-sm">Support</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li><a href="#" className="hover:text-gray-900 transition">Help Center</a></li>
                <li><a href="#" className="hover:text-gray-900 transition">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-gray-900 transition">Terms of Service</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-200 pt-8 text-center text-sm text-gray-600">
            <p>&copy; 2025 CivicServe. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
