import axiosClient from './axiosClient';

export const posApi = {
  createInvoice: async (invoiceData) => {
    // Matches POST /api/v1/pos/sale
    const response = await axiosClient.post('/pos/sale', invoiceData);
    return response.data;
  }
};