import React, { createContext, useEffect, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { authService } from '../services/authService';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const queryClient = useQueryClient();

  useEffect(() => {
    const currentUser = authService.getCurrentUser();
    if (currentUser) {
      setUser(currentUser);
    }
    setIsLoading(false);
  }, []);

  const login = async (credentials, role = 'student') => {
    const data = role === 'employer'
      ? await authService.loginEmployer(credentials)
      : await authService.loginStudent(credentials);
    setUser(data.user);
    queryClient.clear();
    return data;
  };

  const register = async (userData, role = 'student') => {
    const data = role === 'employer'
      ? await authService.registerEmployer(userData)
      : await authService.registerStudent(userData);
    setUser(data.user);
    queryClient.clear();
    return data;
  };

  const registerStudent = (userData) => register(userData, 'student');
  const registerEmployer = (userData) => register(userData, 'employer');

  const logout = () => {
    authService.logout();
    setUser(null);
    queryClient.clear();
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, loading: isLoading, login, register, registerStudent, registerEmployer, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = React.useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};