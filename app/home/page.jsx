// // PharmaCare General Home Page - Public Pharmacy Information
'use client';
import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="max-w-5xl mx-auto px-4 py-16 text-white">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 md:p-12 shadow-2xl">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center pb-8 border-b border-slate-800 gap-4">
          <div>
            {/* <span className="text-[10px] bg-emerald-950 text-emerald-400 border border-emerald-800 px-2.5 py-1 rounded font-mono uppercase tracking-wider">
              PharmaCare Enterprise POS
            </span> */}
            <h1 className="text-3xl md:text-4xl font-extrabold text-white mt-3">
              PharmaCare Pharmacy Management Portal
            </h1>
            <p className="text-slate-400 text-xs md:text-sm mt-1">
              Comprehensive pharmacy operations, prescription dispensing, and smart inventory tracking.
            </p>
          </div>
          {/* <Link 
            href="/login" 
            className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold px-6 py-3 rounded-xl transition-colors shadow-lg"
          >
            Sign In to Portal
          </Link> */}
        </div>

        {/* Pharmacy Info Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
          <div className="bg-slate-950 border border-slate-800/80 p-6 rounded-xl shadow-inner">
            <h3 className="text-xs font-semibold text-emerald-400 uppercase tracking-wide">Branch Location</h3>
            <p className="text-white text-sm font-medium mt-2">Zarqa Central Hub, Jordan</p>
            <p className="text-slate-500 text-[11px] mt-1">Main operational branch & dispensary</p>
          </div>

          <div className="bg-slate-950 border border-slate-800/80 p-6 rounded-xl shadow-inner">
            <h3 className="text-xs font-semibold text-emerald-400 uppercase tracking-wide">Pharmacy Services</h3>
            <p className="text-white text-sm font-medium mt-2">Prescriptions & POS</p>
            <p className="text-slate-500 text-[11px] mt-1">Automated sales, billing, and medicine batches</p>
          </div>

          <div className="bg-slate-950 border border-slate-800/80 p-6 rounded-xl shadow-inner">
            <h3 className="text-xs font-semibold text-emerald-400 uppercase tracking-wide">Operational Status</h3>
            <p className="text-emerald-400 text-sm font-medium mt-2">● Fully Operational</p>
            <p className="text-slate-500 text-[11px] mt-1">Inventory and patient services active</p>
          </div>
        </div>

        {/* Footer Note */}
        <div className="mt-10 pt-6 border-t border-slate-800/80 text-center text-slate-500 text-xs">
          PharmaCare Pharmacy Management System • All rights reserved © 2026
        </div>

      </div>
    </div>
  );
}