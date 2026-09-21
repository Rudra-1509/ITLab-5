import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import authApi from '../services/authApi';
import { getSocket, disconnectSocket } from '../socket/socket';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem('user');
      return savedUser ? JSON.parse(savedUser) : null;
    } catch {
      return null;
    }
  });

  const [token, setToken] = useState(() => localStorage.getItem('token') || null);
  const [loading, setLoading] = useState(true);

  // Sync token & user helper
  const storeAuth = (newToken, newUser) => {
    setToken(newToken);
    setUser(newUser);
    if (newToken) {
      localStorage.setItem('token', newToken);
      getSocket(newToken);
    } else {
      localStorage.removeItem('token');
    }
    if (newUser) {
      localStorage.setItem('user', JSON.stringify(newUser));
    } else {
      localStorage.removeItem('user');
    }
  };

  /**
   * Refreshes user details from GET /api/auth/me
   */
  const refreshUser = useCallback(async () => {
    const currentToken = localStorage.getItem('token');
    if (!currentToken) {
      setUser(null);
      setToken(null);
      return null;
    }

    try {
      const response = await authApi.getMe();
      if (response?.data?.user) {
        setUser(response.data.user);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        return response.data.user;
      }
    } catch (err) {
      console.warn('Failed to refresh user profile:', err?.response?.data || err.message);
      // If 401 Unauthorized, token is expired
      if (err?.response?.status === 401) {
        logout();
      }
    }
    return null;
  }, []);

  // Validate on app load
  useEffect(() => {
    let isMounted = true;

    async function initAuth() {
      const savedToken = localStorage.getItem('token');
      if (savedToken) {
        getSocket(savedToken);
        try {
          const response = await authApi.getMe();
          if (isMounted && response?.data?.user) {
            setUser(response.data.user);
            localStorage.setItem('user', JSON.stringify(response.data.user));
          }
        } catch (err) {
          if (err?.response?.status === 401 && isMounted) {
            logout();
          }
        }
      }
      if (isMounted) setLoading(false);
    }

    initAuth();

    return () => {
      isMounted = false;
    };
  }, []);

  /**
   * Login user
   */
  const login = async (email, password) => {
    const response = await authApi.login(email, password);
    const { token: receivedToken, user: receivedUser } = response.data;
    storeAuth(receivedToken, receivedUser);
    return receivedUser;
  };

  /**
   * Register user
   */
  const register = async (username, email, password) => {
    const response = await authApi.register(username, email, password);
    const { token: receivedToken, user: receivedUser } = response.data;
    storeAuth(receivedToken, receivedUser);
    return receivedUser;
  };

  /**
   * Logout user
   */
  const logout = () => {
    disconnectSocket();
    storeAuth(null, null);
  };

  const value = {
    user,
    token,
    loading,
    login,
    register,
    logout,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export default AuthContext;
