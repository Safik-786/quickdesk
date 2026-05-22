/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useReducer, useEffect } from 'react';

const AuthContext = createContext(null);

const initialState = {
  user: null,
  token: null,
  isLoading: true,
};

function authReducer(state, action) {
  switch (action.type) {
    case 'LOGIN':
      return { ...state, user: action.user, token: action.token, isLoading: false };
    case 'LOGOUT':
      return { ...state, user: null, token: null, isLoading: false };
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
    const token = localStorage.getItem('qd_token');
    const user = localStorage.getItem('qd_user');
    if (token && user) {
      dispatch({ type: 'LOGIN', token, user: JSON.parse(user) });
    } else {
      dispatch({ type: 'LOADED' });
    }
  }, []);

  const login = (token, user) => {
    localStorage.setItem('qd_token', token);
    localStorage.setItem('qd_user', JSON.stringify(user));
    dispatch({ type: 'LOGIN', token, user });
  };

  const logout = () => {
    localStorage.removeItem('qd_token');
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
