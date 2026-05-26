import { NavLink } from 'react-router-dom';
import { useContext, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { usePermission } from '../hooks/usePermission';
import { ROLES, PERMISSIONS } from '../../../constants/rbac';
import logoSrc from '../../../assets/logos/logo.jpeg';
import { SidebarContext } from '../../../context/SidebarContext';

export default function MobileDrawer() {
  const { user } = useAuth();
  const { hasPermission } = usePermission();
  const { isDrawerOpen, closeDrawer } = useContext(SidebarContext);

  const userRoleCodes = user?.roles?.map(r => r.code) || [];
  const isAdmin = userRoleCodes.includes(ROLES.ADMIN);

  const menuItems = [
    {
      name: 'Ticket Manager',
      path: '/ticket-manager',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      ),
      show: userRoleCodes.includes(ROLES.AGENT) || isAdmin
    },
    {
      name: 'My Tickets',
      path: '/my-tickets',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
      ),
      show: !userRoleCodes.includes(ROLES.AGENT) && !isAdmin
    },
    {
      name: 'Dashboard',
      path: '/dashboard',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
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

  // Close drawer when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (e.target.closest('[data-drawer-overlay]')) {
        closeDrawer();
      }
    };

    if (isDrawerOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      // Prevent body scroll when drawer is open
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = 'unset';
    };
  }, [isDrawerOpen, closeDrawer]);

  return (
    <>
      {/* Overlay */}
      {isDrawerOpen && (
        <div
          data-drawer-overlay
          className="fixed inset-0 bg-black/50 z-30 md:hidden transition-opacity animate-in fade-in duration-200"
          onClick={closeDrawer}
        />
      )}

      {/* Drawer */}
      <div
        className={`fixed inset-y-0 left-0 w-64 bg-white z-40 md:hidden flex flex-col transition-transform duration-300 transform ${
          isDrawerOpen ? 'translate-x-0' : '-translate-x-full'
        } shadow-xl`}
      >
        {/* Header */}
        <div className="flex items-center justify-between h-16 px-4 border-b border-slate-100">
          <div className="inline-flex items-center justify-center w-10 h-10 rounded-lg overflow-hidden bg-blue-50">
            <img src={logoSrc} alt="QuickDesk logo" className="object-cover w-full h-full" />
          </div>
          <span className="text-lg font-bold tracking-tight bg-gradient-to-br from-cyan-500 via-blue-700 to-blue-900 text-transparent bg-clip-text">
            QuickDesk
          </span>
          <button
            onClick={closeDrawer}
            className="p-1 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          <div className="mb-4 text-xs font-semibold text-gray-400 uppercase tracking-wider px-2">
            Main Menu
          </div>
          {menuItems.filter(item => item.show).map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={closeDrawer}
              className={({ isActive }) =>
                `flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 ${
                  isActive
                    ? 'bg-blue-50 text-blue-800 shadow'
                    : 'text-gray-700 hover:bg-gray-100 hover:text-blue-900'
                }`
              }
            >
              <div className="mr-3">{item.icon}</div>
              {item.name}
            </NavLink>
          ))}
        </nav>

        {/* Footer */}
        <div className="p-3 border-t border-slate-200">
          <div className="flex items-center p-3 bg-slate-50 rounded-lg">
            <div className="w-2 h-2 flex-shrink-0 rounded-full bg-green-500 mr-2 animate-pulse"></div>
            <span className="text-xs font-medium text-gray-800">System Online</span>
          </div>
        </div>
      </div>
    </>
  );
}
