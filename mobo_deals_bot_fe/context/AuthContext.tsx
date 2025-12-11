import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '../types';
// import { authAPI } from '../services/mockBackend';
import { authAPI } from '@/services/apiBackend';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, pass: string) => Promise<void>;
  register: (name: string, email: string, mobile: string, pass: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check local storage for session persistence
    const storedUser = localStorage.getItem('shopgenie_session');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, pass: string) => {
    const loggedInUser = await authAPI.login(email, pass);
    console.log("User details : " , loggedInUser);
    setUser(loggedInUser);
    localStorage.setItem('shopgenie_session', JSON.stringify(loggedInUser));
  };

  const register = async (name: string, email: string, mobile: string, pass: string) => {
    const newUser = await authAPI.register(name, email, mobile, pass);
    setUser(newUser);
    localStorage.setItem('shopgenie_session', JSON.stringify(newUser));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('shopgenie_session');
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, login, register, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};