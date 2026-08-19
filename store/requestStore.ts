import { create } from 'zustand';
import { ResourceRequest } from '@/types';

type CreateRequestData = {
  name: string;
  type: 'server' | 'database' | 'service' | 'container';
  specs: {
    cpu: number;
    ram: number;
    region: string;
  };
  environment: string;
  purpose: string;
  duration: number;
};

interface RequestState {
  requests: ResourceRequest[];
  loading: boolean;
  error: string | null;
  fetchRequests: () => Promise<void>;
  createRequest: (requestData: CreateRequestData) => Promise<boolean>;
  resolveRequest: (id: string, status: 'approved' | 'rejected', comments?: string) => Promise<boolean>;
  clearError: () => void;
}

export const useRequestStore = create<RequestState>((set) => ({
  requests: [],
  loading: false,
  error: null,

  clearError: () => set({ error: null }),

  fetchRequests: async () => {
    set({ loading: true, error: null });
    try {
      const response = await fetch('/api/requests');
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to fetch requests');
      set({ requests: data, loading: false });
    } catch (err) {
      set({ error: err instanceof Error ? err.message : 'Failed to fetch requests', loading: false });
    }
  },

  createRequest: async (requestData) => {
    set({ loading: true, error: null });
    try {
      const response = await fetch('/api/requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestData),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to submit request');

      set((state) => ({
        requests: [data, ...state.requests],
        loading: false,
      }));
      return true;
    } catch (err) {
      set({ error: err instanceof Error ? err.message : 'Failed to submit request', loading: false });
      return false;
    }
  },

  resolveRequest: async (id, status, comments) => {
    set({ loading: true, error: null });
    try {
      const response = await fetch(`/api/requests/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, comments }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to resolve request');

      set((state) => ({
        requests: state.requests.map((r) => (r._id === id ? data.request : r)),
        loading: false,
      }));
      return true;
    } catch (err) {
      set({ error: err instanceof Error ? err.message : 'Failed to resolve request', loading: false });
      return false;
    }
  },
}));
