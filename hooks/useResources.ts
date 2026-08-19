import { useState, useCallback } from 'react';
import { resourceService } from '@/services';
import type { Resource } from '@/types';

type CreateResourceData = Omit<Resource, '_id' | 'createdAt' | 'updatedAt' | 'owner'>;
type UpdateResourceData = Partial<CreateResourceData>;

interface UseResourcesReturn {
  resources: Resource[];
  currentResource: Resource | null;
  loading: boolean;
  error: string | null;
  fetchAll: () => Promise<void>;
  fetchById: (id: string) => Promise<void>;
  create: (data: CreateResourceData) => Promise<boolean>;
  update: (id: string, data: UpdateResourceData) => Promise<boolean>;
  remove: (id: string) => Promise<boolean>;
  clearError: () => void;
}

export function useResources(): UseResourcesReturn {
  const [resources, setResources] = useState<Resource[]>([]);
  const [currentResource, setCurrentResource] = useState<Resource | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const clearError = () => setError(null);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await resourceService.getAll();
      setResources(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch resources');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchById = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      const data = await resourceService.getById(id);
      setCurrentResource(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch resource');
    } finally {
      setLoading(false);
    }
  }, []);

  const create = async (data: CreateResourceData) => {
    setLoading(true);
    setError(null);
    try {
      const newResource = await resourceService.create(data);
      setResources((prev) => [newResource, ...prev]);
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create resource');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const update = async (id: string, data: UpdateResourceData) => {
    setLoading(true);
    setError(null);
    try {
      const updated = await resourceService.update(id, data);
      setResources((prev) => prev.map((r) => (r._id === id ? updated : r)));
      setCurrentResource((prev) => (prev?._id === id ? updated : prev));
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update resource');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const remove = async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      await resourceService.delete(id);
      setResources((prev) => prev.filter((r) => r._id !== id));
      setCurrentResource((prev) => (prev?._id === id ? null : prev));
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete resource');
      return false;
    } finally {
      setLoading(false);
    }
  };

  return { resources, currentResource, loading, error, fetchAll, fetchById, create, update, remove, clearError };
}
