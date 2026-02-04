import { createContext, useContext, useState, type ReactNode } from 'react';
import type { User } from '../types';
import { getToken, getUser, saveAuth, clearAuth as clearStorage, isAuthenticated as checkAuth } from '../store/auth';
import { api } from '../api';
import type { LoginRequest, RegisterRequest } from '../types';

interface AuthContextValue {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (req: LoginRequest) => Promise<void>;
  register: (req: RegisterRequest) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(getUser);
  const [token, setToken] = useState<string | null>(getToken);

  const login = async (req: LoginRequest) => {
    const res = await api.login(req);
    saveAuth(res.token, res.user);
    setToken(res.token);
    setUser(res.user);
  };

  const register = async (req: RegisterRequest) => {
    await api.register(req);
  };

  const logout = () => {
    // Best-effort remote logout; even if it fails, clear local state.
    api.logout().catch(() => undefined);
    clearStorage();
    setToken(null);
    setUser(null);
  };

  const refreshUser = async () => {
    try {
      const u = await api.getMe();
      saveAuth(token!, u);
      setUser(u);
    } catch {
      // ignore
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: checkAuth(),
        login,
        register,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return ctx;
}
