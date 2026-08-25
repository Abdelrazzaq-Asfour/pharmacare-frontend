// // Enterprise Navbar - Refactored for optimal layout, zero-trust RBAC isolation, and pristine UI UX.
'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';

/**
 * Enterprise Navbar component enforcing strict Zero-Trust role-based visibility 
 * for navigational paths and clean, professional session telemetry.
 */
export default function Navbar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  // Helper utility for role validation
  const hasRole = (role) => user && user.roles && user.roles.includes(role);

  return (
    <nav className="bg-slate-900 text-white shadow-lg border-b border-slate-800/80 sticky top-0 z-50 backdrop-blur-md bg-slate-900/95">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Brand Identity & System Telemetry Tag */}
          <div className="flex items-center space-x-3">
            <Link 
              href="/home" 
              className="text-xl font-black text-emerald-400 tracking-wider hover:text-emerald-300 transition-colors"
            >
              PharmaCare
            </Link>
            <span className="text-[9px] bg-slate-800/80 text-slate-400 px-2 py-0.5 rounded font-mono uppercase tracking-widest border border-slate-700/50">
              Enterprise POS
            </span>
          </div>

          {/* Role-Protected Navigation Pipeline */}
          {user && (
            <div className="hidden lg:flex items-center space-x-1.5 overflow-x-auto py-2">
              
              {/* POS & Sales: Pharmacist or Admin */}
              {(hasRole('ROLE_PHARMACIST') || hasRole('ROLE_ADMIN')) && (
                <>
                  <Link 
                    href="/pos" 
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                      pathname === '/pos' 
                        ? 'bg-emerald-600 text-white shadow-md shadow-emerald-900/30' 
                        : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                    }`}
                  >
                    POS Terminal
                  </Link>

                  <Link 
                    href="/sales" 
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                      pathname === '/sales' 
                        ? 'bg-emerald-600 text-white shadow-md shadow-emerald-900/30' 
                        : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                    }`}
                  >
                    Sales History
                  </Link>
                </>
              )}

              {/* Inventory: Inventory Clerk or Admin */}
              {(hasRole('ROLE_INVENTORY_CLERK') || hasRole('ROLE_ADMIN')) && (
                <Link 
                  href="/inventory" 
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    pathname === '/inventory' 
                      ? 'bg-emerald-600 text-white shadow-md shadow-emerald-900/30' 
                      : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  Inventory & Batches
                </Link>
              )}

              {/* Admin Oversight & Management Actions */}
              {hasRole('ROLE_ADMIN') && (
                <div className="flex items-center space-x-1.5 pl-2 ml-2 border-l border-slate-800">
                  <Link 
                    href="/admin" 
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                      pathname === '/admin' 
                        ? 'bg-emerald-600 text-white shadow-md shadow-emerald-900/30' 
                        : 'text-emerald-400 hover:bg-emerald-950/40 hover:text-white border border-emerald-800/40'
                    }`}
                  >
                    Admin Hub
                  </Link>

                  <Link 
                    href="/suppliers" 
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                      pathname === '/suppliers' 
                        ? 'bg-emerald-600 text-white shadow-md shadow-emerald-900/30' 
                        : 'text-slate-300 hover:bg-slate-800 hover:text-white border border-slate-700/60'
                    }`}
                  >
                    Suppliers
                  </Link>
                </div>
              )}
            </div>
          )}

          {/* Active User Metadata & Session Termination Control */}
          <div className="flex items-center space-x-3">
            {user ? (
              <div className="flex items-center space-x-3 bg-slate-950/60 px-3 py-1.5 rounded-xl border border-slate-800/80">
                <div className="text-right hidden sm:block">
                  <p className="text-xs font-semibold text-slate-200 leading-tight">
                    {user.firstName} {user.lastName}
                  </p>
                  <p className="text-[9px] text-emerald-400 font-mono tracking-tight uppercase">
                    {user.roles.join(', ').replace('ROLE_', '')}
                  </p>
                </div>
                <button 
                  onClick={logout}
                  className="bg-rose-600/90 hover:bg-rose-600 text-white text-xs px-3 py-1.5 rounded-lg font-medium transition-all shadow-sm active:scale-95"
                  aria-label="Terminate Session"
                >
                  Logout
                </button>
              </div>
            ) : (
              <Link 
                href="/login" 
                className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs px-4 py-2 rounded-xl font-semibold transition-all shadow-md shadow-emerald-900/30"
              >
                Sign In
              </Link>
            )}
          </div>

        </div>
      </div>
    </nav>
  );
}