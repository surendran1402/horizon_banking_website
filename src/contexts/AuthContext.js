import React, { createContext, useContext, useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for existing session on app load
    const savedUser = localStorage.getItem('horizon_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      // Check if user already exists in localStorage
      const existingUsers = JSON.parse(localStorage.getItem('horizon_users') || '[]');
      let existingUser = existingUsers.find(user => user.email === email);
      
      if (existingUser) {
        // User exists, restore their session
        setUser(existingUser);
        localStorage.setItem('horizon_user', JSON.stringify(existingUser));
        return { success: true, user: existingUser };
      } else {
        // Create new user
        const mockUser = {
          id: uuidv4(),
          email,
          name: email.split('@')[0],
          customerId: `CUST_${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
          publicUrl: `https://horizon.bank/user/${Math.random().toString(36).substr(2, 9)}`,
          createdAt: new Date().toISOString(),
          bankAccounts: [],
          transactions: []
        };

        // Save to users list
        const updatedUsers = [...existingUsers, mockUser];
        localStorage.setItem('horizon_users', JSON.stringify(updatedUsers));
        
        setUser(mockUser);
        localStorage.setItem('horizon_user', JSON.stringify(mockUser));
        return { success: true, user: mockUser };
      }
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const register = async (email, password, confirmPassword) => {
    try {
      if (password !== confirmPassword) {
        throw new Error('Passwords do not match');
      }

      if (password.length < 8) {
        throw new Error('Password must be at least 8 characters long');
      }

      // Check if user already exists
      const existingUsers = JSON.parse(localStorage.getItem('horizon_users') || '[]');
      const existingUser = existingUsers.find(user => user.email === email);
      
      if (existingUser) {
        return { success: false, error: 'User with this email already exists' };
      }

      // Create new user
      const mockUser = {
        id: uuidv4(),
        email,
        name: email.split('@')[0],
        customerId: `CUST_${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
        publicUrl: `https://horizon.bank/user/${Math.random().toString(36).substr(2, 9)}`,
        createdAt: new Date().toISOString(),
        bankAccounts: [],
        transactions: []
      };

      // Save to users list
      const updatedUsers = [...existingUsers, mockUser];
      localStorage.setItem('horizon_users', JSON.stringify(updatedUsers));
      
      setUser(mockUser);
      localStorage.setItem('horizon_user', JSON.stringify(mockUser));
      return { success: true, user: mockUser };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('horizon_user');
  };

  const updateUser = (updatedUser) => {
    setUser(updatedUser);
    localStorage.setItem('horizon_user', JSON.stringify(updatedUser));
    
    // Also update the user in the users list
    if (updatedUser) {
      const existingUsers = JSON.parse(localStorage.getItem('horizon_users') || '[]');
      const updatedUsers = existingUsers.map(user => 
        user.id === updatedUser.id ? updatedUser : user
      );
      localStorage.setItem('horizon_users', JSON.stringify(updatedUsers));
    }
  };

  const value = {
    user,
    login,
    register,
    logout,
    updateUser,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}; 