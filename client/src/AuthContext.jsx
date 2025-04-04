import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  // Set auth token for axios requests
  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      localStorage.setItem('token', token);
    } else {
      delete axios.defaults.headers.common['Authorization'];
      localStorage.removeItem('token');
    }
  }, [token]);

  // Fetch user profile on initial load or token change
  useEffect(() => {
    const loadUser = async () => {
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const res = await axios.get('/api/auth/profile');
        setUser(res.data);
        setLoading(false);
      } catch (error) {
        console.error('Error loading user', error);
        // If token is invalid, clear it
        setToken(null);
        setLoading(false);
      }
    };

    loadUser();
  }, [token]);

  // Register a new user
  const register = async (userData) => {
    try {
      console.log('Registering user with data:', userData);
      const res = await axios.post('/api/auth/signup', userData);
      console.log('Registration response:', res.data);
      setToken(res.data.token);
      setUser(res.data.user);
      return res.data;
    } catch (error) {
      console.error('Registration error in context:', error);
      if (error.response) {
        throw error.response.data;
      } else {
        throw { message: error.message || 'Registration failed' };
      }
    }
  };

  // Login user
  const login = async (userData) => {
    try {
      console.log('Logging in user with email:', userData.email);
      const res = await axios.post('/api/auth/login', userData);
      console.log('Login response:', res.data);
      setToken(res.data.token);
      setUser(res.data.user);
      return res.data;
    } catch (error) {
      console.error('Login error in context:', error);
      if (error.response) {
        throw error.response.data;
      } else {
        throw { message: error.message || 'Login failed' };
      }
    }
  };

  // Logout user
  const logout = () => {
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        token,
        user,
        loading,
        register,
        login,
        logout,
        isAuthenticated: !!token
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}; 