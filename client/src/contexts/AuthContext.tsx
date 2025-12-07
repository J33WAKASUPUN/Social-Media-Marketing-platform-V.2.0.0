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
  provider: 'local' | 'google';
  createdAt: string;
  updatedAt: string;
}

interface LoginResult {
  requires2FA: boolean;
  userId?: string;
  twoFactorMethod?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
  login: (email: string, password: string) => Promise<LoginResult>;
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
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
      } catch (error) {
        console.error('Failed to parse stored user:', error);
        localStorage.removeItem('user');
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
      }
    }

    setLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<LoginResult> => {
    try {
      const response = await api.post('/auth/login', { email, password });
      const { data } = response.data;

      // Check if 2FA is required
      if (data.requires2FA) {
        return {
          requires2FA: true,
          userId: data.userId,
          twoFactorMethod: data.twoFactorMethod,
        };
      }

      // Normal login - store tokens and user
      localStorage.setItem('accessToken', data.tokens.accessToken);
      localStorage.setItem('refreshToken', data.tokens.refreshToken);
      localStorage.setItem('user', JSON.stringify(data.user));
      setUser(data.user);

      return { requires2FA: false };
    } catch (error: any) {
      const message = error.response?.data?.message || 'Login failed';
      toast.error(message);
      throw error;
    }
  };

  const register = async (name: string, email: string, password: string) => {
    try {
      const { data } = await api.post('/auth/register', { name, email, password });

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
      localStorage.removeItem('currentOrganizationId');
      localStorage.removeItem('currentBrandId');
      setUser(null);
      toast.success('Logged out successfully');
    }
  };

  // FIXED: Only call API when updating profile fields, not when passing full user object
  const updateProfile = async (data: Partial<User>) => {
    try {
      // If data contains only name/timezone, call API
      if ('name' in data || 'timezone' in data) {
        const response = await api.patch('/auth/profile', data);
        const updatedUser = response.data.data.user;
        
        setUser(updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser));
        toast.success('Profile updated successfully');
      } 
      // If full user object is passed (from avatar upload), just update state
      else if ('_id' in data) {
        setUser(data as User);
        localStorage.setItem('user', JSON.stringify(data));
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to update profile';
      toast.error(errorMessage);
      throw error;
    }
  };

  const isAuthenticated = !!(user && localStorage.getItem('accessToken'));

  return (
    <AuthContext.Provider value={{ user, loading, isAuthenticated, setUser, login, register, logout, updateProfile }}>
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