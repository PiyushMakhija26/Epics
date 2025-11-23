"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function VerifyEmailPage() {
  const router = useRouter();

  useEffect(() => {
    // No email verification step: redirect users to login
    router.replace('/auth/login');
  }, [router]);

  return null;
}
