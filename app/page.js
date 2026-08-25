// // Root Landing Page - Automatically routes users based on active session status
'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from './context/AuthContext';

export default function Home() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (user) {
        // // If authenticated, redirect directly to POS terminal or default dashboard
        router.push('/pos');
      } else {
        // // If unauthenticated, route securely to login gateway
        router.push('/login');
      }
    }
  }, [user, loading, router]);

  return (
    <div className="flex min-h-[80vh] items-center justify-center">
      <div className="text-center space-y-3">
        <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
        <p className="text-xs text-slate-400">Verifying enterprise security session...</p>
      </div>
    </div>
  );
}