// // Granular RBAC permission check hook implementing Zero-Trust least-privilege principles
'use client';
import { useAuth } from '../context/AuthContext';

export function usePermissions() {
  const { user } = useAuth();

  const hasRole = (requiredRole) => {
    if (!user || !user.roles) return false;
    return user.roles.includes(requiredRole);
  };

  const hasAnyRole = (rolesArray) => {
    if (!user || !user.roles) return false;
    return rolesArray.some(role => user.roles.includes(role));
  };

  return {
    isAdmin: hasRole('ROLE_ADMIN'),
    isPharmacist: hasRole('ROLE_PHARMACIST'),
    isInventoryClerk: hasRole('ROLE_INVENTORY_CLERK'),
    hasRole,
    hasAnyRole
  };
}