import React, { createContext, useState, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { authService } from '../services/authService';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const queryClient = useQueryClient();

  useEffect(() => {
    const currentUser = authService.getCurrentUser();
    if (currentUser) setUser(currentUser);
    setLoading(false);
  }, []);

  const login = async (credentials, role) => {
    const data = role === 'employer' 
      ? await authService.loginEmployer(credentials)
      : await authService.loginStudent(credentials);
    setUser(data.user);
    queryClient.clear();
    return data;
  };

  const register = async (userData, role) => {
    const data = role === 'employer'
      ? await authService.registerEmployer(userData)
      : await authService.registerStudent(userData);
    setUser(data.user);
    queryClient.clear();
    return data;
  };

  const logout = () => {
    authService.logout();
    setUser(null);
    queryClient.clear();
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};