import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import type { ReactNode } from 'react';
import type { User, SignUpPayload, SignInPayload } from '../types';
import * as api from '../api/client';
import toast from 'react-hot-toast';

interface AuthContextValue {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  signIn: (payload: SignInPayload) => Promise<void>;
  signUp: (payload: SignUpPayload) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Hydrate session on mount
  useEffect(() => {
    const stored = localStorage.getItem('user');
    const token = localStorage.getItem('access_token');
    if (stored && token) {
      try {
        setUser(JSON.parse(stored));
      } catch {
        localStorage.removeItem('user');
        localStorage.removeItem('access_token');
      }
    }
    setIsLoading(false);
  }, []);

  const persistSession = useCallback((token: string, usr: User) => {
    localStorage.setItem('access_token', token);
    localStorage.setItem('user', JSON.stringify(usr));
    setUser(usr);
  }, []);

  const handleSignIn = useCallback(
    async (payload: SignInPayload) => {
      const res = await api.signIn(payload);
      persistSession(res.accessToken, res.user);
      toast.success(`Welcome back, ${res.user.name}!`);
    },
    [persistSession],
  );

  const handleSignUp = useCallback(
    async (payload: SignUpPayload) => {
      const res = await api.signUp(payload);
      persistSession(res.accessToken, res.user);
      toast.success('Account created successfully!');
    },
    [persistSession],
  );

  const logout = useCallback(() => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('user');
    setUser(null);
    toast.success('Signed out');
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isLoading,
      isAuthenticated: !!user,
      signIn: handleSignIn,
      signUp: handleSignUp,
      logout,
    }),
    [user, isLoading, handleSignIn, handleSignUp, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
