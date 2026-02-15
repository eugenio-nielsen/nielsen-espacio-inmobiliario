import { useMemo } from 'react';
import { useAuth } from '../contexts/AuthContext';
import type { UserRole } from '../types/database';

interface Permissions {
  isSuperAdmin: boolean;
  isAdmin: boolean;
  canManageAllUsers: boolean;
  canEditAnyProperty: boolean;
  canViewAllData: boolean;
  canManageContent: boolean;
  canViewAnalytics: boolean;
  role: UserRole | null;
}

export function usePermissions(): Permissions {
  const { profile } = useAuth();

  return useMemo(() => {
    const role = profile?.role || null;
    const isSuperAdmin = role === 'super_admin';
    const isAdmin = role === 'admin' || isSuperAdmin;

    return {
      isSuperAdmin,
      isAdmin,
      canManageAllUsers: isSuperAdmin,
      canEditAnyProperty: isSuperAdmin,
      canViewAllData: isSuperAdmin,
      canManageContent: isAdmin,
      canViewAnalytics: isAdmin,
      role,
    };
  }, [profile?.role]);
}
