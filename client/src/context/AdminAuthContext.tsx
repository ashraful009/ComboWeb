import React, { createContext, useContext, useState, useEffect } from 'react';
import { apiClient } from '../api/client';

interface AdminAuthContextType {
  isAuthenticated: boolean;
  username: string | null;
  login: (u: string, p: string) => Promise<void>;
  logout: () => void;
  loading: boolean;
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined);

export const AdminAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await apiClient<{ username: string }>('/admin/me');
        setIsAuthenticated(true);
        setUsername(res.username);
      } catch (error) {
        setIsAuthenticated(false);
        setUsername(null);
      } finally {
        setLoading(false);
      }
    };
    checkAuth();
  }, []);

  const login = async (user: string, pass: string) => {
    await apiClient('/admin/login', {
      method: 'POST',
      body: JSON.stringify({ username: user, password: pass })
    });
    setIsAuthenticated(true);
    setUsername(user);
  };

  const logout = async () => {
    try {
      await apiClient('/admin/logout', { method: 'POST' });
    } catch (error) {
      console.error(error);
    }
    setIsAuthenticated(false);
    setUsername(null);
  };

  return (
    <AdminAuthContext.Provider value={{ isAuthenticated, username, login, logout, loading }}>
      {children}
    </AdminAuthContext.Provider>
  );
};

export const useAdminAuth = () => {
  const context = useContext(AdminAuthContext);
  if (!context) throw new Error('useAdminAuth must be used within AdminAuthProvider');
  return context;
};
