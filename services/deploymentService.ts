import { apiFetch } from './api';
import type { Deployment } from '@/types';

type CreateDeploymentData = Omit<Deployment, '_id' | 'deployedAt' | 'deployedBy'>;

export const deploymentService = {
  getAll() {
    return apiFetch<Deployment[]>('/api/deployments');
  },

  create(data: CreateDeploymentData) {
    return apiFetch<Deployment>('/api/deployments', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
};
