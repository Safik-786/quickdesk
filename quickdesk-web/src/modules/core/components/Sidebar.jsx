import { NavLink } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { usePermission } from '../hooks/usePermission';
import { ROLES, PERMISSIONS } from '../../../constants/rbac';

export default function Sidebar() {
  const { user } = useAuth();
  const { hasPermission } = usePermission();

  const userRoleCodes = user?.roles?.map(r => r.code) || [];
  const isAdmin = userRoleCodes.includes(ROLES.ADMIN);

  const menuItems = [
    {
      name: 'Dashboard',
      path: '/dashboard',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      ),
      // Only agents and admins typically see the dashboard
      show: userRoleCodes.includes(ROLES.AGENT) || isAdmin
    },
    {
      name: 'Submit Ticket',
      path: '/submit',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
        </svg>
      ),
      show: true
    },
    {
      name: 'My Tickets',
      path: '/my-tickets',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
      ),
      show: true
    },
    {
      name: 'Metrics',
      path: '/metrics',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
      // Using proper permission checking
      show: hasPermission(PERMISSIONS.METRICS_READ) || isAdmin
    }
  ];

  return (
    <aside className="fixed inset-y-0 left-0 w-64 bg-gray-900 border-r border-gray-800 hidden md:flex flex-col z-10 transition-all duration-300">
      <div className="flex items-center h-16 px-6 border-b border-gray-800 bg-gray-900">
        <div className="inline-flex items-center justify-center w-8 h-8 bg-indigo-600 rounded-lg mr-3 shadow-lg shadow-indigo-600/20">
          <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
        </div>
        <span className="text-xl font-bold text-white tracking-tight">QuickDesk</span>
      </div>

      <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
        <div className="mb-4 text-xs font-semibold text-gray-400 uppercase tracking-wider px-2">Main Menu</div>
        {menuItems.filter(item => item.show).map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center px-3 py-2.5 text-sm font-medium rounded-xl transition-all duration-200 group ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-gray-300 hover:bg-gray-800 hover:text-white'
              }`
            }
          >
            <div className="mr-3 shrink-0">
              {item.icon}
            </div>
            {item.name}
          </NavLink>
        ))}
      </nav>
      
      <div className="p-4 border-t border-gray-800">
        <div className="flex items-center p-3 bg-gray-800 rounded-xl">
          <div className="w-2 h-2 rounded-full bg-green-500 mr-2 animate-pulse"></div>
          <span className="text-xs font-medium text-gray-300">System Online</span>
        </div>
      </div>
    </aside>
  );
}
