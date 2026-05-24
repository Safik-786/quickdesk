import { useState, useRef, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { SidebarContext } from '../../../context/SidebarContext';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { axiosInstance } from '../../../lib/axios';

const formatTimeAgo = (dateString) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 1) return 'just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays === 1) return 'yesterday';
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
};

export default function Header() {
  const { user, logout } = useAuth();
  const { toggleSidebar } = useContext(SidebarContext);
  const navigate = useNavigate();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const [isBellOpen, setIsBellOpen] = useState(false);
  const bellRef = useRef(null);
  const queryClient = useQueryClient();

  // Handle clicking outside to close dropdowns
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
      if (bellRef.current && !bellRef.current.contains(event.target)) {
        setIsBellOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const { data: notifications = [] } = useQuery({
    queryKey: ['notifications'],
    queryFn: () => axiosInstance.get('/notifications'),
    enabled: !!user,
  });

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const handleMarkAsRead = async (id, ticketId) => {
    try {
      await axiosInstance.patch(`/notifications/${id}/read`);
      queryClient.invalidateQueries({ queryKey: ['notifications'] });

      const isAgent = user?.roles?.some(r => r.code === 'AGENT' || r.code === 'ADMIN');
      if (isAgent) {
        navigate(`/tickets/${ticketId}`);
      } else {
        navigate(`/my-tickets?ticketId=${ticketId}`);
      }
      setIsBellOpen(false);
    } catch (err) {
      console.error('Failed to mark notification as read', err);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await axiosInstance.post('/notifications/read-all');
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    } catch (err) {
      console.error('Failed to mark all notifications as read', err);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getInitials = (email) => {
    if (!email) return 'U';
    return email.substring(0, 2).toUpperCase();
  };

  return (
    <header className="h-16 bg-white flex items-center justify-between px-4 sm:px-6 lg:px-8 z-10 sticky top-0 transition-all duration-300">
      <div className="flex-1 flex items-center gap-3">
        {/* Sidebar Toggle Button */}
        <button
          onClick={toggleSidebar}
          className="p-2 text-gray-500 cursor-pointer hover:text-blue-800 hover:bg-blue-100 rounded-lg hover:shadow transition-colors"
          title="Toggle sidebar"
        >
          <svg className="w-5 h-5" fill="blue" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        {/* Breadcrumbs or Page Title could go here */}
        <h2 className="text-lg font-semibold text-gray-800 hidden sm:block">Welcome back <span className='font-bold  bg-gradient-to-br from-cyan-500 via-blue-700 to-blue-800 text-transparent bg-clip-text'>{user?.name} </span> </h2>
      </div>

      <div className="flex items-center space-x-4">
        {/* Notification Bell */}
        <div className="relative animate-in fade-in duration-300" ref={bellRef}>
          <button
            onClick={() => setIsBellOpen(!isBellOpen)}
            className="p-2 text-gray-400 cursor-pointer hover:text-blue-800 hover:bg-blue-50 rounded-full transition-all duration-200 relative hover:shadow-sm"
            title="Notifications"
          >
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 bg-red-500 text-white text-[9px] font-bold rounded-full w-4 h-4 flex items-center justify-center border-2 border-white shadow-sm animate-pulse">
                {unreadCount}
              </span>
            )}
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
          </button>

          {/* Notifications Dropdown */}
          {isBellOpen && (
            <div className="absolute right-0 mt-3 w-80 sm:w-96 bg-white rounded-2xl shadow-xl border border-slate-100 py-1.5 z-50 overflow-hidden transform origin-top-right transition-all animate-in fade-in slide-in-from-top-2 duration-200">
              {/* Header */}
              <div className="px-4 py-2.5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                <span className="text-xs font-bold text-slate-800 tracking-wide">Notifications</span>
                {unreadCount > 0 && (
                  <button
                    onClick={handleMarkAllAsRead}
                    className="text-[10px] font-bold text-blue-600 hover:text-blue-800 cursor-pointer transition-colors"
                  >
                    Mark all as read
                  </button>
                )}
              </div>

              {/* List */}
              <div className="max-h-80 overflow-y-auto divide-y divide-slate-50 scrollbar-thin">
                {notifications.length === 0 ? (
                  <div className="py-10 text-center px-4 flex flex-col items-center">
                    <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mb-2">
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                      </svg>
                    </div>
                    <span className="text-xs font-semibold text-slate-700">No notifications yet</span>
                    <span className="text-[10px] text-slate-400 mt-0.5">We'll alert you when updates happen!</span>
                  </div>
                ) : (
                  notifications.map((n) => {
                    const isTicketCreated = n.type === 'ticket.created';
                    return (
                      <div
                        key={n.id}
                        onClick={() => handleMarkAsRead(n.id, n.ticketId)}
                        className={`px-4 py-3 flex items-start gap-3 hover:bg-slate-50 cursor-pointer transition-colors duration-150 ${!n.isRead ? 'bg-blue-50/20' : ''}`}
                      >
                        {/* Icon */}
                        <div className="flex-shrink-0 pt-0.5">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center border shadow-sm ${
                            isTicketCreated 
                              ? 'bg-amber-50 text-amber-600 border-amber-100'
                              : 'bg-emerald-50 text-emerald-600 border-emerald-100'
                          }`}>
                            {isTicketCreated ? (
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                              </svg>
                            ) : (
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                            )}
                          </div>
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-1">
                            <span className="text-[11px] font-bold text-slate-800 truncate leading-snug">
                              {n.title}
                            </span>
                            {!n.isRead && (
                              <span className="w-1.5 h-1.5 bg-blue-600 rounded-full flex-shrink-0"></span>
                            )}
                          </div>
                          <p className="text-[10px] text-slate-500 truncate mt-0.5 leading-snug">
                            {n.message}
                          </p>
                          <span className="text-[9px] text-slate-400 mt-1 block">
                            {formatTimeAgo(n.createdAt)}
                          </span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}
        </div>

        {/* Profile Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center border border-slate-100 cursor-pointer space-x-3 focus:outline-none p-1 rounded-full hover:bg-gray-50 transition-colors"
          >
            <div className='rounded-full p-1 bg-blue-50 '>
              <div className="w-8 h-8  rounded-full  bg-white flex items-center justify-center text-blue-800 font-bold shadow text-xs cursor-pointer">
                {getInitials(user?.email)}
              </div>
            </div>
            <div className="hidden md:block text-left">
              <p className="text-sm font-medium text-gray-700">{user?.email}</p>
              <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
            </div>
            <svg className={`w-4 h-4 text-gray-400 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {/* Dropdown Menu */}
          {isDropdownOpen && (
            <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-100 py-2 transform origin-top-right transition-all animate-in fade-in slide-in-from-top-2">
              <div className="px-4 py-3 border-b border-gray-100 bg-gray-50/50">
                <p className="text-sm font-medium text-gray-900 truncate">{user?.email}</p>
                <p className="text-xs text-gray-500 mt-0.5 capitalize flex items-center">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500 mr-1.5"></span>
                  {user?.role} Role
                </p>
              </div>

              <div className="py-1">
                <button className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center">
                  <svg className="w-4 h-4 mr-3 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  Profile Details
                </button>
                <button className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center">
                  <svg className="w-4 h-4 mr-3 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  Settings
                </button>
              </div>

              <div className="py-1 border-t border-gray-100">
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 hover:text-red-700 flex items-center font-medium transition-colors"
                >
                  <svg className="w-4 h-4 mr-3 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  Logout
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
