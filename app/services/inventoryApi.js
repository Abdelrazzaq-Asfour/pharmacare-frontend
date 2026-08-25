import axiosClient from './axiosClient';

export const inventoryApi = {
  getBatches: async () => {
    return [
      {
        batchId: 1,
        batchNumber: 'BATCH-2026-A',
        productName: 'Panadol Extra',
        supplierName: 'Global Pharma',
        currentBaseQuantity: 500,
        baseUnitName: 'Tablets',
        costPricePerBaseUnit: 0.15,
        expirationDate: '2028-12-31'
      }
    ];
  },

  commitStockIntake: async (intakeData) => {
    const response = await axiosClient.post('/inventory/intake', intakeData);
    return response.data;
  },

  getInventoryAlerts: async () => {
    const response = await axiosClient.get('/inventory/alerts');
    return response.data;
  },

  recordAdjustment: async ({ batchId, userId, type, qtyChanged, reason }) => {
    const response = await axiosClient.post(
      `/inventory/adjustments?batchId=${batchId}&userId=${userId}&type=${type}&qtyChanged=${qtyChanged}&reason=${encodeURIComponent(reason)}`
    );
    return response.data;
  }
};