// // Mock Database - Comprehensive Enterprise In-Memory Data Store (Frontend Fallback & Simulation)
// NOTE: Created at D:\8-2026\pharmacare\pharmacare\data\mockDatabase.js
// Optimized for zero-trust UI simulation, robust inventory management, and fast prototyping.

export const MOCK_ROLES = [
  { roleId: 1, roleName: 'ROLE_ADMIN', description: 'Full system privileges, user management, audit oversight, and return approvals' },
  { roleId: 2, roleName: 'ROLE_PHARMACIST', description: 'POS operations, prescription processing, dispensing, and inventory tracking' },
  { roleId: 3, roleName: 'ROLE_INVENTORY_CLERK', description: 'Stock intake, batch registration, supplier logging, and waste management' }
];

export const MOCK_USERS = [
  { 
    userId: 1, 
    username: 'admin_sami', 
    email: 'sami.admin@pharmacare.com', 
    firstName: 'Sami', 
    lastName: 'Al-Ahmad', 
    isActive: true, 
    roles: ['ROLE_ADMIN'] 
  },
  { 
    userId: 2, 
    username: 'ph_layla', 
    email: 'layla.ph@pharmacare.com', 
    firstName: 'Layla', 
    lastName: 'Mahmoud', 
    isActive: true, 
    roles: ['ROLE_PHARMACIST'] 
  },
  { 
    userId: 3, 
    username: 'clerk_rami', 
    email: 'rami.clerk@pharmacare.com', 
    firstName: 'Rami', 
    lastName: 'Khaled', 
    isActive: true, 
    roles: ['ROLE_INVENTORY_CLERK'] 
  }
];

export const MOCK_SUPPLIERS = [
  { 
    supplierId: 1, 
    supplierName: 'Alpha Pharma Distribution', 
    contactPerson: 'Dr. Ziad Naji', 
    phone: '+962791112233', 
    email: 'orders@alphapharma.jo', 
    address: 'Amman, Industrial Zone, St. 4',
    isActive: true 
  },
  { 
    supplierId: 2, 
    supplierName: 'Modern Medical Supplies', 
    contactPerson: 'Ahmad Yousef', 
    phone: '+962785556677', 
    email: 'info@modernmed.jo', 
    address: 'Irbid, University Street',
    isActive: true 
  }
];

export const MOCK_PRODUCTS = [
  { 
    productId: 1, 
    tradeName: 'Panadol Extra', 
    scientificName: 'Paracetamol + Caffeine', 
    category: 'Analgesics', 
    sellingPricePerBox: 2.50, 
    minStockAlertThreshold: 10, 
    isActive: true 
  },
  { 
    productId: 2, 
    tradeName: 'Augmentin 1g', 
    scientificName: 'Amoxicillin + Clavulanic Acid', 
    category: 'Antibiotics', 
    sellingPricePerBox: 11.75, 
    minStockAlertThreshold: 5, 
    isActive: true 
  },
  { 
    productId: 3, 
    tradeName: 'Lipitor 20mg', 
    scientificName: 'Atorvastatin', 
    category: 'Cholesterol', 
    sellingPricePerBox: 18.00, 
    minStockAlertThreshold: 8, 
    isActive: true 
  },
  { 
    productId: 4, 
    tradeName: 'Glucophage 500mg', 
    scientificName: 'Metformin Hydrochloride', 
    category: 'Antidiabetic', 
    sellingPricePerBox: 6.25, 
    minStockAlertThreshold: 6, 
    isActive: true 
  }
];

export const MOCK_BATCHES = [
  { 
    batchId: 1, 
    productId: 1, 
    productName: 'Panadol Extra',
    supplierId: 1, 
    supplier: 'Alpha Pharma Distribution',
    batchNumber: 'PAN-2026-A', 
    costPerBox: 1.80, 
    initialBoxesQuantity: 50, 
    currentBoxesQuantity: 45, 
    expirationDate: '2027-06-30' 
  },
  { 
    batchId: 2, 
    productId: 1, 
    productName: 'Panadol Extra',
    supplierId: 2, 
    supplier: 'Modern Medical Supplies',
    batchNumber: 'PAN-2027-B', 
    costPerBox: 1.85, 
    initialBoxesQuantity: 30, 
    currentBoxesQuantity: 30, 
    expirationDate: '2028-12-31' 
  },
  { 
    batchId: 3, 
    productId: 2, 
    productName: 'Augmentin 1g',
    supplierId: 1, 
    supplier: 'Alpha Pharma Distribution',
    batchNumber: 'AUG-2026-01', 
    costPerBox: 9.00, 
    initialBoxesQuantity: 20, 
    currentBoxesQuantity: 12, 
    expirationDate: '2026-11-15' 
  },
  { 
    batchId: 4, 
    productId: 3, 
    productName: 'Lipitor 20mg',
    supplierId: 2, 
    supplier: 'Modern Medical Supplies',
    batchNumber: 'LIP-2027-X', 
    costPerBox: 14.00, 
    initialBoxesQuantity: 15, 
    currentBoxesQuantity: 15, 
    expirationDate: '2028-03-31' 
  },
  { 
    batchId: 5, 
    productId: 4, 
    productName: 'Glucophage 500mg',
    supplierId: 1, 
    supplier: 'Alpha Pharma Distribution',
    batchNumber: 'GLU-2026-99', 
    costPerBox: 4.50, 
    initialBoxesQuantity: 25, 
    currentBoxesQuantity: 18, 
    expirationDate: '2027-09-30' 
  }
];

export const MOCK_INVOICES = [
  {
    invoiceId: 1,
    invoiceNumber: 'INV-2026-0001',
    pharmacistUserId: 2,
    pharmacistName: 'Layla Mahmoud',
    totalAmount: 16.75,
    paymentMethod: 'CASH',
    invoiceStatus: 'COMPLETED',
    createdAt: '2026-08-23 10:30:00',
    items: [
      { itemId: 1, productId: 1, productName: 'Panadol Extra', batchId: 1, quantityBoxes: 2, unitPrice: 2.50, totalPrice: 5.00 },
      { itemId: 2, productId: 2, productName: 'Augmentin 1g', batchId: 3, quantityBoxes: 1, unitPrice: 11.75, totalPrice: 11.75 }
    ]
  }
];

export const MOCK_RETURN_REQUESTS = [
  {
    returnRequestId: 1,
    invoiceId: 1,
    invoiceNumber: 'INV-2026-0001',
    requestedByUserId: 2,
    requestedBy: 'Layla Mahmoud',
    approvedByUserId: 1,
    approvedBy: 'Sami Al-Ahmad',
    status: 'APPROVED',
    reason: 'Customer returned Augmentin due to prescribed medication change by doctor.',
    createdAt: '2026-08-23 11:00:00'
  }
];