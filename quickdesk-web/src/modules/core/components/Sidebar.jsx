import { NavLink } from 'react-router-dom';
import { useContext } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { usePermission } from '../hooks/usePermission';
import { ROLES, PERMISSIONS } from '../../../constants/rbac';
import logoSrc from '../../../assets/logos/logo.jpeg';
import { SidebarContext } from '../../../context/SidebarContext';

export default function Sidebar() {
  const { user } = useAuth();
  const { hasPermission } = usePermission();
  const { isCollapsed } = useContext(SidebarContext);

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
      name: 'New Ticket',
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
    },
    {
      name: 'RBAC Control',
      path: '/rbac',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
        </svg>
      ),
      show: isAdmin
    }
  ];

  return (
    <aside className={`fixed inset-y-0 left-0 bg-white  hidden md:flex flex-col z-10 transition-all duration-300 ${isCollapsed ? 'w-20' : 'w-64'}`}>
      <div className={`flex items-center h-16 px-4 ${isCollapsed ? 'justify-center' : ''}`}>
        <div className="inline-flex items-center justify-center w-11 h-11 rounded-lg overflow-hidden bg-white">
          <img src={logoSrc} alt="QuickDesk logo" className="object-cover w-full h-full" />
        </div>
        {!isCollapsed && (
          <span className="text-2xl font-bold tracking-tight bg-gradient-to-br from-cyan-500 via-blue-700 to-blue-900 text-transparent bg-clip-text">
            uickDesk
          </span>
        )}
      </div>

      <nav className="flex-1 px-2 py-6 space-y-2 overflow-y-auto">
        {!isCollapsed && (
          <div className="mb-4 text-xs font-semibold text-gray-400 uppercase tracking-wider px-2">Main Menu</div>
        )}
        {menuItems.filter(item => item.show).map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex  ${isCollapsed ? 'flex-col items-center justify-center' : 'items-start'} px-3 py-2.5 text-sm font-medium rounded-e-full transition-all duration-200 group ${
                isActive
                  ? 'bg-blue-50  text-blue-800 shadow'
                  : 'text-blue-950 hover:bg-black/5 hover:text-blue-900'
              }`
            }
            title={isCollapsed ? item.name : ''}
          >
            <div className={`${isCollapsed ? '' : 'mr-3'}`}>
              {item.icon}
            </div>
            {!isCollapsed && item.name}
            {isCollapsed && (
              <span className="text-[8px] whitespace-nowrap uppercase font-bold mt-1 text-center leading-none">{item.name}</span>
            )}
          </NavLink>
        ))}
      </nav>
      
      <div className="p-2 border-t border-gray-800">
        <div className={`flex items-center p-3 bg-gray-800 rounded-xl ${isCollapsed ? 'justify-center' : ''}`}>
          <div className="w-2 h-2 rounded-full bg-green-500 mr-2 animate-pulse"></div>
          {!isCollapsed && (
            <span className="text-xs font-medium text-gray-300">System Online</span>
          )}
        </div>
      </div>
    </aside>
  );
}
