import { useAuth } from '../../../context/AuthContext';

export function usePermission() {
  const { user, isLoading } = useAuth();

  const hasPermission = (requiredPermission) => {
    if (isLoading || !user) return false;
    
    // Admin override matches backend legacyRole='admin' bypass
    if (user.role === 'admin' || user.legacyRole === 'admin') return true;
    
    // Check if user has '*' or specific permission
    if (user.permissions?.includes('*')) return true;
    return user.permissions?.includes(requiredPermission) || false;
  };

  const hasAnyPermission = (permissions = []) => {
    if (isLoading || !user) return false;
    if (user.role === 'admin' || user.legacyRole === 'admin') return true;
    if (user.permissions?.includes('*')) return true;
    
    return permissions.some(p => user.permissions?.includes(p));
  };

  return { hasPermission, hasAnyPermission, isLoading };
}
