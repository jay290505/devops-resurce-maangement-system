import { create } from 'zustand';
import { Deployment } from '@/types';

// Omit server-generated values for incoming deployment parameters
type CreateDeploymentData = Omit<Deployment, '_id' | 'deployedAt' | 'deployedBy'>;

interface DeploymentState {
  deployments: Deployment[];
  loading: boolean;
  error: string | null;
  fetchDeployments: () => Promise<void>;
  createDeployment: (deploymentData: CreateDeploymentData) => Promise<boolean>;
  clearError: () => void;
}

/**
 * Zustand Deployment Store
 * 
 * College Viva Tip:
 * "This client-side Zustand store tracks deployment status history and logs.
 * It manages the async API calls to fetch recent deployments and trigger new logs,
 * enabling real-time deployment status monitoring on the dashboard."
 */
export const useDeploymentStore = create<DeploymentState>((set) => ({
  deployments: [],
  loading: false,
  error: null,

  clearError: () => set({ error: null }),

  fetchDeployments: async () => {
    set({ loading: true, error: null });
    try {
      const response = await fetch('/api/deployments');
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to fetch deployments');
      set({ deployments: data, loading: false });
    } catch (err) {
      set({ error: err instanceof Error ? err.message : 'Failed to fetch deployments', loading: false });
    }
  },

  createDeployment: async (deploymentData) => {
    set({ loading: true, error: null });
    try {
      const response = await fetch('/api/deployments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(deploymentData),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to trigger deployment log');
      
      set((state) => ({
        deployments: [data, ...state.deployments],
        loading: false,
      }));
      return true;
    } catch (err) {
      set({ error: err instanceof Error ? err.message : 'Failed to trigger deployment log', loading: false });
      return false;
    }
  },
}));
