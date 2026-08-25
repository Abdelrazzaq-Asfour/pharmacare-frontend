// // Unified Enterprise API Client - Centralized endpoints with runtime Mock / Backend toggling
import axiosClient from './axiosClient';
import { 
  MOCK_USERS, 
  MOCK_SUPPLIERS, 
  MOCK_PRODUCTS, 
  MOCK_BATCHES, 
  MOCK_INVOICES, 
  MOCK_RETURN_REQUESTS 
} from '../../data/mockDatabase';

// Runtime configuration flag: Set to true to force local in-memory fallback, false to use live backend
const USE_MOCK_DATA = true;

// Helper to simulate network latency for mock fallback
const mockDelay = (ms = 300) => new Promise(resolve => setTimeout(resolve, ms));

export const api = {

  // ==================== AUTHENTICATION ====================
  auth: {
    login: async (username, password) => {
      if (USE_MOCK_DATA) {
        await mockDelay();
        const user = MOCK_USERS.find(u => u.username === username);
        if (!user) throw { response: { data: { message: 'User not found in mock database.' } } };
        return {
          token: 'mock-jwt-token-enterprise-999',
          username: user.username,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          roles: user.roles
        };
      }
      const response = await axiosClient.post('/auth/login', { username, password });
      return response.data;
    }
  },

  // ==================== PRODUCTS ====================
  products: {
    getProducts: async (keyword = '') => {
      if (USE_MOCK_DATA) {
        await mockDelay();
        if (!keyword) return MOCK_PRODUCTS;
        const lower = keyword.toLowerCase();
        return MOCK_PRODUCTS.filter(p => p.tradeName.toLowerCase().includes(lower) || p.scientificName.toLowerCase().includes(lower));
      }
      const response = await axiosClient.get(`/products/search?keyword=${encodeURIComponent(keyword)}`);
      return response.data;
    },
    createProduct: async (productData, config = {}) => {
      if (USE_MOCK_DATA) {
        await mockDelay();
        const newProd = { productId: Date.now(), ...productData, isActive: true };
        MOCK_PRODUCTS.push(newProd);
        return newProd;
      }
      const response = await axiosClient.post('/products', productData, config);
      return response.data;
    },
    updateProduct: async (id, productData, config = {}) => {
      if (USE_MOCK_DATA) {
        await mockDelay();
        const index = MOCK_PRODUCTS.findIndex(p => p.productId == id || p.id == id);
        if (index !== -1) {
          MOCK_PRODUCTS[index] = { ...MOCK_PRODUCTS[index], ...productData };
          return MOCK_PRODUCTS[index];
        }
        throw new Error('Product not found in mock state.');
      }
      const response = await axiosClient.put(`/products/${id}`, productData, config);
      return response.data;
    },
    deleteProduct: async (id, config = {}) => {
      if (USE_MOCK_DATA) {
        await mockDelay();
        const index = MOCK_PRODUCTS.findIndex(p => p.productId == id || p.id == id);
        if (index !== -1) {
          MOCK_PRODUCTS.splice(index, 1);
          return { message: 'Product deleted successfully.' };
        }
        throw new Error('Product not found.');
      }
      const response = await axiosClient.delete(`/products/${id}`, config);
      return response.data;
    },
    updatePrice: async (id, newPrice) => {
      if (USE_MOCK_DATA) {
        await mockDelay();
        const prod = MOCK_PRODUCTS.find(p => p.productId == id || p.id == id);
        if (prod) {
          prod.sellingPricePerBox = parseFloat(newPrice);
          return prod;
        }
        throw new Error('Product not found.');
      }
      const response = await axiosClient.put(`/products/${id}/price?newPrice=${newPrice}`);
      return response.data;
    }
  },

  // ==================== INVENTORY ====================
  inventory: {
    getBatches: async () => {
      if (USE_MOCK_DATA) {
        await mockDelay();
        return MOCK_BATCHES;
      }
      try {
        const response = await axiosClient.get('/inventory/batches');
        return response.data;
      } catch (err) {
        console.warn('Backend batches endpoint unreachable, returning empty list.', err);
        return [];
      }
    },
    commitStockIntake: async (intakeData) => {
      if (USE_MOCK_DATA) {
        await mockDelay();
        const newBatch = {
          batchId: Date.now(),
          ...intakeData,
          currentBoxesQuantity: parseInt(intakeData.initialBoxesQuantity)
        };
        MOCK_BATCHES.push(newBatch);
        return { message: 'Stock intake committed successfully.' };
      }
      const response = await axiosClient.post('/inventory/intake', intakeData);
      return response.data;
    },
    getAlerts: async () => {
      if (USE_MOCK_DATA) {
        await mockDelay();
        return [];
      }
      const response = await axiosClient.get('/inventory/alerts');
      return response.data;
    },
    recordAdjustment: async ({ batchId, userId, type, qtyChanged, reason }) => {
      if (USE_MOCK_DATA) {
        await mockDelay();
        const batch = MOCK_BATCHES.find(b => b.batchId == batchId);
        if (batch) {
          batch.currentBoxesQuantity += parseInt(qtyChanged);
        }
        return { message: 'Stock adjustment recorded successfully.' };
      }
      const response = await axiosClient.post(
        `/inventory/adjustments?batchId=${batchId}&userId=${userId}&type=${type}&qtyChanged=${qtyChanged}&reason=${encodeURIComponent(reason)}`
      );
      return response.data;
    }
  },

  // ==================== POS TERMINAL ====================
  pos: {
    createInvoice: async (invoiceData, config = {}) => {
      if (USE_MOCK_DATA) {
        await mockDelay();
        const newInv = {
          invoiceId: Date.now(),
          invoiceNumber: `INV-2026-${Math.floor(1000 + Math.random() * 9000)}`,
          ...invoiceData,
          invoiceStatus: 'COMPLETED',
          createdAt: new Date().toISOString()
        };
        MOCK_INVOICES.push(newInv);
        return newInv;
      }
      const response = await axiosClient.post('/pos/sale', invoiceData, config);
      return response.data;
    },
    getInvoices: async () => {
      if (USE_MOCK_DATA) {
        await mockDelay();
        return MOCK_INVOICES;
      }
      const response = await axiosClient.get('/pos/invoices');
      return response.data;
    }
  },

  // ==================== ADMIN OVERSIGHT ====================
  admin: {
    getUsers: async (config) => {
      if (USE_MOCK_DATA) {
        await mockDelay();
        return MOCK_USERS;
      }
      const res = await axiosClient.get('/admin/users', config);
      return res.data;
    },
    registerUser: async (userDto, config) => {
      if (USE_MOCK_DATA) {
        await mockDelay();
        const newUser = { userId: Date.now(), ...userDto, isActive: true };
        MOCK_USERS.push(newUser);
        return newUser;
      }
      const res = await axiosClient.post('/admin/users', userDto, config);
      return res.data;
    },
    updateUser: async (userId, userData, config) => {
      if (USE_MOCK_DATA) {
        await mockDelay();
        const index = MOCK_USERS.findIndex(u => u.userId == userId);
        if (index !== -1) {
          MOCK_USERS[index] = { ...MOCK_USERS[index], ...userData };
          return MOCK_USERS[index];
        }
        throw new Error('User not found.');
      }
      const res = await axiosClient.put(`/admin/users/${userId}`, userData, config);
      return res.data;
    },
    deleteUser: async (userId, config) => {
      if (USE_MOCK_DATA) {
        await mockDelay();
        const index = MOCK_USERS.findIndex(u => u.userId == userId);
        if (index !== -1) {
          MOCK_USERS.splice(index, 1);
          return { message: 'User deleted.' };
        }
        throw new Error('User not found.');
      }
      const res = await axiosClient.delete(`/admin/users/${userId}`, config);
      return res.data;
    },
    requestReturn: async (returnDto) => {
      if (USE_MOCK_DATA) {
        await mockDelay();
        const req = { returnRequestId: Date.now(), ...returnDto, status: 'PENDING' };
        MOCK_RETURN_REQUESTS.push(req);
        return req;
      }
      const res = await axiosClient.post('/admin/returns/request', returnDto);
      return res.data;
    },
    resolveReturn: async (id, approved) => {
      if (USE_MOCK_DATA) {
        await mockDelay();
        const req = MOCK_RETURN_REQUESTS.find(r => r.returnRequestId == id);
        if (req) {
          req.status = approved ? 'APPROVED' : 'REJECTED';
          return req;
        }
        throw new Error('Return request not found.');
      }
      const res = await axiosClient.put(`/admin/returns/${id}/resolve?approved=${approved}`);
      return res.data;
    }
  },

  // ==================== SUPPLIERS ====================
  suppliers: {
    getSuppliers: async (config = {}) => {
      if (USE_MOCK_DATA) {
        await mockDelay();
        return MOCK_SUPPLIERS;
      }
      const res = await axiosClient.get('/suppliers', config);
      return res.data;
    },
    createSupplier: async (supplierData, config = {}) => {
      if (USE_MOCK_DATA) {
        await mockDelay();
        const newSup = { supplierId: Date.now(), ...supplierData, isActive: true };
        MOCK_SUPPLIERS.push(newSup);
        return newSup;
      }
      const res = await axiosClient.post('/suppliers', supplierData, config);
      return res.data;
    },
    updateSupplier: async (id, supplierData, config = {}) => {
      if (USE_MOCK_DATA) {
        await mockDelay();
        const index = MOCK_SUPPLIERS.findIndex(s => s.supplierId == id);
        if (index !== -1) {
          MOCK_SUPPLIERS[index] = { ...MOCK_SUPPLIERS[index], ...supplierData };
          return MOCK_SUPPLIERS[index];
        }
        throw new Error('Supplier not found.');
      }
      const res = await axiosClient.put(`/suppliers/${id}`, supplierData, config);
      return res.data;
    },
    deleteSupplier: async (id, config = {}) => {
      if (USE_MOCK_DATA) {
        await mockDelay();
        const index = MOCK_SUPPLIERS.findIndex(s => s.supplierId == id);
        if (index !== -1) {
          MOCK_SUPPLIERS.splice(index, 1);
          return { message: 'Supplier deleted.' };
        }
        throw new Error('Supplier not found.');
      }
      const res = await axiosClient.delete(`/suppliers/${id}`, config);
      return res.data;
    }
  }
};

export default api;