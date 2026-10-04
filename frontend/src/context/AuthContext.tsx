import React, { createContext, useContext, useEffect, useState } from 'react';
import { loginModerator } from '../services/api';
import { LoginResponseData } from '../types';

interface AuthContextType {
  token: string | null;
  username: string | null;
  role: string | null;
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<LoginResponseData>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('whistledrop_token'));
  const [username, setUsername] = useState<string | null>(() => localStorage.getItem('whistledrop_user'));
  const [role, setRole] = useState<string | null>(() => localStorage.getItem('whistledrop_role'));

  const logout = () => {
    localStorage.removeItem('whistledrop_token');
    localStorage.removeItem('whistledrop_user');
    localStorage.removeItem('whistledrop_role');
    setToken(null);
    setUsername(null);
    setRole(null);
  };

  useEffect(() => {
    const handleAuthExpired = () => {
      logout();
    };

    window.addEventListener('whistledrop_auth_expired', handleAuthExpired);
    return () => {
      window.removeEventListener('whistledrop_auth_expired', handleAuthExpired);
    };
  }, []);

  const login = async (user: string, pass: string): Promise<LoginResponseData> => {
    const res = await loginModerator(user, pass);
    localStorage.setItem('whistledrop_token', res.token);
    localStorage.setItem('whistledrop_user', res.username);
    localStorage.setItem('whistledrop_role', res.role);
    setToken(res.token);
    setUsername(res.username);
    setRole(res.role);
    return res;
  };

  return (
    <AuthContext.Provider
      value={{
        token,
        username,
        role,
        isAuthenticated: !!token,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
