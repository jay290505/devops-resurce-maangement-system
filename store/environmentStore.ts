import { create } from 'zustand';
import { Environment } from '@/types';

type CreateEnvironmentData = Omit<Environment, '_id' | 'createdAt' | 'updatedAt' | 'createdBy'>;
type UpdateEnvironmentData = Partial<CreateEnvironmentData>;

interface EnvironmentState {
  environments: Environment[];
  loading: boolean;
  error: string | null;
  fetchEnvironments: () => Promise<void>;
  createEnvironment: (envData: CreateEnvironmentData) => Promise<boolean>;
  updateEnvironment: (id: string, envData: UpdateEnvironmentData) => Promise<boolean>;
  deleteEnvironment: (id: string) => Promise<boolean>;
  clearError: () => void;
}

export const useEnvironmentStore = create<EnvironmentState>((set) => ({
  environments: [],
  loading: false,
  error: null,

  clearError: () => set({ error: null }),

  fetchEnvironments: async () => {
    set({ loading: true, error: null });
    try {
      const response = await fetch('/api/environments');
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to fetch environments');
      set({ environments: data, loading: false });
    } catch (err) {
      set({ error: err instanceof Error ? err.message : 'Failed to fetch environments', loading: false });
    }
  },

  createEnvironment: async (envData) => {
    set({ loading: true, error: null });
    try {
      const response = await fetch('/api/environments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(envData),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to create environment');

      set((state) => ({
        environments: [data, ...state.environments],
        loading: false,
      }));
      return true;
    } catch (err) {
      set({ error: err instanceof Error ? err.message : 'Failed to create environment', loading: false });
      return false;
    }
  },

  updateEnvironment: async (id, envData) => {
    set({ loading: true, error: null });
    try {
      const response = await fetch(`/api/environments/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(envData),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to update environment');

      set((state) => ({
        environments: state.environments.map((e) => (e._id === id ? data : e)),
        loading: false,
      }));
      return true;
    } catch (err) {
      set({ error: err instanceof Error ? err.message : 'Failed to update environment', loading: false });
      return false;
    }
  },

  deleteEnvironment: async (id) => {
    set({ loading: true, error: null });
    try {
      const response = await fetch(`/api/environments/${id}`, {
        method: 'DELETE',
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to delete environment');

      set((state) => ({
        environments: state.environments.filter((e) => e._id !== id),
        loading: false,
      }));
      return true;
    } catch (err) {
      set({ error: err instanceof Error ? err.message : 'Failed to delete environment', loading: false });
      return false;
    }
  },
}));
