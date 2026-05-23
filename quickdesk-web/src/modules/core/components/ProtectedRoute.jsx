import { Navigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { ROLES } from '../../../constants/rbac';

export default function ProtectedRoute({ children, role }) {
  const { user, isLoading } = useAuth();

  if (isLoading) return <div className="flex items-center justify-center h-screen">Loading...</div>;
  if (!user) return <Navigate to="/login" replace />;
  
  if (role) {
    const allowedRoles = Array.isArray(role) ? role : [role];
    const userRoleCodes = user.roles?.map(r => r.code) || [];
    
    // Check if user has any of the allowed roles, or is an ADMIN
    if (!allowedRoles.some(r => userRoleCodes.includes(r)) && !userRoleCodes.includes(ROLES.ADMIN)) {
      return <Navigate to="/unauthorized" replace />;
    }
  }

  return children;
}
