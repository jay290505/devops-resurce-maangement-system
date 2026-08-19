import { create } from 'zustand';
import { Incident } from '@/types';

type CreateIncidentData = {
  title: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  resourceId: string;
  deploymentId?: string;
};

type UpdateIncidentData = {
  status?: 'open' | 'in_progress' | 'resolved' | 'closed';
  severity?: 'low' | 'medium' | 'high' | 'critical';
  description?: string;
};

interface IncidentState {
  incidents: Incident[];
  loading: boolean;
  error: string | null;
  fetchIncidents: () => Promise<void>;
  createIncident: (incidentData: CreateIncidentData) => Promise<boolean>;
  updateIncident: (id: string, incidentData: UpdateIncidentData) => Promise<boolean>;
  clearError: () => void;
}

export const useIncidentStore = create<IncidentState>((set) => ({
  incidents: [],
  loading: false,
  error: null,

  clearError: () => set({ error: null }),

  fetchIncidents: async () => {
    set({ loading: true, error: null });
    try {
      const response = await fetch('/api/incidents');
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to fetch incidents');
      set({ incidents: data, loading: false });
    } catch (err) {
      set({ error: err instanceof Error ? err.message : 'Failed to fetch incidents', loading: false });
    }
  },

  createIncident: async (incidentData) => {
    set({ loading: true, error: null });
    try {
      const response = await fetch('/api/incidents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(incidentData),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to create incident');

      set((state) => ({
        incidents: [data, ...state.incidents],
        loading: false,
      }));
      return true;
    } catch (err) {
      set({ error: err instanceof Error ? err.message : 'Failed to create incident', loading: false });
      return false;
    }
  },

  updateIncident: async (id, incidentData) => {
    set({ loading: true, error: null });
    try {
      const response = await fetch(`/api/incidents/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(incidentData),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to update incident');

      set((state) => ({
        incidents: state.incidents.map((inc) => (inc._id === id ? data : inc)),
        loading: false,
      }));
      return true;
    } catch (err) {
      set({ error: err instanceof Error ? err.message : 'Failed to update incident', loading: false });
      return false;
    }
  },
}));
