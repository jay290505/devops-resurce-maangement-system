import { create } from 'zustand';
import { AuditLog } from '@/types';

interface ReportStats {
  resourceStats: Record<string, number>;
  footprint: { cpu: number; ram: number };
  requestStats: Record<string, number>;
  availabilityRate: number;
  totalResources: number;
  totalRequests: number;
}

interface AuditState {
  auditLogs: AuditLog[];
  reports: ReportStats | null;
  loading: boolean;
  error: string | null;
  fetchAuditLogs: () => Promise<void>;
  fetchReports: () => Promise<void>;
  clearError: () => void;
}

export const useAuditStore = create<AuditState>((set) => ({
  auditLogs: [],
  reports: null,
  loading: false,
  error: null,

  clearError: () => set({ error: null }),

  fetchAuditLogs: async () => {
    set({ loading: true, error: null });
    try {
      const response = await fetch('/api/audit-logs');
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to fetch audit logs');
      set({ auditLogs: data, loading: false });
    } catch (err) {
      set({ error: err instanceof Error ? err.message : 'Failed to fetch audit logs', loading: false });
    }
  },

  fetchReports: async () => {
    set({ loading: true, error: null });
    try {
      const response = await fetch('/api/reports');
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to fetch reports stats');
      set({ reports: data, loading: false });
    } catch (err) {
      set({ error: err instanceof Error ? err.message : 'Failed to fetch reports stats', loading: false });
    }
  },
}));
