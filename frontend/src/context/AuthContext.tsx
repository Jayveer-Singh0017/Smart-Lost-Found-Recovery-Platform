import React, { createContext, useContext, useState, useEffect } from 'react';
import { AuthResponse, UserProfileDto } from '../types';
import { authService } from '../services/authService';

interface AuthContextType {
  user: AuthResponse | null;
  profile: UserProfileDto | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: { fullName: string; email: string; password: string; phoneNumber?: string }) => Promise<void>;
  logout: () => void;
  refreshProfile: () => Promise<void>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthResponse | null>(() => {
    const saved = localStorage.getItem('user');
    return saved ? JSON.parse(saved) : null;
  });
  const [profile, setProfile] = useState<UserProfileDto | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchProfile = async () => {
    try {
      const p = await authService.getCurrentUser();
      setProfile(p);
    } catch {
      setProfile(null);
    }
  };

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          await fetchProfile();
        } catch {
          logout();
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email: string, password: string) => {
    const authData = await authService.login({ email, password });
    localStorage.setItem('token', authData.token);
    localStorage.setItem('user', JSON.stringify(authData));
    setUser(authData);
    await fetchProfile();
  };

  const register = async (data: { fullName: string; email: string; password: string; phoneNumber?: string }) => {
    const authData = await authService.register(data);
    localStorage.setItem('token', authData.token);
    localStorage.setItem('user', JSON.stringify(authData));
    setUser(authData);
    await fetchProfile();
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setProfile(null);
  };

  const refreshProfile = async () => {
    await fetchProfile();
  };

  const isAuthenticated = !!user;
  const isAdmin = user?.role === 'ROLE_ADMIN';

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        isAuthenticated,
        isAdmin,
        login,
        register,
        logout,
        refreshProfile,
        loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
