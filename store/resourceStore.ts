import { create } from 'zustand';
import { Resource } from '@/types';

// Omit database meta-fields for the client parameters
type CreateResourceData = Omit<Resource, '_id' | 'createdAt' | 'updatedAt' | 'owner'>;
type UpdateResourceData = Partial<CreateResourceData>;

interface ResourceState {
  resources: Resource[];
  currentResource: Resource | null;
  loading: boolean;
  error: string | null;
  fetchResources: () => Promise<void>;
  fetchResourceById: (id: string) => Promise<void>;
  createResource: (resourceData: CreateResourceData) => Promise<boolean>;
  updateResource: (id: string, resourceData: UpdateResourceData) => Promise<boolean>;
  deleteResource: (id: string) => Promise<boolean>;
  clearError: () => void;
}

/**
 * Zustand Resource Store
 * 
 * College Viva Tip:
 * "This client-side Zustand store manages the resource list and single-resource detail state.
 * It encapsulates HTTP API requests (GET, POST, PUT, DELETE) and uses standard action triggers
 * to update react state reactively, reducing boilerplate and ensuring clean state management."
 */
export const useResourceStore = create<ResourceState>((set) => ({
  resources: [],
  currentResource: null,
  loading: false,
  error: null,

  clearError: () => set({ error: null }),

  fetchResources: async () => {
    set({ loading: true, error: null });
    try {
      const response = await fetch('/api/resources');
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to fetch resources');
      set({ resources: data, loading: false });
    } catch (err) {
      set({ error: err instanceof Error ? err.message : 'Failed to fetch resources', loading: false });
    }
  },

  fetchResourceById: async (id: string) => {
    set({ loading: true, error: null, currentResource: null });
    try {
      const response = await fetch(`/api/resources/${id}`);
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to fetch resource details');
      set({ currentResource: data, loading: false });
    } catch (err) {
      set({ error: err instanceof Error ? err.message : 'Failed to fetch resource details', loading: false });
    }
  },

  createResource: async (resourceData) => {
    set({ loading: true, error: null });
    try {
      const response = await fetch('/api/resources', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(resourceData),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to create resource');
      
      set((state) => ({
        resources: [data, ...state.resources],
        loading: false,
      }));
      return true;
    } catch (err) {
      set({ error: err instanceof Error ? err.message : 'Failed to create resource', loading: false });
      return false;
    }
  },

  updateResource: async (id, resourceData) => {
    set({ loading: true, error: null });
    try {
      const response = await fetch(`/api/resources/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(resourceData),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to update resource');
      
      set((state) => ({
        resources: state.resources.map((r) => (r._id === id ? data : r)),
        currentResource: state.currentResource?._id === id ? data : state.currentResource,
        loading: false,
      }));
      return true;
    } catch (err) {
      set({ error: err instanceof Error ? err.message : 'Failed to update resource', loading: false });
      return false;
    }
  },

  deleteResource: async (id) => {
    set({ loading: true, error: null });
    try {
      const response = await fetch(`/api/resources/${id}`, {
        method: 'DELETE',
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to delete resource');
      
      set((state) => ({
        resources: state.resources.filter((r) => r._id !== id),
        currentResource: state.currentResource?._id === id ? null : state.currentResource,
        loading: false,
      }));
      return true;
    } catch (err) {
      set({ error: err instanceof Error ? err.message : 'Failed to delete resource', loading: false });
      return false;
    }
  },
}));
