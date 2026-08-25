// // Point of Sale API Service
import axiosClient from './axiosClient';
import { MOCK_INVOICES } from '../utils/mockData';

export const posApi = {
  createInvoice: async (invoiceData) => {
    // // Simulate transaction committing to backend ledger
    await new Promise(r => setTimeout(r, 300));
    return { success: true, message: 'Invoice committed securely.' };
  }
};