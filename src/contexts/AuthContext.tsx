'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';

interface User {
  _id: string;
  email: string;
  fullName: string;
  role: 'user' | 'admin';
  phone?: string;
  address?: string;
  isVerified: boolean;
  createdAt?: string;
  updatedAt?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<{success: boolean, error?: string}>;
  register: (email: string, password: string, fullName: string, phone?: string, address?: string) => Promise<boolean>;
  logout: () => Promise<void>;
  fetchUser: () => Promise<void>;
  verifyOtp: (email: string, otp: string) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUser = async () => {
    setLoading(true);
    try {
      if (process.env.NODE_ENV === 'development') {
        console.log('AuthContext - Fetching user data...');
      }
      const res = await fetch('/api/auth/me', { 
        credentials: 'include',
        headers: {
          'Cache-Control': 'no-cache'
        }
      });
      const data = await res.json();
      if (process.env.NODE_ENV === 'development') {
        console.log('/api/auth/me response:', res.status, data);
      }
      if (res.ok && data.user) {
        if (process.env.NODE_ENV === 'development') {
          console.log('AuthContext - Setting user:', data.user);
        }
        setUser(data.user);
      } else {
        // Only log 401s in development
        if (res.status !== 401 || process.env.NODE_ENV === 'development') {
          console.log('AuthContext - No user found, setting to null');
        }
        setUser(null);
      }
    } catch (e) {
      if (process.env.NODE_ENV === 'development') {
        console.log('AuthContext - Error fetching user:', e);
      }
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      console.log('AuthContext - Starting login for:', email);
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
        credentials: 'include',
      });
      
      const data = await res.json();
      console.log('AuthContext - Login response:', res.status, data);
      
      if (res.ok) {
        console.log('AuthContext - Login successful, fetching user data');
        // Wait a bit for the cookie to be set
        await new Promise(resolve => setTimeout(resolve, 100));
        await fetchUser();
        console.log('AuthContext - User data fetched, returning success');
        return { success: true };
      } else {
        console.log('AuthContext - Login failed:', data.error);
        return { success: false, error: data.error || 'Login failed' };
      }
    } catch (error) {
      console.log('AuthContext - Login error:', error);
      return { success: false, error: 'Network error' };
    } finally {
      setLoading(false);
    }
  };

  const register = async (email: string, password: string, fullName: string, phone?: string, address?: string) => {
    setLoading(true);
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, fullName, phone, address }),
      });
      if (res.ok) {
        return true;
      }
      return false;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      await fetch('/api/auth/logout', { 
        method: 'POST',
        credentials: 'include'
      });
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const verifyOtp = async (email: string, otp: string) => {
    setLoading(true);
    try {
      const res = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp }),
      });
      if (res.ok) {
        await fetchUser();
        return true;
      }
      return false;
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, fetchUser, verifyOtp }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}; 