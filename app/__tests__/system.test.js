import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import LoginPage from '../login/page';
import '@testing-library/jest-dom';

const mockPush = jest.fn();

jest.mock('../context/AuthContext', () => ({
  useAuth: () => ({
    login: jest.fn().mockResolvedValue({ success: true }),
  }),
}));

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

describe('LoginPage Component - Enterprise Authentication Gateway Suite', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('renders enterprise authentication portal layout and role hints correctly', () => {
    render(<LoginPage />);

    expect(screen.getByText('PharmaCare Portal')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('e.g. phar_sarah, admin_alex, clerk_john')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
  });

  it('allows user to securely input credentials into text and password fields', () => {
    render(<LoginPage />);

    const usernameInput = screen.getByPlaceholderText('e.g. phar_sarah, admin_alex, clerk_john');
    const passwordInput = screen.getByPlaceholderText('••••••••');

    fireEvent.change(usernameInput, { target: { value: 'admin_asfour' } });
    fireEvent.change(passwordInput, { target: { value: '123456' } });

    expect(usernameInput.value).toBe('admin_asfour');
    expect(passwordInput.value).toBe('123456');
  });

  it('triggers authentication flow and routes to home dashboard upon valid credentials', async () => {
    render(<LoginPage />);

    const usernameInput = screen.getByPlaceholderText('e.g. phar_sarah, admin_alex, clerk_john');
    const passwordInput = screen.getByPlaceholderText('••••••••');
    const submitButton = screen.getByRole('button', { name: /sign in/i });

    fireEvent.change(usernameInput, { target: { value: 'admin_asfour' } });
    fireEvent.change(passwordInput, { target: { value: '123456' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/home');
    });
  });
});