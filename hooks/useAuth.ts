import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { authService } from '@/services';

interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'devops_engineer' | 'project_manager' | 'viewer';
}

interface UseAuthReturn {
  user: UserProfile | null;
  loading: boolean;
  error: string;
  login: (email: string, password: string) => Promise<boolean>;
  register: (name: string, email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  fetchCurrentUser: () => Promise<void>;
  clearError: () => void;
}

export function useAuth(): UseAuthReturn {
  const router = useRouter();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const clearError = () => setError('');

  const fetchCurrentUser = async () => {
    setLoading(true);
    try {
      const data = await authService.getMe();
      setUser(data as UserProfile);
    } catch (err) {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  // Fetch current user on client initialization if logged in
  useEffect(() => {
    fetchCurrentUser();
  }, []);

  const login = async (email: string, password: string) => {
    setLoading(true);
    setError('');
    try {
      await authService.login(email, password);
      await fetchCurrentUser();
      router.push('/dashboard');
      router.refresh();
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to sign in');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const register = async (name: string, email: string, password: string) => {
    setLoading(true);
    setError('');
    try {
      await authService.register(name, email, password);
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create account');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
      setUser(null);
    } catch {
      // proceed regardless
    } finally {
      router.push('/login');
      router.refresh();
    }
  };

  return { user, loading, error, login, register, logout, fetchCurrentUser, clearError };
}
