/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';
import { useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { axiosInstance } from '../lib/axios';

const SocketContext = createContext(null);

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:3000';

export function SocketProvider({ children }) {
  const { user, token } = useAuth();
  const [socket, setSocket] = useState(null);
  const [connected, setConnected] = useState(false);

  const queryClient = useQueryClient();

  useEffect(() => {
    if (!user || !token) {
      return;
    }

    const newSocket = io(SOCKET_URL, {
      auth: { token },
      reconnectionAttempts: 5,
      reconnectionDelay: 2000,
    });

    const handleConnect = () => {
      setSocket(newSocket);
      setConnected(true);
      
      const isAgent = user.roles?.some(r => r.code === 'AGENT' || r.code === 'ADMIN');
      const roleCode = isAgent ? 'agent' : 'employee';

      newSocket.emit('join', {
        role: roleCode,
        userId: user.id,
      });
    };

    const handleDisconnect = () => {
      setConnected(false);
    };

    const handleTicketCreated = (ticket) => {
      queryClient.invalidateQueries({ queryKey: ['tickets'] });
      
      const isAgent = user?.roles?.some(r => r.code === 'AGENT' || r.code === 'ADMIN');
      if (isAgent) {
        toast.custom((t) => (
          <div className={`${t.visible ? 'animate-enter' : 'animate-leave'} max-w-md w-full bg-white shadow-2xl rounded-2xl pointer-events-auto flex ring-1 ring-black ring-opacity-5 overflow-hidden border border-slate-100`}>
            <div className="flex-1 p-4">
              <div className="flex items-start">
                <div className="flex-shrink-0 pt-0.5">
                  <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 border border-indigo-100 shadow-sm animate-pulse">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.07 6.07 0 00-1-3.59M11 13H9m2-2H9m2 4H9m4 0h2m-2-2h2m-2 4h2M12 2A2 2 0 0010 4v.158c0 .538-.214 1.055-.595 1.436L4 11v5a2 2 0 002 2h12a2 2 0 002-2v-5l-5.405-5.405A2.032 2.032 0 0110 4.158V4c0-1.1.9-2 2-2z" />
                    </svg>
                  </div>
                </div>
                <div className="ml-3 flex-1">
                  <p className="text-xs font-semibold text-indigo-600 tracking-wide uppercase">New Ticket Raised ⚡</p>
                  <p className="text-sm font-bold text-slate-900 mt-0.5 truncate">{ticket.title}</p>
                  <p className="text-xs text-slate-500 mt-1 truncate">{ticket.description}</p>
                  
                  <div className="flex gap-2 mt-2">
                    <span className="bg-slate-100 text-slate-800 text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border border-slate-200">
                      {ticket.aiCategory || 'Other'}
                    </span>
                    <span className="bg-rose-50 text-rose-800 text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border border-rose-200">
                      {ticket.aiPriority || 'Medium'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex border-l border-slate-100 bg-slate-50 flex-col justify-center px-4 gap-2">
              <button
                type="button"
                onClick={() => {
                  toast.dismiss(t.id);
                  window.location.href = `/tickets/${ticket.id}`;
                }}
                className="w-full text-xs font-bold text-indigo-600 hover:text-indigo-800 hover:underline focus:outline-none py-1.5 px-2 rounded-md hover:bg-indigo-50 border border-transparent transition-colors"
              >
                View
              </button>
              <button
                type="button"
                onClick={() => toast.dismiss(t.id)}
                className="w-full text-[10px] font-semibold text-slate-400 hover:text-slate-600 focus:outline-none py-1 px-2 rounded hover:bg-slate-100 transition-colors"
              >
                Dismiss
              </button>
            </div>
          </div>
        ), { duration: 8000 });
      }
    };

    const handleTicketResolved = (ticket) => {
      queryClient.invalidateQueries({ queryKey: ['tickets'] });
      queryClient.invalidateQueries({ queryKey: ['metrics'] });

      const isEmployee = user?.roles?.some(r => r.code === 'EMPLOYEE');
      if (isEmployee) {
        toast.custom((t) => (
          <div className={`${t.visible ? 'animate-enter' : 'animate-leave'} max-w-md w-full bg-white shadow-2xl rounded-2xl pointer-events-auto flex ring-1 ring-black ring-opacity-5 overflow-hidden border border-slate-100`}>
            <div className="flex-1 p-4">
              <div className="flex items-start">
                <div className="flex-shrink-0 pt-0.5">
                  <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600 border border-emerald-100 shadow-sm">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
                <div className="ml-3 flex-1">
                  <p className="text-xs font-semibold text-emerald-600 tracking-wide uppercase">Ticket Resolved 🎉</p>
                  <p className="text-sm font-bold text-slate-900 mt-0.5 truncate">{ticket.title}</p>
                  <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                    Response: {ticket.finalReply ? ticket.finalReply.replace(/<[^>]*>/g, '') : ''}
                  </p>
                </div>
              </div>
            </div>
            <div className="flex border-l border-slate-100 bg-slate-50 flex-col justify-center px-4 gap-2">
              <button
                type="button"
                onClick={() => {
                  toast.dismiss(t.id);
                  window.location.href = `/my-tickets`;
                }}
                className="w-full text-xs font-bold text-emerald-600 hover:text-emerald-800 hover:underline focus:outline-none py-1.5 px-2 rounded-md hover:bg-emerald-50 border border-transparent transition-colors"
              >
                View
              </button>
              <button
                type="button"
                onClick={() => toast.dismiss(t.id)}
                className="w-full text-[10px] font-semibold text-slate-400 hover:text-slate-600 focus:outline-none py-1 px-2 rounded hover:bg-slate-100 transition-colors"
              >
                Dismiss
              </button>
            </div>
          </div>
        ), { duration: 8000 });
      }
    };

    const handleNotificationReceived = (notification) => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });

      toast.custom((t) => (
        <div className={`${t.visible ? 'animate-enter' : 'animate-leave'} max-w-md w-full bg-white shadow-2xl rounded-2xl pointer-events-auto flex ring-1 ring-black ring-opacity-5 overflow-hidden border border-slate-100`}>
          <div className="flex-1 p-4">
            <div className="flex items-start">
              <div className="flex-shrink-0 pt-0.5">
                <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 border border-blue-100 shadow-sm animate-pulse">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                  </svg>
                </div>
              </div>
              <div className="ml-3 flex-1">
                <p className="text-xs font-semibold text-blue-600 tracking-wide uppercase">New Notification 🔔</p>
                <p className="text-sm font-bold text-slate-900 mt-0.5">{notification.title}</p>
                <p className="text-xs text-slate-500 mt-1 truncate">{notification.message}</p>
              </div>
            </div>
          </div>
          <div className="flex border-l border-slate-100 bg-slate-50 flex-col justify-center px-4 gap-2">
            <button
              type="button"
              onClick={() => {
                toast.dismiss(t.id);
                // Mark as read via axiosInstance
                axiosInstance.patch(`/notifications/${notification.id}/read`)
                  .then(() => {
                    queryClient.invalidateQueries({ queryKey: ['notifications'] });
                  })
                  .catch(err => console.error(err));

                // Navigate appropriately
                const isAgent = user?.roles?.some(r => r.code === 'AGENT' || r.code === 'ADMIN');
                if (isAgent) {
                  window.location.href = `/tickets/${notification.ticketId}`;
                } else {
                  window.location.href = `/my-tickets?ticketId=${notification.ticketId}`;
                }
              }}
              className="w-full text-xs font-bold text-blue-600 hover:text-blue-800 hover:underline focus:outline-none py-1.5 px-2 rounded-md hover:bg-blue-50 border border-transparent transition-colors"
            >
              View
            </button>
            <button
              type="button"
              onClick={() => toast.dismiss(t.id)}
              className="w-full text-[10px] font-semibold text-slate-400 hover:text-slate-600 focus:outline-none py-1 px-2 rounded hover:bg-slate-100 transition-colors"
            >
              Dismiss
            </button>
          </div>
        </div>
      ), { duration: 8000 });
    };

    newSocket.on('connect', handleConnect);
    newSocket.on('disconnect', handleDisconnect);
    newSocket.on('ticket:created', handleTicketCreated);
    newSocket.on('ticket:resolved', handleTicketResolved);
    newSocket.on('notification:received', handleNotificationReceived);

    return () => {
      newSocket.off('connect', handleConnect);
      newSocket.off('disconnect', handleDisconnect);
      newSocket.off('ticket:created', handleTicketCreated);
      newSocket.off('ticket:resolved', handleTicketResolved);
      newSocket.off('notification:received', handleNotificationReceived);
      newSocket.disconnect();
      setSocket(null);
      setConnected(false);
    };
  }, [user, token, queryClient]);

  const on = useCallback((event, handler) => {
    if (!socket) return () => {};
    socket.on(event, handler);
    return () => socket.off(event, handler);
  }, [socket]);

  return (
    <SocketContext.Provider value={{ socket, connected, on }}>
      {children}
    </SocketContext.Provider>
  );
}

export function useSocket() {
  return useContext(SocketContext);
}
