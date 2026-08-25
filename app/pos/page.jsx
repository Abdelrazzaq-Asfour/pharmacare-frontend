// // Pharmacist POS Terminal - Point of Sale, FIFO Dispensing, and Cart Management (Live Backend Integration)
'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useRouter } from 'next/navigation';
import { api } from '../services/api';

/**
 * Enterprise Point of Sale (POS) terminal optimized for rapid checkout operations,
 * strict inventory synchronization, and resilient invoice payload commitment from real backend data.
 */
export default function PosPage() {
  const { user } = useAuth();
  const router = useRouter();

  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('CASH');
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  // Enforce Role-Based Access Control on client mount & load real products from backend
  useEffect(() => {
    if (!user || (!user.roles.includes('ROLE_PHARMACIST') && !user.roles.includes('ROLE_ADMIN'))) {
      router.push('/unauthorized');
      return;
    }
    loadLiveProducts();
  }, [user]);

  // Fetch real products catalog from the backend API gateway
  const loadLiveProducts = async () => {
    setLoading(true);
    try {
      const response = await api.products.getProducts('');
      setProducts(Array.isArray(response) ? response : response.data || []);
    } catch (err) {
      console.warn('Failed to load products from backend database.', err);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  // Filter products based on live search term
  const filteredProducts = products.filter(p => 
    (p.tradeName && p.tradeName.toLowerCase().includes(searchTerm.toLowerCase())) || 
    (p.scientificName && p.scientificName.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const addToCart = (product) => {
    const unitPrice = product.sellingPricePerBox ?? product.sellingPrice ?? 0.00;
    const existing = cart.find(item => item.productId === product.productId);
    if (existing) {
      setCart(cart.map(item => item.productId === product.productId ? { ...item, qty: item.qty + 1 } : item));
    } else {
      setCart([...cart, { ...product, sellingPricePerBox: unitPrice, qty: 1 }]);
    }
  };

  const updateQuantity = (productId, qty) => {
    if (qty <= 0) {
      setCart(cart.filter(item => item.productId !== productId));
    } else {
      setCart(cart.map(item => item.productId === productId ? { ...item, qty } : item));
    }
  };

  const calculateTotal = () => {
    return cart.reduce((acc, item) => {
      const price = item.sellingPricePerBox ?? item.sellingPrice ?? 0.00;
      return acc + (price * item.qty);
    }, 0).toFixed(2);
  };

  // Handle secure checkout transaction and transmit live invoice payload to API gateway
 // // Handle secure checkout transaction and transmit live invoice payload to API gateway
// // Handle secure checkout transaction and transmit live invoice payload to API gateway
  const handleCheckout = async () => {
    if (cart.length === 0) return;

    const invoicePayload = {
      pharmacistUserId: user?.userId || user?.id || 1,
      paymentMethod,
      totalAmount: parseFloat(calculateTotal()),
      items: cart.map(item => ({
        productId: item.productId,
        quantityBoxes: item.qty,
        quantityBaseUnits: item.qty, 
        unitPrice: item.sellingPricePerBox ?? item.sellingPrice ?? 0.00
      }))
    };

    console.log("--- OUTGOING INVOICE PAYLOAD ---", invoicePayload);

    try {
      const sessionData = localStorage.getItem('pharmacare_session');
      let token = '';
      if (sessionData) {
        const parsed = JSON.parse(sessionData);
        token = parsed?.token || '';
      }

      const res = await api.pos.createInvoice(invoicePayload, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      setMessage(res?.message || `Invoice processed successfully! Total: $${invoicePayload.totalAmount}`);
      setCart([]);
    } catch (apiErr) {
      console.warn('API transport warning: Failed to commit invoice to backend.', apiErr);
      setMessage(apiErr.response?.data?.message || 'Failed to process invoice through server.');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-6 border-b border-slate-800 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Point of Sale (POS) Terminal</h1>
          <p className="text-xs text-slate-400 mt-1">Live Backend Dispensing & FIFO Batch Deduction (Boxes Only)</p>
        </div>
      </div>

      {message && (
        <div className="my-4 p-4 bg-emerald-950/40 border border-emerald-800 text-emerald-200 text-xs rounded-lg">
          {message}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-6">
        {/* PRODUCTS CATALOG SECTION */}
        <div className="lg:col-span-2 space-y-4">
          <input 
            type="text" 
            placeholder="Search products by trade name or scientific formula..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-emerald-500 shadow-lg"
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {loading ? (
              <p className="text-xs text-slate-500 col-span-2 text-center py-12">Loading products catalog from database...</p>
            ) : filteredProducts.length === 0 ? (
              <p className="text-xs text-slate-500 col-span-2 text-center py-12">No products found in backend database. Please register products first.</p>
            ) : (
              filteredProducts.map(product => {
                const currentPrice = product.sellingPricePerBox ?? product.sellingPrice ?? 0.00;
                return (
                  <div key={product.productId} className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-xl flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start">
                        <h3 className="text-base font-bold text-white">{product.tradeName}</h3>
                        <span className="text-[10px] bg-emerald-950 text-emerald-400 px-2 py-0.5 rounded border border-emerald-800">{product.category || 'General'}</span>
                      </div>
                      <p className="text-xs text-slate-400 mt-1">{product.scientificName || 'N/A'}</p>
                    </div>
                    <div className="mt-4 pt-4 border-t border-slate-800 flex items-center justify-between">
                      <span className="text-emerald-400 font-bold text-sm">${currentPrice.toFixed(2)} <span className="text-[10px] text-slate-500 font-normal">/ Box</span></span>
                      <button 
                        onClick={() => addToCart(product)}
                        className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs px-4 py-2 rounded-lg font-medium transition-colors"
                      >
                        Add to Cart
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* CART & CHECKOUT SECTION */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl flex flex-col h-fit">
          <h2 className="text-lg font-bold text-white mb-4 pb-2 border-b border-slate-800">Current Dispensing Cart</h2>

          {cart.length === 0 ? (
            <p className="text-xs text-slate-500 text-center py-8">Cart is empty. Select products to begin dispensing.</p>
          ) : (
            <div className="space-y-4 flex-grow">
              {cart.map(item => {
                const itemPrice = item.sellingPricePerBox ?? item.sellingPrice ?? 0.00;
                return (
                  <div key={item.productId} className="flex items-center justify-between bg-slate-950 p-3 rounded-lg border border-slate-800 text-xs">
                    <div>
                      <p className="font-bold text-white">{item.tradeName}</p>
                      <p className="text-[10px] text-slate-400">${itemPrice.toFixed(2)} each box</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button 
                        onClick={() => updateQuantity(item.productId, item.qty - 1)}
                        className="w-6 h-6 bg-slate-800 text-white rounded flex items-center justify-center font-bold"
                      >
                        -
                      </button>
                      <span className="font-bold text-white w-6 text-center">{item.qty}</span>
                      <button 
                        onClick={() => updateQuantity(item.productId, item.qty + 1)}
                        className="w-6 h-6 bg-slate-800 text-white rounded flex items-center justify-center font-bold"
                      >
                        +
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          <div className="mt-6 pt-4 border-t border-slate-800 space-y-4">
            <div className="flex justify-between items-center text-sm">
              <span className="text-slate-400">Payment Method:</span>
              <select 
                value={paymentMethod}
                onChange={e => setPaymentMethod(e.target.value)}
                className="bg-slate-950 border border-slate-800 rounded px-2 py-1 text-white text-xs"
              >
                <option value="CASH">CASH</option>
                <option value="CARD">CARD</option>
              </select>
            </div>

            <div className="flex justify-between items-center text-lg font-bold">
              <span className="text-white">Total Amount:</span>
              <span className="text-emerald-400">${calculateTotal()}</span>
            </div>

            <button 
              disabled={cart.length === 0}
              onClick={handleCheckout}
              className="w-full bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-semibold py-3 rounded-lg text-sm transition-colors shadow-lg"
            >
              Complete Sale & Print Invoice
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}