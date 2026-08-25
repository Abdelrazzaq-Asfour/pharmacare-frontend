// // Dynamic Edit Page for Products and Suppliers with Backend Integration & Delete Option
'use client';
import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '../../../context/AuthContext';
import { api } from '../../../services/api';



export default function EditItemPage() {
  const { user } = useAuth();
  const router = useRouter();
  const params = useParams();
  
  const type = params?.type; // "product" أو "supplier"
  const id = params?.id;    

  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!user || !user.roles.includes('ROLE_ADMIN')) {
      router.push('/unauthorized');
      return;
    }
    fetchItemData();
  }, [user, id, type]);

  const fetchItemData = async () => {
    setLoading(true);
    try {
      const sessionData = localStorage.getItem('pharmacare_session');
      let token = sessionData ? JSON.parse(sessionData)?.token : '';
      const headers = { 'Authorization': `Bearer ${token}` };

      if (type === 'product') {
        const productsRes = await api.products.getProducts('');
        const list = Array.isArray(productsRes) ? productsRes : productsRes.data || [];
        const found = list.find(p => String(p.productId || p.id) === String(id));
        if (found) {
          setFormData({
            tradeName: found.tradeName || '',
            scientificName: found.scientificName || '',
            category: found.category || '',
            sellingPricePerBox: found.sellingPricePerBox ?? found.sellingPrice ?? '',
            minStockAlertThreshold: found.minStockAlertThreshold ?? 5
          });
        }
      } else if (type === 'supplier') {
        const suppliersRes = await api.suppliers.getSuppliers({ headers });
        const list = Array.isArray(suppliersRes) ? suppliersRes : suppliersRes.data || [];
        const found = list.find(s => String(s.supplierId) === String(id));
        if (found) {
          setFormData({
            supplierName: found.supplierName || '',
            contactPerson: found.contactPerson || '',
            phone: found.phone || '',
            email: found.email || '',
            address: found.address || ''
          });
        }
      }
    } catch (err) {
      console.warn('Failed to fetch item details.', err);
      setMessage('Failed to load item details from server.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    try {
      const sessionData = localStorage.getItem('pharmacare_session');
      let token = sessionData ? JSON.parse(sessionData)?.token : '';
      const headers = { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' };

      if (type === 'product') {
        await api.products.updateProduct(id, {
          ...formData,
          sellingPricePerBox: parseFloat(formData.sellingPricePerBox),
          minStockAlertThreshold: parseInt(formData.minStockAlertThreshold)
        }, { headers });
        setMessage('Product updated successfully!');
      } else if (type === 'supplier') {
        await api.suppliers.updateSupplier(id, formData, { headers });
        setMessage('Supplier updated successfully!');
      }

      setTimeout(() => {
        router.push(type === 'product' ? '/inventory' : '/suppliers');
      }, 1200);
    } catch (err) {
      setMessage(err.response?.data?.message || 'Failed to update item.');
    }
  };

  const handleDelete = async () => {
    if (!window.confirm(`Are you sure you want to delete this ${type}?`)) return;
    
    setMessage('');
    try {
      const sessionData = localStorage.getItem('pharmacare_session');
      let token = sessionData ? JSON.parse(sessionData)?.token : '';
      const headers = { 'Authorization': `Bearer ${token}` };

      if (type === 'product') {
        await api.products.deleteProduct(id, { headers });
        setMessage('Product deleted successfully!');
      } else if (type === 'supplier') {
        await api.suppliers.deleteSupplier(id, { headers });
        setMessage('Supplier deleted successfully!');
      }

      setTimeout(() => {
        router.push(type === 'product' ? '/inventory' : '/suppliers');
      }, 1200);
    } catch (err) {
      setMessage(err.response?.data?.message || 'Failed to delete item.');
    }
  };

  if (loading) {
    return <div className="text-center py-20 text-white text-xs">Loading item data...</div>;
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-8 shadow-2xl">
        <div className="flex justify-between items-center mb-6 pb-4 border-b border-slate-800">
          <div>
            <h1 className="text-lg font-bold text-white capitalize">Edit / Delete {type} #{id}</h1>
            <p className="text-xs text-slate-400 mt-1">Modify or remove database record securely</p>
          </div>
          <button 
            onClick={() => router.push(type === 'product' ? '/inventory' : '/suppliers')}
            className="text-xs text-slate-400 hover:text-white underline"
          >
            Back
          </button>
        </div>

        {message && (
          <div className="mb-6 p-4 bg-emerald-950/40 border border-emerald-800 text-emerald-200 text-xs rounded-lg">
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {type === 'product' && (
            <>
              <div>
                <label className="block text-slate-300 uppercase mb-1">Trade Name</label>
                <input 
                  type="text" 
                  required 
                  value={formData.tradeName || ''} 
                  onChange={e => setFormData({...formData, tradeName: e.target.value})} 
                  className="w-full bg-slate-950 border border-slate-800 rounded p-2.5 text-white" 
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-300 uppercase mb-1">Scientific Name</label>
                  <input 
                    type="text" 
                    value={formData.scientificName || ''} 
                    onChange={e => setFormData({...formData, scientificName: e.target.value})} 
                    className="w-full bg-slate-950 border border-slate-800 rounded p-2.5 text-white" 
                  />
                </div>
                <div>
                  <label className="block text-slate-300 uppercase mb-1">Category</label>
                  <input 
                    type="text" 
                    value={formData.category || ''} 
                    onChange={e => setFormData({...formData, category: e.target.value})} 
                    className="w-full bg-slate-950 border border-slate-800 rounded p-2.5 text-white" 
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-300 uppercase mb-1">Selling Price / Box ($)</label>
                  <input 
                    type="number" 
                    step="0.01" 
                    required 
                    value={formData.sellingPricePerBox || ''} 
                    onChange={e => setFormData({...formData, sellingPricePerBox: e.target.value})} 
                    className="w-full bg-slate-950 border border-slate-800 rounded p-2.5 text-white" 
                  />
                </div>
                <div>
                  <label className="block text-slate-300 uppercase mb-1">Min Threshold</label>
                  <input 
                    type="number" 
                    required 
                    value={formData.minStockAlertThreshold || ''} 
                    onChange={e => setFormData({...formData, minStockAlertThreshold: e.target.value})} 
                    className="w-full bg-slate-950 border border-slate-800 rounded p-2.5 text-white" 
                  />
                </div>
              </div>
            </>
          )}

          {type === 'supplier' && (
            <>
              <div>
                <label className="block text-slate-300 uppercase mb-1">Supplier Name</label>
                <input 
                  type="text" 
                  required 
                  value={formData.supplierName || ''} 
                  onChange={e => setFormData({...formData, supplierName: e.target.value})} 
                  className="w-full bg-slate-950 border border-slate-800 rounded p-2.5 text-white" 
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-300 uppercase mb-1">Contact Person</label>
                  <input 
                    type="text" 
                    value={formData.contactPerson || ''} 
                    onChange={e => setFormData({...formData, contactPerson: e.target.value})} 
                    className="w-full bg-slate-950 border border-slate-800 rounded p-2.5 text-white" 
                  />
                </div>
                <div>
                  <label className="block text-slate-300 uppercase mb-1">Phone</label>
                  <input 
                    type="text" 
                    required 
                    value={formData.phone || ''} 
                    onChange={e => setFormData({...formData, phone: e.target.value})} 
                    className="w-full bg-slate-950 border border-slate-800 rounded p-2.5 text-white" 
                  />
                </div>
              </div>
              <div>
                <label className="block text-slate-300 uppercase mb-1">Email</label>
                <input 
                  type="email" 
                  value={formData.email || ''} 
                  onChange={e => setFormData({...formData, email: e.target.value})} 
                  className="w-full bg-slate-950 border border-slate-800 rounded p-2.5 text-white" 
                />
              </div>
            </>
          )}

          <div className="flex gap-4 pt-4">
            <button 
              type="submit" 
              className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold py-3 rounded-lg transition-colors shadow-lg"
            >
              Save Changes
            </button>

            <button 
              type="button" 
              onClick={handleDelete}
              className="bg-rose-600 hover:bg-rose-500 text-white font-semibold px-6 py-3 rounded-lg transition-colors shadow-lg"
            >
              Delete Item
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}