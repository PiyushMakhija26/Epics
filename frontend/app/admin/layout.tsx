'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [adminName] = useState('Admin Officer');
  const [department] = useState('Electricity');

  const handleLogout = () => {
    router.push('/');
  };

  const isActive = (path: string) => pathname === path;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="border-b bg-white sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">CS</span>
            </div>
            <span className="font-bold text-gray-900">CivicServe Admin</span>
          </Link>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm font-semibold text-gray-900">{adminName}</p>
              <p className="text-xs text-gray-600">{department} Department</p>
            </div>
            <Button onClick={handleLogout} variant="outline" size="sm">
              Logout
            </Button>
          </div>
        </div>
      </header>

      {/* Sidebar + Content */}
      <div className="flex min-h-[calc(100vh-60px)]">
        {/* Sidebar */}
        <aside className="w-64 border-r bg-white p-6">
          <nav className="space-y-2">
            <Link href="/admin/dashboard">
              <Button 
                variant={isActive('/admin/dashboard') ? 'default' : 'ghost'} 
                className="w-full justify-start"
              >
                📊 Dashboard
              </Button>
            </Link>
            <Link href="/admin/raised-requests">
              <Button 
                variant={isActive('/admin/raised-requests') ? 'default' : 'ghost'} 
                className="w-full justify-start"
              >
                📥 Raised Requests
              </Button>
            </Link>
            <Link href="/admin/update-status">
              <Button 
                variant={isActive('/admin/update-status') ? 'default' : 'ghost'} 
                className="w-full justify-start"
              >
                ✏️ Update Status
              </Button>
            </Link>
            <Link href="/admin/allocate-work">
              <Button 
                variant={isActive('/admin/allocate-work') ? 'default' : 'ghost'} 
                className="w-full justify-start"
              >
                👥 Allocate Work
              </Button>
            </Link>
            <Link href="/admin/team">
              <Button 
                variant={isActive('/admin/team') ? 'default' : 'ghost'} 
                className="w-full justify-start"
              >
                👨‍💼 Team Members
              </Button>
            </Link>
            <Link href="/admin/profile">
              <Button 
                variant={isActive('/admin/profile') ? 'default' : 'ghost'} 
                className="w-full justify-start"
              >
                👤 Profile
              </Button>
            </Link>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
