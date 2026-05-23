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

  // Fetch /auth/me on mount to get freshest user state
  useEffect(() => {
    const initAuth = async () => {
      try {
        const res = await axiosInstance.get('/auth/me');
        const user = res.user;
        dispatch({ type: 'LOGIN', user });
      } catch (err) {
        // If unauthorized or network error, clear state
        dispatch({ type: 'LOGOUT' });
      }
    };
    initAuth();
  }, []);

  // Log user state changes for debugging
  useEffect(() => {
    if (state.user) {
      console.log('Current authenticated user:', state.user);
    }
  }, [state.user]);

  const login = (user) => {
    dispatch({ type: 'LOGIN', user });
  };

  const logout = async () => {
    try {
      await axiosInstance.post('/auth/logout');
    } catch (e) {
      // Ignore errors on logout
    }
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
