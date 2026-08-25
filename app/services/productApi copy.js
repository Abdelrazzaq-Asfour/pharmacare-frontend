// // Product Catalog API Service
import axiosClient from './axiosClient';
import { MOCK_PRODUCTS } from '../utils/mockData';

export const productApi = {
  getProducts: async () => {
    // // Fallback / integration layer bridging backend endpoints with mock simulation
    return MOCK_PRODUCTS;
  }
};