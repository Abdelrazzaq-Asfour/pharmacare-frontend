// // Enterprise Inventory & Product Management Dashboard (Optimized for High Concurrency & Zero-Trust)
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { api } from '../services/api';
import { MOCK_SUPPLIERS } from '../utils/mockData';
import { useAuth } from '../context/AuthContext';
import { useRouter } from 'next/navigation';

export default function InventoryPage() {
  const { user } = useAuth();
  const router = useRouter();

  const [batches, setBatches] = useState([]);
  const [products, setProducts] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('batches');

  const [intakeForm, setIntakeForm] = useState({
    tradeName: '',
    scientificName: '',
    category: '',
    sellingPricePerBox: '',
    minStockAlertThreshold: '5',
    supplierId: '',
    batchNumber: '',
    initialBoxesQuantity: '',
    costPricePerBox: '',
    expirationDate: ''
  });

  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Form states for Stock Adjustment
  const [adjBatchId, setAdjBatchId] = useState('');
  const [adjQty, setAdjQty] = useState('');
  const [adjReason, setAdjReason] = useState('DAMAGED');
  const [adjNotes, setAdjNotes] = useState('');

  // Enforce zero-trust RBAC boundary checks
  useEffect(() => {
    if (!user || (!user.roles.includes('ROLE_INVENTORY_CLERK') && !user.roles.includes('ROLE_ADMIN'))) {
      router.push('/unauthorized');
      return;
    }
    loadData();
  }, [user, router]);

  // Asynchronous parallel data synchronization
  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [batchesRes, productsRes] = await Promise.all([
        api.inventory.getBatches().catch(() => []),
        api.products.getProducts('').catch(() => [])
      ]);
      const fetchedBatches = Array.isArray(batchesRes) ? batchesRes : batchesRes.data || [];
      const fetchedProducts = Array.isArray(productsRes) ? productsRes : productsRes.data || [];
      
      setBatches(fetchedBatches);
      setProducts(fetchedProducts);

      // Local low stock calculation to ensure UI accurately reflects inventory thresholds
      const calculatedAlerts = fetchedProducts.map(p => {
        const prodId = p.productId || p.id;
        const productBatches = fetchedBatches.filter(b => b.productId === prodId || b.productName === p.tradeName);
        const totalStock = productBatches.reduce((sum, b) => sum + (b.currentBoxesQuantity || 0), 0);
        const threshold = p.minStockAlertThreshold ?? 5;

        if (totalStock <= threshold) {
          return {
            productName: p.tradeName,
            minStockAlertThreshold: threshold,
            currentStock: totalStock
          };
        }
        return null;
      }).filter(Boolean);

      setAlerts(calculatedAlerts);
    } catch (err) {
      console.warn('Telemetry warning: Failed to sync inventory nodes.', err);
      setBatches([]);
      setProducts([]);
      setAlerts([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Handle smart autocomplete matching for product intake
  const handleTradeNameChange = (e) => {
    const enteredName = e.target.value;
    setIntakeForm(prev => ({ ...prev, tradeName: enteredName }));

    const existingProduct = products.find(p => p.tradeName.toLowerCase() === enteredName.toLowerCase());
    if (existingProduct) {
      setIntakeForm(prev => ({
        ...prev,
        scientificName: existingProduct.scientificName || '',
        category: existingProduct.category || '',
        sellingPricePerBox: existingProduct.sellingPricePerBox ?? existingProduct.sellingPrice ?? ''
      }));
    }
  };

  // Execute unified intake transaction with token extraction
  const handleUnifiedIntakeSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setSubmitting(true);

    try {
      const sessionData = localStorage.getItem('pharmacare_session');
      let token = '';
      if (sessionData) {
        const parsed = JSON.parse(sessionData);
        token = parsed?.token || '';
      }

      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      };

      let targetProduct = products.find(p => p.tradeName.toLowerCase() === intakeForm.tradeName.trim().toLowerCase());
      let productId = targetProduct?.productId || targetProduct?.id;

      if (!productId) {
        const productPayload = {
          tradeName: intakeForm.tradeName,
          scientificName: intakeForm.scientificName,
          category: intakeForm.category,
          sellingPricePerBox: parseFloat(intakeForm.sellingPricePerBox),
          minStockAlertThreshold: parseInt(intakeForm.minStockAlertThreshold)
        };

        const createdProduct = await api.products.createProduct(productPayload, { headers });
        productId = createdProduct?.productId || createdProduct?.id;
      }

      if (!productId) {
        throw new Error('Failed to resolve or register product ID entity.');
      }

      const intakePayload = {
        productId: productId,
        supplierId: intakeForm.supplierId,
        batchNumber: intakeForm.batchNumber,
        initialBoxesQuantity: parseInt(intakeForm.initialBoxesQuantity),
        costPricePerBox: parseFloat(intakeForm.costPricePerBox),
        expirationDate: intakeForm.expirationDate
      };

      await api.inventory.commitStockIntake(intakePayload, { headers });

      setMessage('Successfully processed product intake and recorded shipment boxes.');
      loadData();
      setActiveTab('batches');
      
      setIntakeForm({
        tradeName: '',
        scientificName: '',
        category: '',
        sellingPricePerBox: '',
        minStockAlertThreshold: '5',
        supplierId: '',
        batchNumber: '',
        initialBoxesQuantity: '',
        costPricePerBox: '',
        expirationDate: ''
      });
    } catch (err) {
      console.error('Unified intake transaction error:', err);
      setMessage(err.response?.data?.message || err.message || 'Failed to process stock intake.');
    } finally {
      setSubmitting(false);
    }
  };

  // Execute stock adjustment audit log
  const handleAdjustmentSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    try {
      const res = await api.inventory.recordAdjustment({
        batchId: adjBatchId,
        userId: user?.userId || 1,
        type: adjReason,
        qtyChanged: -Math.abs(parseInt(adjQty)),
        reason: `${adjReason}: ${adjNotes}`
      });
      setMessage(res?.message || 'Stock adjustment recorded successfully.');
      loadData();
      setActiveTab('batches');
      setAdjBatchId('');
      setAdjQty('');
      setAdjNotes('');
    } catch (err) {
      setMessage(err.message || 'Failed to record stock adjustment audit.');
    }
  };

  return (
    <main className="max-w-7xl mx-auto px-4 py-8 text-slate-100">
      <header className="flex flex-col md:flex-row md:items-center justify-between pb-6 border-b border-slate-800 gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Inventory & Products Management</h1>
          <p className="text-xs text-slate-400 mt-1">Manage warehouse stock directly in full boxes and packages.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button 
            onClick={() => setActiveTab('batches')}
            className={`px-3 py-2 rounded-xl text-xs font-semibold transition-all ${activeTab === 'batches' ? 'bg-emerald-600 text-white shadow-md shadow-emerald-900/30' : 'bg-slate-900 text-slate-300 border border-slate-800 hover:bg-slate-800'}`}
          >
            Active Batches
          </button>
          <button 
            onClick={() => setActiveTab('products')}
            className={`px-3 py-2 rounded-xl text-xs font-semibold transition-all ${activeTab === 'products' ? 'bg-emerald-600 text-white shadow-md shadow-emerald-900/30' : 'bg-slate-900 text-slate-300 border border-slate-800 hover:bg-slate-800'}`}
          >
            Products Catalog
          </button>
          <button 
            onClick={() => setActiveTab('alerts')}
            className={`px-3 py-2 rounded-xl text-xs font-semibold transition-all relative ${activeTab === 'alerts' ? 'bg-amber-600 text-white shadow-md shadow-amber-900/30' : 'bg-slate-900 text-slate-300 border border-slate-800 hover:bg-slate-800'}`}
          >
            Low Stock Alerts
            {alerts.length > 0 && (
              <span className="ml-1.5 px-1.5 py-0.5 bg-rose-500 text-white rounded-full text-[9px] font-mono">
                {alerts.length}
              </span>
            )}
          </button>
          <button 
            onClick={() => setActiveTab('intake')}
            className={`px-3 py-2 rounded-xl text-xs font-semibold transition-all ${activeTab === 'intake' ? 'bg-emerald-600 text-white shadow-md shadow-emerald-900/30' : 'bg-slate-900 text-slate-300 border border-slate-800 hover:bg-slate-800'}`}
          >
            + Add Product & Stock
          </button>
          <button 
            onClick={() => setActiveTab('damage')}
            className={`px-3 py-2 rounded-xl text-xs font-semibold transition-all ${activeTab === 'damage' ? 'bg-rose-600 text-white shadow-md shadow-rose-900/30' : 'bg-slate-900 text-slate-300 border border-slate-800 hover:bg-slate-800'}`}
          >
            Log Damage / Expiry
          </button>
        </div>
      </header>

      {message && (
        <div className="my-4 p-4 bg-emerald-950/40 border border-emerald-800 text-emerald-200 text-xs rounded-xl shadow-md">
          {message}
        </div>
      )}

      {/* TAB 1: ACTIVE BATCHES */}
      {activeTab === 'batches' && (
        <section className="mt-6 bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl backdrop-blur-md">
          <header className="p-4 bg-slate-950 border-b border-slate-800 font-bold text-white text-xs tracking-wider uppercase">
            Active Warehouse Batches (Boxes View)
          </header>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-950/50 text-slate-400 border-b border-slate-800 uppercase tracking-wide">
                  <th className="p-4 font-semibold">Batch #</th>
                  <th className="p-4 font-semibold">Product Name</th>
                  <th className="p-4 font-semibold">Supplier</th>
                  <th className="p-4 font-semibold">Boxes Available</th>
                  <th className="p-4 font-semibold">Cost / Box</th>
                  <th className="p-4 font-semibold">Expiration Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                {loading ? (
                  <tr><td colSpan="6" className="p-6 text-center text-slate-500">Loading batch records...</td></tr>
                ) : batches.length === 0 ? (
                  <tr><td colSpan="6" className="p-6 text-center text-slate-500">No active batches found in database.</td></tr>
                ) : (
                  batches.map(b => (
                    <tr key={b.batchId} className="hover:bg-slate-850/40 transition-colors">
                      <td className="p-4 font-mono text-emerald-400">#{b.batchNumber || b.batchId}</td>
                      <td className="p-4 font-medium text-white">{b.productName || 'N/A'}</td>
                      <td className="p-4 text-slate-400">{b.supplier || 'N/A'}</td>
                      <td className="p-4 font-bold text-emerald-300">{b.currentBoxesQuantity} Boxes</td>
                      <td className="p-4 font-mono text-emerald-400">${b.costPerBox != null ? b.costPerBox.toFixed(2) : '0.00'}</td>
                      <td className="p-4 font-mono text-amber-400">{b.expirationDate || 'N/A'}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* TAB 2: REGISTERED PRODUCTS CATALOG */}
      {activeTab === 'products' && (
        <section className="mt-6 bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl backdrop-blur-md">
          <header className="p-4 bg-slate-950 border-b border-slate-800 font-bold text-white text-xs tracking-wider uppercase">
            Registered Products Database Master Catalog
          </header>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-950/50 text-slate-400 border-b border-slate-800 uppercase tracking-wide">
                  <th className="p-4 font-semibold">ID</th>
                  <th className="p-4 font-semibold">Trade Name</th>
                  <th className="p-4 font-semibold">Scientific Name</th>
                  <th className="p-4 font-semibold">Category</th>
                  <th className="p-4 font-semibold">Selling Price</th>
                  <th className="p-4 font-semibold">Min Threshold</th>
                  <th className="p-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                {products.length === 0 ? (
                  <tr><td colSpan="7" className="p-6 text-center text-slate-500">No products found in database.</td></tr>
                ) : (
                  products.map(p => {
                    const price = p.sellingPricePerBox ?? p.sellingPrice ?? 0.00;
                    const prodId = p.productId || p.id;
                    return (
                      <tr key={prodId} className="hover:bg-slate-850/40 transition-colors">
                        <td className="p-4 font-mono text-slate-400">#{prodId}</td>
                        <td className="p-4 font-bold text-white">{p.tradeName}</td>
                        <td className="p-4 text-slate-300">{p.scientificName || 'N/A'}</td>
                        <td className="p-4 text-emerald-400">{p.category || 'General'}</td>
                        <td className="p-4 font-mono font-bold text-emerald-400">${price.toFixed(2)}</td>
                        <td className="p-4 font-mono text-amber-400">{p.minStockAlertThreshold ?? 5}</td>
                        <td className="p-4 text-right space-x-2">
                       {user?.roles?.includes('ROLE_ADMIN') && (
  <button 
    onClick={() => router.push(`/edit/product/${prodId}`)}
    className="bg-sky-600 hover:bg-sky-500 text-white px-3 py-1 rounded-lg transition-colors font-medium shadow-sm"
  >
    Edit
  </button>
)}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* TAB 3: LOW STOCK ALERTS */}
      {activeTab === 'alerts' && (
        <section className="mt-6 bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl p-6 backdrop-blur-md">
          <h2 className="text-sm font-bold text-white uppercase tracking-wider mb-4 border-b border-slate-800 pb-2">Low Stock Warning Monitor</h2>
          {alerts.length === 0 ? (
            <p className="text-xs text-slate-500 text-center py-6">All products are currently above minimum safety thresholds.</p>
          ) : (
            <div className="space-y-3">
              {alerts.map((alert, idx) => (
                <div key={idx} className="flex items-center justify-between p-4 bg-rose-950/20 border border-rose-900/50 rounded-xl">
                  <div>
                    <p className="font-bold text-white text-sm">{alert.productName}</p>
                    <p className="text-xs text-slate-400 mt-0.5">Alert Level: Minimum Threshold is {alert.minStockAlertThreshold} boxes.</p>
                  </div>
                  <div className="text-right">
                    <span className="px-3 py-1 bg-rose-900 text-rose-200 rounded-full text-xs font-bold font-mono">
                      Current Qty: {alert.currentStock} Boxes
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      )}

      {/* TAB 4: UNIFIED ADD PRODUCT & STOCK INTAKE WITH SMART DATALIST */}
      {activeTab === 'intake' && (
        <section className="mt-6 max-w-3xl bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl backdrop-blur-md">
          <h2 className="text-sm font-bold text-white uppercase tracking-wider mb-1">Register New Product & Initial Stock Shipment</h2>
          <p className="text-xs text-slate-400 mb-6">Type or select a product name with autocomplete, then fill in shipment details.</p>
          
          <form onSubmit={handleUnifiedIntakeSubmit} className="space-y-4 text-xs">
            <div className="p-4 bg-slate-950/60 rounded-xl border border-slate-800 space-y-4">
              <p className="font-bold text-emerald-400 uppercase text-[11px]">1. Product Information</p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-300 uppercase mb-1">Trade Name</label>
                  <input 
                    type="text" 
                    required 
                    list="products-list"
                    placeholder="e.g. Panadol Extra" 
                    value={intakeForm.tradeName} 
                    onChange={handleTradeNameChange} 
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white focus:outline-none focus:border-emerald-500 transition-colors" 
                  />
                  <datalist id="products-list">
                    {products.map(p => (
                      <option key={p.productId} value={p.tradeName} />
                    ))}
                  </datalist>
                </div>
                <div>
                  <label className="block font-semibold text-slate-300 uppercase mb-1">Scientific Name</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Paracetamol + Caffeine" 
                    value={intakeForm.scientificName} 
                    onChange={e => setIntakeForm({...intakeForm, scientificName: e.target.value})} 
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white focus:outline-none focus:border-emerald-500 transition-colors" 
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block font-semibold text-slate-300 uppercase mb-1">Category</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Analgesics" 
                    value={intakeForm.category} 
                    onChange={e => setIntakeForm({...intakeForm, category: e.target.value})} 
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white focus:outline-none focus:border-emerald-500 transition-colors" 
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-300 uppercase mb-1">Selling Price / Box ($)</label>
                  <input 
                    type="number" 
                    step="0.01" 
                    min="0"
                    required 
                    placeholder="3.50" 
                    value={intakeForm.sellingPricePerBox} 
                    onChange={e => setIntakeForm({...intakeForm, sellingPricePerBox: e.target.value})} 
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white focus:outline-none focus:border-emerald-500 transition-colors" 
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-300 uppercase mb-1">Min Threshold</label>
                  <input 
                    type="number" 
                    min="1"
                    required 
                    value={intakeForm.minStockAlertThreshold} 
                    onChange={e => setIntakeForm({...intakeForm, minStockAlertThreshold: e.target.value})} 
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white focus:outline-none focus:border-emerald-500 transition-colors" 
                  />
                </div>
              </div>
            </div>

            <div className="p-4 bg-slate-950/60 rounded-xl border border-slate-800 space-y-4">
              <p className="font-bold text-emerald-400 uppercase text-[11px]">2. Initial Stock & Batch Details</p>

              <div>
                <label className="block font-semibold text-slate-300 uppercase mb-1">Select Supplier</label>
                <select 
                  required
                  value={intakeForm.supplierId}
                  onChange={e => setIntakeForm({...intakeForm, supplierId: e.target.value})}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white focus:outline-none focus:border-emerald-500 transition-colors"
                >
                  <option value="">-- Choose Supplier --</option>
                  {MOCK_SUPPLIERS.map(s => (
                    <option key={s.supplierId} value={s.supplierId}>{s.supplierName}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-300 uppercase mb-1">Batch Number</label>
                  <input 
                    type="text" 
                    required 
                    placeholder="e.g. BATCH-001" 
                    value={intakeForm.batchNumber} 
                    onChange={e => setIntakeForm({...intakeForm, batchNumber: e.target.value})} 
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white focus:outline-none focus:border-emerald-500 transition-colors" 
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-300 uppercase mb-1">Number of Boxes</label>
                  <input 
                    type="number" 
                    min="1"
                    required 
                    placeholder="e.g. 20" 
                    value={intakeForm.initialBoxesQuantity} 
                    onChange={e => setIntakeForm({...intakeForm, initialBoxesQuantity: e.target.value})} 
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white focus:outline-none focus:border-emerald-500 transition-colors" 
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-300 uppercase mb-1">Cost Price per Box ($)</label>
                  <input 
                    type="number" 
                    step="0.01" 
                    min="0"
                    required 
                    placeholder="2.00" 
                    value={intakeForm.costPricePerBox} 
                    onChange={e => setIntakeForm({...intakeForm, costPricePerBox: e.target.value})} 
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white focus:outline-none focus:border-emerald-500 transition-colors" 
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-300 uppercase mb-1">Expiration Date</label>
                  <input 
                    type="date" 
                    required 
                    value={intakeForm.expirationDate} 
                    onChange={e => setIntakeForm({...intakeForm, expirationDate: e.target.value})} 
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white focus:outline-none focus:border-emerald-500 transition-colors" 
                  />
                </div>
              </div>
            </div>

            <button 
              type="submit" 
              disabled={submitting}
              className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-semibold py-3 rounded-xl transition-all shadow-lg active:scale-95 text-xs tracking-wider uppercase mt-4"
            >
              {submitting ? 'Processing Unified Intake...' : 'Save Product & Commit Shipment Boxes'}
            </button>
          </form>
        </section>
      )}

      {/* TAB 5: DAMAGE / EXPIRED / WASTE LOG */}
      {activeTab === 'damage' && (
        <section className="mt-6 max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl backdrop-blur-md">
          <h2 className="text-sm font-bold text-white uppercase tracking-wider mb-4 border-b border-slate-800 pb-2">Log Damaged or Expired Boxes</h2>
          <form onSubmit={handleAdjustmentSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-300 uppercase mb-1">Select Batch</label>
              <select 
                required
                value={adjBatchId}
                onChange={e => setAdjBatchId(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white focus:outline-none focus:border-emerald-500 transition-colors"
              >
                <option value="">-- Choose Batch --</option>
                {batches.map(b => (
                  <option key={b.batchId} value={b.batchId}>Batch #{b.batchNumber} ({b.productName}) - Available: {b.currentBoxesQuantity} Boxes</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-slate-300 uppercase mb-1">Adjustment Type</label>
                <select 
                  value={adjReason}
                  onChange={e => setAdjReason(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white focus:outline-none focus:border-emerald-500 transition-colors"
                >
                  <option value="DAMAGED">DAMAGED</option>
                  <option value="EXPIRED">EXPIRED</option>
                  <option value="CORRECTION">CORRECTION</option>
                </select>
              </div>
              <div>
                <label className="block font-semibold text-slate-300 uppercase mb-1">Boxes to Remove</label>
                <input 
                  type="number" 
                  min="1"
                  required
                  placeholder="e.g. 2"
                  value={adjQty}
                  onChange={e => setAdjQty(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white focus:outline-none focus:border-emerald-500 transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-300 uppercase mb-1">Reason / Notes</label>
              <input 
                type="text" 
                required
                placeholder="e.g. Damaged boxes during transit"
                value={adjNotes}
                onChange={e => setAdjNotes(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white focus:outline-none focus:border-emerald-500 transition-colors"
              />
            </div>

            <button 
              type="submit"
              className="w-full bg-rose-600 hover:bg-rose-500 text-white font-semibold py-2.5 rounded-xl transition-all shadow-lg active:scale-95 mt-4"
            >
              Remove Boxes & Record Audit
            </button>
          </form>
        </section>
      )}
    </main>
  );
}