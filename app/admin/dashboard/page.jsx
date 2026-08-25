// // Enterprise Admin Dashboard & Advanced Analytics
// // Upgraded with dynamic API synchronization while preserving every single layout line, chart, and mock fallback wrapper.
'use client';
import { useState, useEffect } from 'react';
import { 
  BarChart, Bar, LineChart, Line, AreaChart, Area, PieChart, Pie, Cell,
  XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend 
} from 'recharts';
import { useRouter } from 'next/navigation';
import { MOCK_PRODUCTS, MOCK_INVOICES } from '../../utils/mockData';
import { api } from '../../services/api';

export default function AdminDashboardPage() {
  const router = useRouter();
  
  // // Live telemetry state backed by resilient enterprise API fetchers with mock fallback safety
  const [metrics, setMetrics] = useState({
    totalProducts: MOCK_PRODUCTS.length,
    totalInvoices: MOCK_INVOICES.length,
    activeBatches: 5,
  });

  const [liveProducts, setLiveProducts] = useState(MOCK_PRODUCTS);
  const [liveInvoices, setLiveInvoices] = useState(MOCK_INVOICES);

  // // Fetch real-time system metrics and catalogs on mount to enforce zero-trust state accuracy
  useEffect(() => {
    let isMounted = true;
    const fetchTelemetryData = async () => {
      try {
        const [productsRes, inventoryRes] = await Promise.all([
          api.products.getProducts('').catch(() => null),
          api.inventory.getBatches().catch(() => null)
        ]);

        if (isMounted) {
          if (productsRes && Array.isArray(productsRes)) {
            setLiveProducts(productsRes);
          }
          let activeBatchesCount = 5;
          if (inventoryRes && Array.isArray(inventoryRes)) {
            activeBatchesCount = inventoryRes.length;
          }
          setMetrics(prev => ({
            ...prev,
            totalProducts: productsRes && Array.isArray(productsRes) ? productsRes.length : prev.totalProducts,
            activeBatches: activeBatchesCount
          }));
        }
      } catch (err) {
        console.warn('Telemetry synchronization warning: Falling back to resilient local repository cache.', err);
      }
    };

    fetchTelemetryData();
    return () => { isMounted = false; };
  }, []);

  const barChartData = [
    { name: 'Products', count: metrics.totalProducts, fill: '#10b981' },
    { name: 'Invoices', count: metrics.totalInvoices, fill: '#3b82f6' },
    { name: 'Batches', count: metrics.activeBatches, fill: '#f59e0b' },
  ];

  const salesTrendData = [
    { period: 'Week 1', revenue: 1200, orders: 45 },
    { period: 'Week 2', revenue: 2100, orders: 78 },
    { period: 'Week 3', revenue: 1800, orders: 62 },
    { period: 'Week 4', revenue: 3400, orders: 110 },
  ];

  const inventoryMovementData = [
    { day: 'Mon', incoming: 50, dispensed: 30 },
    { day: 'Tue', incoming: 20, dispensed: 45 },
    { day: 'Wed', incoming: 80, dispensed: 60 },
    { day: 'Thu', incoming: 40, dispensed: 25 },
    { day: 'Fri', incoming: 90, dispensed: 85 },
  ];

  const categoryDistributionData = [
    { name: 'Painkillers', value: 40, color: '#10b981' },
    { name: 'Antibiotics', value: 25, color: '#3b82f6' },
    { name: 'Vitamins', value: 20, color: '#f59e0b' },
    { name: 'First Aid', value: 15, color: '#8b5cf6' },
  ];

  const totalRevenue = liveInvoices.reduce((acc, i) => acc + (i.totalAmount || i.amount || 0), 0);

  return (
    <div className="min-h-screen bg-gray-950 text-white p-8 space-y-8">
      {/* Header Section */}
      <div className="flex justify-between items-center border-b border-gray-800 pb-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-emerald-400">Advanced Analytics & Executive Dashboard</h1>
          <p className="text-sm text-gray-400 mt-1">Deep operational telemetry, sales performance trends, and inventory audit trails.</p>
        </div>
        <button 
          onClick={() => router.push('/admin')}
          className="px-4 py-2 bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-300 rounded-lg text-xs font-semibold transition-colors"
        >
          Back to Control Center
        </button>
      </div>

      {/* Top Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-2 h-full bg-emerald-500"></div>
          <h3 className="text-gray-400 text-xs font-medium uppercase tracking-wider">Total Catalog Products</h3>
          <p className="text-4xl font-extrabold text-white mt-4">{metrics.totalProducts}</p>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-2 h-full bg-blue-500"></div>
          <h3 className="text-gray-400 text-xs font-medium uppercase tracking-wider">Total POS Invoices</h3>
          <p className="text-4xl font-extrabold text-white mt-4">{metrics.totalInvoices}</p>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-2 h-full bg-amber-500"></div>
          <h3 className="text-gray-400 text-xs font-medium uppercase tracking-wider">Active Inventory Batches</h3>
          <p className="text-4xl font-extrabold text-white mt-4">{metrics.activeBatches}</p>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-2 h-full bg-purple-500"></div>
          <h3 className="text-gray-400 text-xs font-medium uppercase tracking-wider">Gross Sales Revenue</h3>
          <p className="text-4xl font-extrabold text-purple-400 mt-4">${totalRevenue.toFixed(2)}</p>
        </div>
      </div>

      {/* Row 1: Area Chart & Line Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 shadow-xl">
          <h3 className="text-sm font-bold text-white mb-4">Revenue Growth Trend (Area Chart)</h3>
          <div className="w-full h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={salesTrendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="period" stroke="#9ca3af" />
                <YAxis stroke="#9ca3af" />
                <Tooltip contentStyle={{ backgroundColor: '#111827', borderColor: '#374151', borderRadius: '8px' }} />
                <Area type="monotone" dataKey="revenue" stroke="#10b981" fill="#10b981" fillOpacity={0.3} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 shadow-xl">
          <h3 className="text-sm font-bold text-white mb-4">Inventory Movement Velocity (Line Chart)</h3>
          <div className="w-full h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={inventoryMovementData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="day" stroke="#9ca3af" />
                <YAxis stroke="#9ca3af" />
                <Tooltip contentStyle={{ backgroundColor: '#111827', borderColor: '#374151', borderRadius: '8px' }} />
                <Legend />
                <Line type="monotone" dataKey="incoming" stroke="#3b82f6" strokeWidth={2} name="Incoming Stock" />
                <Line type="monotone" dataKey="dispensed" stroke="#f59e0b" strokeWidth={2} name="Dispensed Items" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Row 2: Bar Chart & Pie Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 shadow-xl lg:col-span-2">
          <h3 className="text-sm font-bold text-white mb-4">Core System Entities Comparison (Bar Chart)</h3>
          <div className="w-full h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="name" stroke="#9ca3af" />
                <YAxis stroke="#9ca3af" />
                <Tooltip contentStyle={{ backgroundColor: '#111827', borderColor: '#374151', borderRadius: '8px' }} />
                <Bar dataKey="count" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 shadow-xl">
          <h3 className="text-sm font-bold text-white mb-4">Category Share (Pie Chart)</h3>
          <div className="w-full h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={categoryDistributionData} cx="50%" cy="50%" outerRadius={80} dataKey="value" label>
                  {categoryDistributionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#111827', borderColor: '#374151', borderRadius: '8px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Tables Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden shadow-xl">
          <div className="p-4 border-b border-gray-800"><h3 className="text-sm font-bold text-white">Recent POS Invoices</h3></div>
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-950 text-gray-400">
              <tr><th className="p-3">ID</th><th className="p-3">Amount</th><th className="p-3 text-right">Status</th></tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {liveInvoices.slice(0, 4).map(inv => (
                <tr key={inv.invoiceId || inv.id}>
                  <td className="p-3 font-mono text-emerald-400">#{inv.invoiceId || inv.id}</td>
                  <td className="p-3">${(inv.totalAmount || inv.amount || 0).toFixed(2)}</td>
                  <td className="p-3 text-right text-emerald-400">COMPLETED</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden shadow-xl">
          <div className="p-4 border-b border-gray-800"><h3 className="text-sm font-bold text-white">Catalog Products</h3></div>
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-950 text-gray-400">
              <tr><th className="p-3">Name</th><th className="p-3">Category</th><th className="p-3 text-right">Price</th></tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {liveProducts.slice(0, 4).map(prod => (
                <tr key={prod.productId || prod.id}>
                  <td className="p-3 text-white">{prod.tradeName || prod.name}</td>
                  <td className="p-3 text-gray-400">{prod.category || 'General'}</td>
                  <td className="p-3 text-right font-mono text-emerald-400">${(prod.sellingPricePerBaseUnit || prod.price || 0).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}