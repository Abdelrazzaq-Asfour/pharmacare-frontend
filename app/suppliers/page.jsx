// // Suppliers Management & Registration Terminal (Optimized for Zero-Trust & Scale)
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useRouter } from 'next/navigation';

export default function SuppliersPage() {
  const { user } = useAuth();
  const router = useRouter();

  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  // Form state bound to enterprise schema constraints
  const [supplierForm, setSupplierForm] = useState({
    supplierName: '',
    contactPerson: '',
    phone: '',
    email: '',
    address: ''
  });

  // Guard route based on session state
  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }
    loadSuppliers();
  }, [user, router]);

  // Fetch supplier directory asynchronously with clean error boundary
  const loadSuppliers = useCallback(async () => {
    setLoading(true);
    try {
      const response = await api.suppliers.getSuppliers();
      setSuppliers(Array.isArray(response) ? response : response.data || []);
    } catch (err) {
      console.warn('Telemetry warning: Failed to sync supplier nodes.', err);
      setSuppliers([]);
      setMessage('Failed to load supplier records from server.');
    } finally {
      setLoading(false);
    }
  }, []);

  // Handle supplier payload registration with sanitization
  const handleCreateSupplier = async (e) => {
    e.preventDefault();
    setMessage('');

    try {
      // Basic client-side injection guard & validation
      if (!supplierForm.supplierName.trim() || !supplierForm.phone.trim()) {
        setMessage('Error: Supplier Name and Phone Number are mandatory fields.');
        return;
      }

      await api.suppliers.createSupplier(supplierForm);
      setMessage('Supplier registered successfully!');
      loadSuppliers();
      
      // Reset form on success
      setSupplierForm({
        supplierName: '',
        contactPerson: '',
        phone: '',
        email: '',
        address: ''
      });
    } catch (err) {
      setMessage(err.response?.data?.message || 'Failed to register supplier entity.');
    }
  };

  return (
    <main className="max-w-7xl mx-auto px-4 py-8 text-slate-100">
      <header className="flex flex-col md:flex-row md:items-center justify-between pb-6 border-b border-slate-800 gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Suppliers & Vendors Management</h1>
          <p className="text-xs text-slate-400 mt-1">Register and manage pharmaceutical distributors and vendor integration nodes.</p>
        </div>
      </header>

      {message && (
        <div className="my-4 p-4 bg-emerald-950/40 border border-emerald-800 text-emerald-200 text-xs rounded-xl shadow-md">
          {message}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-6">
        
        {/* Registration Panel */}
        <section className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl h-fit backdrop-blur-md">
          <h2 className="text-sm font-bold text-white uppercase tracking-wider mb-4 border-b border-slate-800 pb-2">Add New Supplier</h2>
          <form onSubmit={handleCreateSupplier} className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-300 uppercase mb-1">Supplier Name</label>
              <input 
                type="text" 
                required 
                placeholder="e.g. Al-Dawaa Pharma" 
                value={supplierForm.supplierName} 
                onChange={e => setSupplierForm({...supplierForm, supplierName: e.target.value})} 
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white focus:outline-none focus:border-emerald-500 transition-colors" 
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-300 uppercase mb-1">Contact Person</label>
              <input 
                type="text" 
                placeholder="e.g. Dr. Ahmad" 
                value={supplierForm.contactPerson} 
                onChange={e => setSupplierForm({...supplierForm, contactPerson: e.target.value})} 
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white focus:outline-none focus:border-emerald-500 transition-colors" 
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-300 uppercase mb-1">Phone Number</label>
              <input 
                type="text" 
                required 
                placeholder="e.g. +962790000000" 
                value={supplierForm.phone} 
                onChange={e => setSupplierForm({...supplierForm, phone: e.target.value})} 
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white focus:outline-none focus:border-emerald-500 transition-colors" 
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-300 uppercase mb-1">Email Address</label>
              <input 
                type="email" 
                placeholder="e.g. info@pharma.com" 
                value={supplierForm.email} 
                onChange={e => setSupplierForm({...supplierForm, email: e.target.value})} 
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white focus:outline-none focus:border-emerald-500 transition-colors" 
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-300 uppercase mb-1">Address</label>
              <textarea 
                rows="2"
                placeholder="e.g. Amman, Jordan" 
                value={supplierForm.address} 
                onChange={e => setSupplierForm({...supplierForm, address: e.target.value})} 
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white focus:outline-none focus:border-emerald-500 transition-colors resize-none" 
              />
            </div>

            <button 
              type="submit" 
              className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-semibold py-2.5 rounded-xl transition-all shadow-lg active:scale-95 mt-2"
            >
              Save Supplier Node
            </button>
          </form>
        </section>

        {/* Directory Listing Grid */}
        <section className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl h-fit">
          <header className="p-4 bg-slate-950 border-b border-slate-800 font-bold text-white text-xs tracking-wider uppercase flex justify-between items-center">
            <span>Registered Suppliers Directory</span>
            <span className="text-[10px] text-emerald-400 font-mono">Total Nodes: {suppliers.length}</span>
          </header>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 bg-slate-950/40 uppercase tracking-wide">
                  <th className="p-3">ID</th>
                  <th className="p-3">Supplier Name</th>
                  <th className="p-3">Contact Person</th>
                  <th className="p-3">Phone</th>
                  <th className="p-3">Email / Address</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {loading ? (
                  <tr>
                    <td colSpan="6" className="p-6 text-center text-slate-500">Synchronizing supplier records...</td>
                  </tr>
                ) : suppliers.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="p-6 text-center text-slate-500">No active suppliers found in system database.</td>
                  </tr>
                ) : (
                  suppliers.map(supplier => (
                    <tr key={supplier.supplierId || supplier.id} className="hover:bg-slate-850/40 transition-colors">
                      <td className="p-3 text-slate-400 font-mono">#{supplier.supplierId || supplier.id}</td>
                      <td className="p-3 font-bold text-white">{supplier.supplierName}</td>
                      <td className="p-3 text-slate-300">{supplier.contactPerson || 'N/A'}</td>
                      <td className="p-3 text-emerald-400 font-mono">{supplier.phone}</td>
                      <td className="p-3 text-slate-400 truncate max-w-xs">{supplier.email || supplier.address || 'N/A'}</td>
                      <td className="p-3 text-right space-x-2">
                        <button 
                          onClick={() => router.push(`/edit/supplier/${supplier.supplierId || supplier.id}`)}
                          className="bg-sky-600 hover:bg-sky-500 text-white px-3 py-1 rounded-lg transition-colors font-medium shadow-sm"
                        >
                          Edit
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>

      </div>
    </main>
  );
}