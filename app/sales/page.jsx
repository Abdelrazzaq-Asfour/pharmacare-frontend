// // Sales History & Invoices Log - Detailed Item Breakdown (Boxes Only)
'use client';
import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useRouter } from 'next/navigation';

export default function SalesHistoryPage() {
  const { user } = useAuth();
  const router = useRouter();

  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedInvoiceId, setExpandedInvoiceId] = useState(null);

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }
    loadInvoices();
  }, [user]);

  const loadInvoices = async () => {
    setLoading(true);
    try {
      const response = await api.pos.getInvoices();
      setInvoices(response || []);
    } catch (err) {
      console.warn('Failed to load sales history.', err);
      setInvoices([]);
    } finally {
      setLoading(false);
    }
  };

  const toggleExpand = (invoiceId) => {
    setExpandedInvoiceId(expandedInvoiceId === invoiceId ? null : invoiceId);
  };

  const filteredInvoices = invoices.filter(inv => 
    inv.invoiceNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    inv.paymentMethod?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-6 border-b border-slate-800 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Sales & Invoices Audit Log</h1>
          <p className="text-xs text-slate-400 mt-1">Review past transactions, payment tracking, and item-level dispensing breakdowns (Boxes View).</p>
        </div>
      </div>

      <div className="mt-6 space-y-4">
        <input 
          type="text" 
          placeholder="Search by invoice number or payment method..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-emerald-500 shadow-lg"
        />

        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-950 text-slate-400 border-b border-slate-800 uppercase">
                  <th className="p-4 font-semibold">Invoice #</th>
                  <th className="p-4 font-semibold">Payment Method</th>
                  <th className="p-4 font-semibold">Total Amount</th>
                  <th className="p-4 font-semibold">Status</th>
                  <th className="p-4 font-semibold text-right">Action / Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-slate-300">
                {loading ? (
                  <tr><td colSpan="5" className="p-6 text-center text-slate-500">Loading sales history...</td></tr>
                ) : filteredInvoices.length === 0 ? (
                  <tr><td colSpan="5" className="p-6 text-center text-slate-500">No recorded sales found.</td></tr>
                ) : (
                  filteredInvoices.map(inv => (
                    <React.Fragment key={inv.invoiceId || inv.invoiceNumber}>
                      <tr 
                        onClick={() => toggleExpand(inv.invoiceId)}
                        className="hover:bg-slate-850 transition-colors cursor-pointer"
                      >
                        <td className="p-4 font-mono text-emerald-400 font-bold">{inv.invoiceNumber}</td>
                        <td className="p-4 font-medium text-white">{inv.paymentMethod}</td>
                        <td className="p-4 font-bold text-emerald-400">${inv.totalAmount?.toFixed(2)}</td>
                        <td className="p-4">
                          <span className="px-2 py-1 rounded text-[10px] bg-emerald-950 text-emerald-400 border border-emerald-800">
                            {inv.invoiceStatus || 'COMPLETED'}
                          </span>
                        </td>
                        <td className="p-4 text-right font-mono text-slate-400">
                          <span className="text-emerald-400 underline mr-2">
                            {expandedInvoiceId === inv.invoiceId ? 'Hide Items' : 'View Items'}
                          </span>
                          {inv.createdAt || 'Just now'}
                        </td>
                      </tr>

                      {expandedInvoiceId === inv.invoiceId && (
                        <tr>
                          <td colSpan="5" className="bg-slate-950/80 p-4 border-t border-b border-slate-800">
                            <div className="max-w-3xl mx-auto space-y-2">
                              <p className="font-bold text-slate-200 text-xs uppercase tracking-wide mb-2">Dispensed Items Breakdown:</p>
                              <table className="w-full text-left bg-slate-900 rounded-lg overflow-hidden border border-slate-800">
                                <thead>
                                  <tr className="bg-slate-900 text-slate-400 text-[11px] border-b border-slate-800">
                                    <th className="p-2.5">Product Name</th>
                                    <th className="p-2.5">Batch #</th>
                                    <th className="p-2.5">Boxes Quantity</th>
                                    <th className="p-2.5">Unit Price</th>
                                    <th className="p-2.5 text-right">Total</th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-800 text-slate-300">
                                  {inv.items && inv.items.length > 0 ? (
                                    inv.items.map((item, idx) => (
                                      <tr key={idx} className="hover:bg-slate-850">
                                        <td className="p-2.5 font-medium text-white">
                                          {item.tradeName || 'Product'}
                                        </td>
                                        <td className="p-2.5 font-mono text-amber-400">
                                          #{item.batchNumber || 'N/A'}
                                        </td>
                                        <td className="p-2.5 font-bold">{item.quantityBoxes} Boxes</td>
                                        <td className="p-2.5">${item.unitPrice?.toFixed(2)}</td>
                                        <td className="p-2.5 text-right font-bold text-emerald-400">${item.totalPrice?.toFixed(2)}</td>
                                      </tr>
                                    ))
                                  ) : (
                                    <tr><td colSpan="5" className="p-3 text-center text-slate-500">No item details available for this invoice.</td></tr>
                                  )}
                                </tbody>
                              </table>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}