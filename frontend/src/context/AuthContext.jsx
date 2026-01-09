import React, { createContext, useContext, useState } from 'react'
import api from '../services/api'

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const token = localStorage.getItem('token');
  let user = null;
  try {
    user = token ? JSON.parse(localStorage.getItem('user')) : null;
  } catch (e) {
    console.error('Failed to parse user from local storage', e);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
  }
  const [stateUser, setStateUser] = useState(user);

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    const { token, user } = res.data;
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    setStateUser(user);
    return user;
  };

  const logout = () => { localStorage.removeItem('token'); localStorage.removeItem('user'); setStateUser(null); };

  const updateUser = (userData) => {
    localStorage.setItem('user', JSON.stringify(userData));
    setStateUser(userData);
  };

  return <AuthContext.Provider value={{ user: stateUser, login, logout, updateUser }}>{children}</AuthContext.Provider>
}

export const useAuth = () => useContext(AuthContext)
