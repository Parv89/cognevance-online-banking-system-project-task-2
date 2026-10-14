import React, { createContext, useContext, useState, useEffect } from 'react';
import { api, getStoredUser, getAuthToken, setAuthSession, clearAuthSession } from '../api/client';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(getStoredUser());
  const [token, setToken] = useState(getAuthToken());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const verifyAuth = async () => {
      const storedToken = getAuthToken();
      if (!storedToken) {
        setLoading(false);
        return;
      }
      try {
        const response = await api.getMe();
        if (response.success && response.data) {
          const currentUser = getStoredUser();
          setUser({ ...currentUser, ...response.data });
        }
      } catch (err) {
        console.warn('Session verification failed, clearing credentials:', err.message);
        clearAuthSession();
        setUser(null);
        setToken(null);
      } finally {
        setLoading(false);
      }
    };

    verifyAuth();
  }, []);

  const login = async (username, password) => {
    const response = await api.login({ username, password });
    if (response.success && response.data) {
      const data = response.data;
      const userInfo = {
        userId: data.userId,
        username: data.username,
        email: data.email,
        fullName: data.fullName,
        role: data.role,
        primaryAccountId: data.primaryAccountId,
        primaryAccountNumber: data.primaryAccountNumber,
      };
      setAuthSession(data.token, userInfo);
      setToken(data.token);
      setUser(userInfo);
      return data;
    }
    throw new Error(response.message || 'Login failed');
  };

  const register = async (userData) => {
    const response = await api.register(userData);
    if (response.success && response.data) {
      const data = response.data;
      const userInfo = {
        userId: data.userId,
        username: data.username,
        email: data.email,
        fullName: data.fullName,
        role: data.role,
        primaryAccountId: data.primaryAccountId,
        primaryAccountNumber: data.primaryAccountNumber,
      };
      setAuthSession(data.token, userInfo);
      setToken(data.token);
      setUser(userInfo);
      return data;
    }
    throw new Error(response.message || 'Registration failed');
  };

  const logout = () => {
    clearAuthSession();
    setUser(null);
    setToken(null);
  };

  const isAuthenticated = !!token && !!user;

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        isAuthenticated,
        login,
        register,
        logout,
        setUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
