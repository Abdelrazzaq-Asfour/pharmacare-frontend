// // Enterprise Footer - Production footer with real-world pharmacy metadata
'use client';

import React from 'react';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-slate-900 text-slate-400 border-t border-slate-800 py-6 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
        <p className="text-xs">
          &copy; {currentYear} <span className="text-emerald-400 font-semibold">PharmaCare Enterprise</span>. Licensed to Zarqa Central Hub.
        </p>
        <div className="flex items-center space-x-6 text-xs">
          <span className="font-mono text-[11px] text-slate-400">
             Jordan
          </span>
          <span className="font-mono text-[11px] text-slate-400">
            Support: admin@pharmacare.com
          </span>
        </div>
      </div>
    </footer>
  );
}