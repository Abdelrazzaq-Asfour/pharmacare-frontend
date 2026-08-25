import axiosClient from './axiosClient';

export const productApi = {
  getProducts: async (keyword = '') => {
    // Matches GET /api/v1/products/search?keyword=...
    const response = await axiosClient.get(`/products/search?keyword=${encodeURIComponent(keyword)}`);
    return response.data;
  },
  createProduct: async (productData) => {
    // Matches POST /api/v1/products
    const response = await axiosClient.post('/products', productData);
    return response.data;
  },
  updatePrice: async (id, newPrice) => {
    // Matches PUT /api/v1/products/{id}/price?newPrice=...
    const response = await axiosClient.put(`/products/${id}/price?newPrice=${newPrice}`);
    return response.data;
  }
};