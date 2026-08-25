// // Custom hook for safe AuthContext consumption with null-safety checks
'use client';
import { useAuth } from '../context/AuthContext';

export function useAppAuth() {
  const context = useAuth();
  
  if (!context) {
    // // Fail-safe mechanism: catch improper hook invocation outside provider boundary
    throw new Error('useAppAuth must be used within an active AuthProvider boundary.');
  }

  return context;
}