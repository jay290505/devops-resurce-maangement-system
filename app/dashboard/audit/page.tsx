'use client';

import React, { useEffect, useState } from 'react';
import { ClipboardList, ShieldAlert, Cpu, Database, CheckCircle2, FileDown, Calendar, User, Layers, ArrowRight } from 'lucide-react';
import { useAuditStore } from '@/store/auditStore';
import { useAuth } from '@/hooks/useAuth';

export default function AuditPage() {
  const { auditLogs, reports, loading, fetchAuditLogs, fetchReports, error } = useAuditStore();
  const { user } = useAuth();
  
  const [filterAction, setFilterAction] = useState('all');

  useEffect(() => {
    fetchAuditLogs();
    fetchReports();
  }, [fetchAuditLogs, fetchReports]);

  // Auditor role check (Admins, PMs, and Viewers/Auditors can view this page)
  const hasAccess = user && ['admin', 'project_manager', 'viewer'].includes(user.role);

  if (!hasAccess) {
    return (
      <div className="flex h-96 flex-col items-center justify-center gap-4 text-center">
        <ShieldAlert className="h-16 w-16 text-rose-500 animate-bounce" />
        <h2 className="text-xl font-bold">Access Denied</h2>
        <p className="text-sm max-w-xs" style={{ color: 'var(--theme-text-muted)' }}>
          Audit trails and report metrics are protected. Verify your account role permissions.
        </p>
      </div>
    );
  }

  // Trigger browser print for easy PDF exporting (Workflow Step 6: Export Reports)
  const handleExport = () => {
    window.print();
  };

  const getActionColor = (action: string) => {
    switch (action) {
      case 'RESOURCE_APPROVED':
      case 'PROVISION_SUCCESS':
        return 'text-emerald-500';
      case 'RESOURCE_REJECTED':
        return 'text-red-500';
      case 'RESOURCE_RELEASE':
        return 'text-amber-500';
      default:
        return 'text-blue-500';
    }
  };

  const filteredLogs = auditLogs.filter((log) => {
    if (filterAction !== 'all' && log.action !== filterAction) return false;
    return true;
  });

  return (
    <div className="space-y-8 print:p-0 selection:bg-amber-500/30 selection:text-amber-200" style={{ color: 'var(--theme-text-primary)' }}>
      
      {/* Header Banner */}
      <div className="flex items-center justify-between print:hidden">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Compliance & Audits</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--theme-text-muted)' }}>
            System-wide resource requests, provisioning logs, and deployment audits
          </p>
        </div>
        <button
          onClick={handleExport}
          className="flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-semibold hover:bg-zinc-850 transition-colors"
          style={{ borderColor: 'var(--theme-border)' }}
        >
          <FileDown className="h-4 w-4" />
          Export Reports (PDF)
        </button>
      </div>

      {/* Analytics Summary Cards (Workflow Step 6: Generate Reports) */}
      {reports && (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4 print:grid-cols-4">
          <div className="rounded-xl border p-5" style={{ borderColor: 'var(--theme-border)', backgroundColor: 'var(--theme-bg-card)' }}>
            <div className="flex items-center justify-between text-xs" style={{ color: 'var(--theme-text-muted)' }}>
              <span>INFRASTRUCTURE HEALTH</span>
              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
            </div>
            <h4 className="text-3xl font-bold mt-2">{reports.availabilityRate}%</h4>
            <p className="text-[10px] mt-1" style={{ color: 'var(--theme-text-muted)' }}>Average systems availability rate</p>
          </div>

          <div className="rounded-xl border p-5" style={{ borderColor: 'var(--theme-border)', backgroundColor: 'var(--theme-bg-card)' }}>
            <div className="flex items-center justify-between text-xs" style={{ color: 'var(--theme-text-muted)' }}>
              <span>ACTIVE CPU FOOTPRINT</span>
              <Cpu className="h-4 w-4 text-amber-500" />
            </div>
            <h4 className="text-3xl font-bold mt-2">{reports.footprint.cpu} Cores</h4>
            <p className="text-[10px] mt-1" style={{ color: 'var(--theme-text-muted)' }}>Total virtualization processing threads</p>
          </div>

          <div className="rounded-xl border p-5" style={{ borderColor: 'var(--theme-border)', backgroundColor: 'var(--theme-bg-card)' }}>
            <div className="flex items-center justify-between text-xs" style={{ color: 'var(--theme-text-muted)' }}>
              <span>SWAP RAM FOOTPRINT</span>
              <Database className="h-4 w-4 text-purple-500" />
            </div>
            <h4 className="text-3xl font-bold mt-2">{reports.footprint.ram} GB</h4>
            <p className="text-[10px] mt-1" style={{ color: 'var(--theme-text-muted)' }}>Consolidated cluster swap RAM size</p>
          </div>

          <div className="rounded-xl border p-5" style={{ borderColor: 'var(--theme-border)', backgroundColor: 'var(--theme-bg-card)' }}>
            <div className="flex items-center justify-between text-xs" style={{ color: 'var(--theme-text-muted)' }}>
              <span>APPROVAL RATE</span>
              <ClipboardList className="h-4 w-4 text-blue-500" />
            </div>
            <h4 className="text-3xl font-bold mt-2">
              {reports.requestStats.approved + reports.requestStats.provisioned} / {reports.totalRequests}
            </h4>
            <p className="text-[10px] mt-1" style={{ color: 'var(--theme-text-muted)' }}>Approved resource requests ratio</p>
          </div>
        </div>
      )}

      {/* Filter toolbar (hidden when printing) */}
      <div
        className="flex items-center gap-4 rounded-xl border p-4 shadow-sm print:hidden"
        style={{ borderColor: 'var(--theme-border)', backgroundColor: 'var(--theme-bg-card)' }}
      >
        <div className="flex flex-col gap-1 w-full sm:w-auto">
          <label className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: 'var(--theme-text-muted)' }}>
            Filter Log Event Action
          </label>
          <select
            value={filterAction}
            onChange={(e) => setFilterAction(e.target.value)}
            className="rounded-lg border px-3 py-1.5 text-xs outline-none focus:border-amber-500"
            style={{ borderColor: 'var(--theme-border)', backgroundColor: 'var(--theme-bg-input)' }}
          >
            <option value="all">All Actions</option>
            <option value="RESOURCE_REQUEST">RESOURCE_REQUEST</option>
            <option value="RESOURCE_APPROVED">RESOURCE_APPROVED</option>
            <option value="RESOURCE_REJECTED">RESOURCE_REJECTED</option>
            <option value="PROVISION_SUCCESS">PROVISION_SUCCESS</option>
            <option value="RESOURCE_RELEASE">RESOURCE_RELEASE</option>
          </select>
        </div>
      </div>

      {/* Audit Logs Table (Workflow Step 6: View Reports & Audit Logs) */}
      <div
        className="rounded-xl border shadow-sm overflow-hidden"
        style={{ borderColor: 'var(--theme-border)' }}
      >
        <div className="border-b p-5 flex items-center gap-2 print:hidden" style={{ borderColor: 'var(--theme-border-soft)' }}>
          <ClipboardList className="h-5 w-5 text-amber-500" />
          <h3 className="font-semibold text-sm uppercase tracking-wider">Compliance Activity Log Trail</h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm print:text-xs">
            <thead>
              <tr
                className="border-b font-semibold"
                style={{ borderColor: 'var(--theme-border)', color: 'var(--theme-text-muted)' }}
              >
                <th className="p-4">Action Event</th>
                <th className="p-4">Compliance Details</th>
                <th className="p-4">Triggered By</th>
                <th className="p-4">Timestamp</th>
              </tr>
            </thead>
            <tbody style={{ color: 'var(--theme-text-secondary)' }}>
              {filteredLogs.map((log) => {
                const userDoc = log.userId as { name: string; email: string; role: string } | null;

                return (
                  <tr
                    key={log._id}
                    className="border-b transition-colors"
                    style={{ borderColor: 'var(--theme-border-soft)' }}
                  >
                    {/* Action */}
                    <td className="p-4 font-mono text-xs font-bold">
                      <span className={getActionColor(log.action)}>{log.action}</span>
                    </td>

                    {/* Details */}
                    <td className="p-4 max-w-sm" style={{ color: 'var(--theme-text-primary)' }}>
                      {log.details}
                    </td>

                    {/* User */}
                    <td className="p-4">
                      <div className="font-medium" style={{ color: 'var(--theme-text-primary)' }}>
                        {userDoc?.name || 'System Auto'}
                      </div>
                      <div className="text-[10px] capitalize text-amber-500">
                        {userDoc?.role?.replace('_', ' ') || 'agent'}
                      </div>
                    </td>

                    {/* Date */}
                    <td className="p-4 text-xs font-mono" style={{ color: 'var(--theme-text-muted)' }}>
                      {new Date(log.createdAt).toLocaleString()}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {filteredLogs.length === 0 && !loading && (
        <div className="flex flex-col items-center justify-center py-20 print:hidden" style={{ color: 'var(--theme-text-muted)' }}>
          <ClipboardList className="h-12 w-12 mb-4" style={{ color: 'var(--theme-border)' }} />
          <p className="text-lg font-medium">No compliance audits recorded</p>
          <p className="text-sm">Activities will be tracked here once resource workflows are started.</p>
        </div>
      )}
    </div>
  );
}
