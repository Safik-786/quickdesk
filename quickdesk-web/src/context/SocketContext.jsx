/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';

const SocketContext = createContext(null);

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:3000';

export function SocketProvider({ children }) {
  const { user, token } = useAuth();
  const [socket, setSocket] = useState(null);
  const [connected, setConnected] = useState(false);

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
      newSocket.emit('join', {
        role: user.role || user.legacyRole,
        userId: user.id,
      });
    };

    const handleDisconnect = () => {
      setConnected(false);
    };

    newSocket.on('connect', handleConnect);
    newSocket.on('disconnect', handleDisconnect);

    return () => {
      newSocket.off('connect', handleConnect);
      newSocket.off('disconnect', handleDisconnect);
      newSocket.disconnect();
      setSocket(null);
      setConnected(false);
    };
  }, [user, token]);

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
