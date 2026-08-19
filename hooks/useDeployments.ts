import { useState, useCallback } from 'react';
import { deploymentService } from '@/services';
import type { Deployment } from '@/types';

type CreateDeploymentData = Omit<Deployment, '_id' | 'deployedAt' | 'deployedBy'>;

interface UseDeploymentsReturn {
  deployments: Deployment[];
  loading: boolean;
  error: string | null;
  fetchAll: () => Promise<void>;
  create: (data: CreateDeploymentData) => Promise<boolean>;
  clearError: () => void;
}

export function useDeployments(): UseDeploymentsReturn {
  const [deployments, setDeployments] = useState<Deployment[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const clearError = () => setError(null);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await deploymentService.getAll();
      setDeployments(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch deployments');
    } finally {
      setLoading(false);
    }
  }, []);

  const create = async (data: CreateDeploymentData) => {
    setLoading(true);
    setError(null);
    try {
      const newDeployment = await deploymentService.create(data);
      setDeployments((prev) => [newDeployment, ...prev]);
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create deployment');
      return false;
    } finally {
      setLoading(false);
    }
  };

  return { deployments, loading, error, fetchAll, create, clearError };
}
