import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import InventoryPage from '../inventory/page';
import '@testing-library/jest-dom';

const mockPush = jest.fn();
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

const mockUser = {
  userId: 1,
  roles: ['ROLE_INVENTORY_CLERK'],
};

jest.mock('../context/AuthContext', () => ({
  useAuth: () => ({
    user: mockUser,
  }),
}));

jest.mock('../services/api', () => ({
  api: {
    inventory: {
      getBatches: jest.fn().mockResolvedValue([
        { batchId: 1, batchNumber: 'BATCH-001', productName: 'Panadol Extra', supplier: 'PharmaCorp', currentBoxesQuantity: 3, costPerBox: 2.00, expirationDate: '2027-12-31' }
      ]),
      commitStockIntake: jest.fn().mockResolvedValue({ success: true }),
      recordAdjustment: jest.fn().mockResolvedValue({ message: 'Success' }),
    },
    products: {
      getProducts: jest.fn().mockResolvedValue([
        { productId: 101, tradeName: 'Panadol Extra', scientificName: 'Paracetamol', category: 'Analgesics', sellingPricePerBox: 3.50, minStockAlertThreshold: 5 }
      ]),
      createProduct: jest.fn().mockResolvedValue({ productId: 102 }),
    }
  }
}));

describe('InventoryPage Component - Comprehensive Tests', () => {
  
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('renders inventory dashboard headers and loads active batches by default', async () => {
    render(<InventoryPage />);

    expect(screen.getByText('Inventory & Products Management')).toBeInTheDocument();
    
    await waitFor(() => {
      expect(screen.getByText('Panadol Extra')).toBeInTheDocument();
      expect(screen.getByText('#BATCH-001')).toBeInTheDocument();
    });
  });

  it('switches tabs correctly between batches, products, alerts, and intake', async () => {
    render(<InventoryPage />);

    await waitFor(() => {
      expect(screen.getByText('Panadol Extra')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: /Products Catalog/i }));
    await waitFor(() => {
      expect(screen.getByText('Registered Products Database Master Catalog')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: /Low Stock Alerts/i }));
    await waitFor(() => {
      expect(screen.getByText('Low Stock Warning Monitor')).toBeInTheDocument();
      expect(screen.getByText('Current Qty: 3 Boxes')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: /\+ Add Product & Stock/i }));
    await waitFor(() => {
      expect(screen.getByText('Register New Product & Initial Stock Shipment')).toBeInTheDocument();
    });
  });

  it('redirects unauthorized users away if roles do not match', async () => {
    jest.spyOn(require('../context/AuthContext'), 'useAuth').mockImplementation(() => ({
      user: { userId: 2, roles: ['ROLE_USER'] }
    }));

    render(<InventoryPage />);

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/unauthorized');
    });
  });
});