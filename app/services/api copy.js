// // Unified Enterprise API Client - Centralized endpoints for PharmaCare services (Boxes Only)
import axiosClient from './axiosClient';

export const api = {

  // ==================== AUTHENTICATION ====================
  auth: {
    login: async (username, password) => {
      const response = await axiosClient.post('/auth/login', { username, password });
      return response.data;
    }
  },

  // ==================== PRODUCTS ====================
  products: {
    getProducts: async (keyword = '') => {
      const response = await axiosClient.get(`/products/search?keyword=${encodeURIComponent(keyword)}`);
      return response.data;
    },
    createProduct: async (productData, config = {}) => {
      const response = await axiosClient.post('/products', productData, config);
      return response.data;
    },

    updateProduct: async (id, productData, config = {}) => {
      const response = await axiosClient.put(`/products/${id}`, productData, config);
      return response.data;
    },

    deleteProduct: async (id, config = {}) => {
      const response = await axiosClient.delete(`/products/${id}`, config);
      return response.data;
    },
    updatePrice: async (id, newPrice) => {
      const response = await axiosClient.put(`/products/${id}/price?newPrice=${newPrice}`);
      return response.data;
    }
  },

  // ==================== INVENTORY ====================
  inventory: {
    getBatches: async () => {
      try {
        const response = await axiosClient.get('/inventory/batches');
        return response.data;
      } catch (err) {
        console.warn('Backend batches endpoint unreachable, returning empty list.', err);
        return [];
      }
    },
    commitStockIntake: async (intakeData) => {
      const response = await axiosClient.post('/inventory/intake', intakeData);
      return response.data;
    },
    getAlerts: async () => {
      const response = await axiosClient.get('/inventory/alerts');
      return response.data;
    },
    recordAdjustment: async ({ batchId, userId, type, qtyChanged, reason }) => {
      const response = await axiosClient.post(
        `/inventory/adjustments?batchId=${batchId}&userId=${userId}&type=${type}&qtyChanged=${qtyChanged}&reason=${encodeURIComponent(reason)}`
      );
      return response.data;
    }
  },

  // ==================== POS TERMINAL ====================
  pos: {
    createInvoice: async (invoiceData, config = {}) => {
      const response = await axiosClient.post('/pos/sale', invoiceData, config);
      return response.data;
    },
    getInvoices: async () => {
      const response = await axiosClient.get('/pos/invoices');
      return response.data;
    }
  },

  // ==================== ADMIN OVERSIGHT ====================
// ==================== ADMIN OVERSIGHT ====================
  admin: {
    getUsers: async (config) => {
      const res = await axiosClient.get('/admin/users', config);
      return res.data;
    },
    registerUser: async (userDto, config) => {
      const res = await axiosClient.post('/admin/users', userDto, config);
      return res.data;
    },

    updateUser: async (userId, userData, config) => {
      const res = await axiosClient.put(`/admin/users/${userId}`, userData, config);
      return res.data;
    },
    deleteUser: async (userId, config) => {
      const res = await axiosClient.delete(`/admin/users/${userId}`, config);
      return res.data;
    },
    requestReturn: async (returnDto) => {
      const res = await axiosClient.post('/admin/returns/request', returnDto);
      return res.data;
    },
    resolveReturn: async (id, approved) => {
      const res = await axiosClient.put(`/admin/returns/${id}/resolve?approved=${approved}`);
      return res.data;
    }
  },

  // ==================== SUPPLIERS ====================
  suppliers: {
    getSuppliers: async (config = {}) => {
      const res = await axiosClient.get('/suppliers', config);
      return res.data;
    },
    createSupplier: async (supplierData, config = {}) => {
      const res = await axiosClient.post('/suppliers', supplierData, config);
      return res.data;
    },
  
    updateSupplier: async (id, supplierData, config = {}) => {
      const res = await axiosClient.put(`/suppliers/${id}`, supplierData, config);
      return res.data;
    },

    deleteSupplier: async (id, config = {}) => {
      const res = await axiosClient.delete(`/suppliers/${id}`, config);
      return res.data;
    }
  }
};

export default api;