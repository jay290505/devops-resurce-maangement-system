import { apiFetch } from './api';
import type { Resource } from '@/types';

type CreateResourceData = Omit<Resource, '_id' | 'createdAt' | 'updatedAt' | 'owner'>;
type UpdateResourceData = Partial<CreateResourceData>;

export const resourceService = {
  getAll() {
    return apiFetch<Resource[]>('/api/resources');
  },

  getById(id: string) {
    return apiFetch<Resource>(`/api/resources/${id}`);
  },

  create(data: CreateResourceData) {
    return apiFetch<Resource>('/api/resources', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  update(id: string, data: UpdateResourceData) {
    return apiFetch<Resource>(`/api/resources/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  delete(id: string) {
    return apiFetch<{ message: string }>(`/api/resources/${id}`, {
      method: 'DELETE',
    });
  },
};
