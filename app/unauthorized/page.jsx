// // Unauthorized Access Page - Enforcing Principle of Least Privilege
'use client';
import Link from 'next/link';

export default function UnauthorizedPage() {
  return (
    <div className="flex min-h-[80vh] items-center justify-center px-4">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-xl p-8 text-center shadow-2xl">
        <div className="w-16 h-16 bg-rose-950/60 border border-rose-800 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-2xl text-rose-400 font-bold">!</span>
        </div>
        
        <h1 className="text-2xl font-bold text-white tracking-wide">Access Denied</h1>
        <p className="text-xs text-slate-400 mt-2">
          You do not have the required role privileges (RBAC) to access this enterprise module. Please contact your system administrator if you believe this is an error.
        </p>

        <div className="mt-8">
          <Link 
            href="/pos" 
            className="inline-block w-full bg-emerald-600 hover:bg-emerald-500 text-white font-medium py-2.5 rounded-lg text-xs transition-colors shadow-lg"
          >
            Return to Authorized Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}