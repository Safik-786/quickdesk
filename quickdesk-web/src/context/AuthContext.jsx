/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useReducer, useEffect } from 'react';
import { axiosInstance } from '../lib/axios';

const AuthContext = createContext(null);

const initialState = {
  user: null,
  isLoading: true,
};

function authReducer(state, action) {
  switch (action.type) {
    case 'LOGIN':
      return { ...state, user: action.user, isLoading: false };
    case 'LOGOUT':
      return { ...state, user: null, isLoading: false };
    case 'LOADED':
      return { ...state, isLoading: false };
    default:
      return state;
  }
}

export function AuthProvider({ children }) {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Rehydrate from localStorage on mount
  useEffect(() => {
    const user = localStorage.getItem('qd_user');
    if (user) {
      dispatch({ type: 'LOGIN', user: JSON.parse(user) });
    } else {
      dispatch({ type: 'LOADED' });
    }
  }, []);

  // Log user state changes for debugging
  useEffect(() => {
    if (state.user) {
      console.log('Current authenticated user:', state.user);
    }
  }, [state.user]);

  const login = (user) => {
    localStorage.setItem('qd_user', JSON.stringify(user));
    dispatch({ type: 'LOGIN', user });
  };

  const logout = async () => {
    try {
      await axiosInstance.post('/auth/logout');
    } catch (e) {
      // Ignore errors on logout
    }
    localStorage.removeItem('qd_user');
    dispatch({ type: 'LOGOUT' });
  };

  return (
    <AuthContext.Provider value={{ ...state, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
