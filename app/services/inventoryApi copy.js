// // Inventory API service - Manages batches, stock intake, and damage logs
import { MOCK_BATCHES, MOCK_PRODUCTS, MOCK_SUPPLIERS } from '../utils/mockData';

export const inventoryApi = {
  // // Fetch all active batches joined with product and supplier details
  getBatches: async () => {
    await new Promise(r => setTimeout(r, 200));
    return MOCK_BATCHES.map(batch => {
      const product = MOCK_PRODUCTS.find(p => p.productId === batch.productId);
      const supplier = MOCK_SUPPLIERS.find(s => s.supplierId === batch.supplierId);
      return {
        ...batch,
        productName: product ? product.tradeName : 'Unknown',
        baseUnitName: product ? product.baseUnitName : 'pills',
        supplierName: supplier ? supplier.supplierName : 'Unknown'
      };
    });
  },

  // // Register new stock batch intake (calculating base units strictly)
  addBatch: async (intakeData) => {
    await new Promise(r => setTimeout(r, 300));
    const product = MOCK_PRODUCTS.find(p => p.productId === parseInt(intakeData.productId));
    if (!product) throw new Error('Invalid product selection.');

    // // Convert boxes/packs to base units (pills/capsules) for precise inventory tracking
    const baseQty = parseInt(intakeData.boxQuantity) * product.unitMultiplier;

    const newBatch = {
      batchId: MOCK_BATCHES.length + 1,
      productId: product.productId,
      supplierId: parseInt(intakeData.supplierId),
      batchNumber: intakeData.batchNumber,
      costPricePerBaseUnit: parseFloat(intakeData.costPrice),
      initialBaseQuantity: baseQty,
      currentBaseQuantity: baseQty,
      expirationDate: intakeData.expirationDate
    };

    MOCK_BATCHES.push(newBatch);
    return { success: true, message: 'Stock batch registered successfully via FIFO engine.' };
  },

  // // Log stock adjustment for damaged or expired items
  adjustStock: async (adjustmentData) => {
    await new Promise(r => setTimeout(r, 300));
    const batch = MOCK_BATCHES.find(b => b.batchId === parseInt(adjustmentData.batchId));
    if (!batch) throw new Error('Batch not found.');

    const qtyChange = parseInt(adjustmentData.quantityChanged); // Negative for loss
    if (batch.currentBaseQuantity + qtyChange < 0) {
      throw new Error('Adjustment exceeds available base quantity in batch.');
    }

    batch.currentBaseQuantity += qtyChange;
    return { success: true, message: 'Stock adjustment recorded successfully.' };
  }
};