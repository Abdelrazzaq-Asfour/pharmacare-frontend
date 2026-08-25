// Mock Database mirroring backend SQL schema for PharmaCare frontend simulation

export const MOCK_USERS = [
  {
    userId: 1,
    username: 'admin_alex',
    email: 'alex.admin@pharmacare.com',
    password: '123456',
    firstName: 'Alex',
    lastName: 'Vance',
    isActive: true,
    roles: ['ROLE_ADMIN']
  },
  {
    userId: 2,
    username: 'phar_sarah',
    email: 'sarah.pharm@pharmacare.com',
    password: '123456',
    firstName: 'Sarah',
    lastName: 'Connor',
    isActive: true,
    roles: ['ROLE_PHARMACIST']
  },
  {
    userId: 3,
    username: 'clerk_john',
    email: 'john.clerk@pharmacare.com',
    password: '123456',
    firstName: 'John',
    lastName: 'Doe',
    isActive: true,
    roles: ['ROLE_INVENTORY_CLERK']
  }
];

export const MOCK_SUPPLIERS = [
  { supplierId: 1, supplierName: 'PharmaGlobal Inc.', contactPerson: 'Michael Scott', phone: '+1-800-555-0199', email: 'orders@pharmaglobal.com' },
  { supplierId: 2, supplierName: 'MedDirect Supply', contactPerson: 'Pam Beesly', phone: '+1-800-555-0142', email: 'support@meddirect.org' },
  { supplierId: 3, supplierName: 'BioHealth Labs', contactPerson: 'Dwight Schrute', phone: '+1-800-555-0188', email: 'sales@biohealthlabs.com' }
];

export const MOCK_PRODUCTS = [
  { productId: 1, tradeName: 'Panadol Extra', scientificName: 'Paracetamol / Caffeine', category: 'Analgesics', unitMultiplier: 20, baseUnitName: 'pills', sellingPricePerBaseUnit: 0.50, minStockAlertThreshold: 50 },
  { productId: 2, tradeName: 'Amoxil', scientificName: 'Amoxicillin Trihydrate', category: 'Antibiotics', unitMultiplier: 14, baseUnitName: 'capsules', sellingPricePerBaseUnit: 1.20, minStockAlertThreshold: 30 },
  { productId: 3, tradeName: 'Lipitor', scientificName: 'Atorvastatin Calcium', category: 'Statins', unitMultiplier: 30, baseUnitName: 'tablets', sellingPricePerBaseUnit: 2.50, minStockAlertThreshold: 40 },
  { productId: 4, tradeName: 'Glucophage', scientificName: 'Metformin Hydrochloride', category: 'Antidiabetics', unitMultiplier: 50, baseUnitName: 'tablets', sellingPricePerBaseUnit: 0.45, minStockAlertThreshold: 100 }
];

export const MOCK_BATCHES = [
  { batchId: 1, productId: 1, supplierId: 1, batchNumber: 'PAN-2026-A', costPricePerBaseUnit: 0.30, initialBaseQuantity: 500, currentBaseQuantity: 480, expirationDate: '2028-06-30' },
  { batchId: 2, productId: 2, supplierId: 2, batchNumber: 'AMX-2026-B', costPricePerBaseUnit: 0.80, initialBaseQuantity: 300, currentBaseQuantity: 300, expirationDate: '2027-12-15' },
  { batchId: 3, productId: 3, supplierId: 3, batchNumber: 'LIP-2026-C', costPricePerBaseUnit: 1.80, initialBaseQuantity: 200, currentBaseQuantity: 190, expirationDate: '2029-01-10' },
  { batchId: 4, productId: 4, supplierId: 1, batchNumber: 'GLU-2026-D', costPricePerBaseUnit: 0.25, initialBaseQuantity: 1000, currentBaseQuantity: 950, expirationDate: '2028-09-20' }
];

export const MOCK_INVOICES = [
  { invoiceId: 1, invoiceNumber: 'INV-2026-0001', pharmacistUserId: 2, totalAmount: 25.00, paymentMethod: 'CASH', invoiceStatus: 'COMPLETED', createdAt: '2026-06-01' },
  { invoiceId: 2, invoiceNumber: 'INV-2026-0002', pharmacistUserId: 2, totalAmount: 35.00, paymentMethod: 'CARD', invoiceStatus: 'COMPLETED', createdAt: '2026-06-02' }
];

export const MOCK_RETURN_REQUESTS = [
  { returnRequestId: 1, invoiceId: 1, requestedByUserId: 2, approvedByUserId: 1, status: 'APPROVED', reason: 'Customer returned unused items due to doctor changing prescription medication.' }
];