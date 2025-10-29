import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '@/lib/api';
import { toast } from 'sonner';

interface User {
  _id: string;
  name: string;
  email: string;
  avatar?: string;
  avatarUrl?: string;
  emailVerified: boolean;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (data: Partial<User>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Load user from localStorage on mount
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const accessToken = localStorage.getItem('accessToken');

    if (storedUser && accessToken) {
      setUser(JSON.parse(storedUser));
      fetchCurrentUser(); // Verify token is still valid
    }

    setLoading(false);
  }, []);

  const fetchCurrentUser = async () => {
    try {
      const { data } = await api.get('/auth/me');
      // Backend returns { success, data: { user } }
      setUser(data.data.user);
      localStorage.setItem('user', JSON.stringify(data.data.user));
    } catch (error) {
      console.error('Failed to fetch current user:', error);
      logout();
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const { data } = await api.post('/auth/login', { email, password });

      // Correct destructuring to match backend response
      const { user, tokens } = data.data;

      localStorage.setItem('accessToken', tokens.accessToken);
      localStorage.setItem('refreshToken', tokens.refreshToken);
      localStorage.setItem('user', JSON.stringify(user));

      setUser(user);
      toast.success(`Welcome back, ${user.name}!`);
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Login failed';
      toast.error(errorMessage);
      throw error;
    }
  };

  const register = async (name: string, email: string, password: string) => {
    try {
      const { data } = await api.post('/auth/register', { name, email, password });

      // Correct destructuring to match backend response
      const { user, tokens } = data.data;

      localStorage.setItem('accessToken', tokens.accessToken);
      localStorage.setItem('refreshToken', tokens.refreshToken);
      localStorage.setItem('user', JSON.stringify(user));

      setUser(user);
      toast.success('Account created successfully! Please verify your email.');
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Registration failed';
      toast.error(errorMessage);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
      setUser(null);
      toast.success('Logged out successfully');
    }
  };

  const updateProfile = async (data: Partial<User>) => {
    try {
      const response = await api.patch('/auth/profile', data);
      const updatedUser = response.data.data.user;

      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
      toast.success('Profile updated successfully');
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to update profile';
      toast.error(errorMessage);
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};