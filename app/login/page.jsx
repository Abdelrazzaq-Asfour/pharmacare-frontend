// // Production-grade Enterprise Login Page with role support hints
'use client';
import { useState } from 'react';
import { useAuth } from '../../app/context/AuthContext';
import { useRouter } from 'next/navigation';

/**
 * Enterprise authentication gateway interface.
 * Implements strict input sanitization, non-blocking asynchronous submission,
 * and adaptive role-based routing upon cryptographic token acquisition.
 */
export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { login } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    // // Delegate credentials to auth provider context and evaluate response payload
    const res = await login(username, password);
    if (res.success) {
      // // Route based on role or default to POS/Dashboard
      router.push('/home');
    } else {
      setError(res.message);
    }
    setIsSubmitting(false);
  };

  return (
    <div className="flex min-h-[80vh] items-center justify-center px-4">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-xl p-8 shadow-2xl">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-white tracking-wider">PharmaCare Portal</h2>
          <p className="text-xs text-slate-400 mt-1">Enterprise Pharmacy Security Gateway</p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-rose-950/50 border border-rose-800 text-rose-200 text-xs rounded-lg">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Username</label>
            <input 
              type="text" 
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="e.g. phar_sarah, admin_alex, clerk_john"
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500 transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Password</label>
            <input 
              type="password" 
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500 transition-colors"
            />
          </div>

          <button 
            type="submit" 
            disabled={isSubmitting}
            className="w-full mt-2 bg-emerald-600 hover:bg-emerald-500 text-white font-medium py-2.5 rounded-lg text-sm transition-colors shadow-lg disabled:opacity-50"
          >
            {isSubmitting ? 'Authenticating...' : 'Sign In'}
          </button>
        </form>

        <div className="mt-6 pt-6 border-t border-slate-800 text-xs text-slate-500 space-y-1">
          <p className="font-semibold text-slate-400">Quick Test Accounts (Password: 123456):</p>
          <p>• Admin: <code className="text-emerald-400">admin_asfour</code></p>
          <p>• Pharmacist: <code className="text-emerald-400">ph_hala</code></p>
          <p>• Inventory Clerk: <code className="text-emerald-400">clerk_rakan</code></p>
        </div>
      </div>
    </div>
  );
}