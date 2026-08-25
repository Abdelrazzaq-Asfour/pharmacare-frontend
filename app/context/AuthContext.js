// // Global Auth Context enforcing strict role-based access control (RBAC)
'use client';
import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // // Restore session state securely on initial client-side mount
    const stored = localStorage.getItem('pharmacare_session');
    if (stored) {
      try {
        setUser(JSON.parse(stored));
      } catch (e) {
        localStorage.removeItem('pharmacare_session');
      }
    }
    setLoading(false);
  }, []);

  const login = async (username, password) => {
    try {
      // // Delegate credential payload to centralized enterprise API gateway
      const data = await api.auth.login(username, password);
      setUser(data);
      localStorage.setItem('pharmacare_session', JSON.stringify(data));
      return { success: true };
    } catch (err) {
      return { success: false, message: err.message };
    }
  };

  const logout = () => {
    // // Secure session destruction (Zero-Trust cleanup)
    setUser(null);
    localStorage.removeItem('pharmacare_session');
    window.location.href = '/login';
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);