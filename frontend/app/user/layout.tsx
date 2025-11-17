'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { createClient } from '@/lib/supabase/client';

export default function UserLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [userName, setUserName] = useState('Loading...');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          router.push('/login');
          return;
        }

        const { data: profile } = await supabase
          .from('profiles')
          .select('full_name')
          .eq('id', user.id)
          .single();

        if (profile?.full_name) {
          setUserName(profile.full_name);
        }
        setLoading(false);
      } catch (error) {
        console.error('Error loading user:', error);
        setLoading(false);
      }
    };

    loadUser();
  }, [router]);

  const handleLogout = async () => {
    try {
      const supabase = createClient();
      await supabase.auth.signOut();
      router.push('/');
    } catch (error) {
      console.error('Error logging out:', error);
    }
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
            <span className="font-bold text-gray-900">CivicServe</span>
          </Link>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-700">Welcome, {loading ? 'Loading...' : userName}</span>
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
            <Link href="/user/dashboard">
              <Button 
                variant={isActive('/user/dashboard') ? 'default' : 'ghost'} 
                className="w-full justify-start"
              >
                📊 Dashboard
              </Button>
            </Link>
            <Link href="/user/raise-request">
              <Button 
                variant={isActive('/user/raise-request') ? 'default' : 'ghost'} 
                className="w-full justify-start"
              >
                ➕ Raise Request
              </Button>
            </Link>
            <Link href="/user/review-request">
              <Button 
                variant={isActive('/user/review-request') ? 'default' : 'ghost'} 
                className="w-full justify-start"
              >
                📋 Review Requests
              </Button>
            </Link>
            <Link href="/user/close-request">
              <Button 
                variant={isActive('/user/close-request') ? 'default' : 'ghost'} 
                className="w-full justify-start"
              >
                ✅ Closed Requests
              </Button>
            </Link>
            <Link href="/user/help">
              <Button 
                variant={isActive('/user/help') ? 'default' : 'ghost'} 
                className="w-full justify-start"
              >
                🆘 Help & Support
              </Button>
            </Link>
            <Link href="/user/profile">
              <Button 
                variant={isActive('/user/profile') ? 'default' : 'ghost'} 
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
