import { create } from 'zustand';
import { UserSummary } from '@/types';

interface UserState {
  users: UserSummary[];
  loading: boolean;
  error: string | null;
  fetchUsers: () => Promise<void>;
  updateUserRole: (id: string, role: string) => Promise<boolean>;
  deleteUser: (id: string) => Promise<boolean>;
  clearError: () => void;
}

export const useUserStore = create<UserState>((set) => ({
  users: [],
  loading: false,
  error: null,

  clearError: () => set({ error: null }),

  fetchUsers: async () => {
    set({ loading: true, error: null });
    try {
      const response = await fetch('/api/users');
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to fetch users');
      set({ users: data, loading: false });
    } catch (err) {
      set({ error: err instanceof Error ? err.message : 'Failed to fetch users', loading: false });
    }
  },

  updateUserRole: async (id, role) => {
    set({ loading: true, error: null });
    try {
      const response = await fetch(`/api/users/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to update user role');

      set((state) => ({
        users: state.users.map((u) => (u._id === id ? { ...u, role } : u)),
        loading: false,
      }));
      return true;
    } catch (err) {
      set({ error: err instanceof Error ? err.message : 'Failed to update user role', loading: false });
      return false;
    }
  },

  deleteUser: async (id) => {
    set({ loading: true, error: null });
    try {
      const response = await fetch(`/api/users/${id}`, {
        method: 'DELETE',
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to delete user');

      set((state) => ({
        users: state.users.filter((u) => u._id !== id),
        loading: false,
      }));
      return true;
    } catch (err) {
      set({ error: err instanceof Error ? err.message : 'Failed to delete user', loading: false });
      return false;
    }
  },
}));
