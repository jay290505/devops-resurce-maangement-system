'use client';

import React, { useEffect, useState } from 'react';
import { GitPullRequest, Plus, CheckCircle, XCircle, Clock, Server, Loader2, ArrowRight } from 'lucide-react';
import { useRequestStore } from '@/store/requestStore';
import { useAuth } from '@/hooks/useAuth';
import CreateRequestModal from '@/components/requests/CreateRequestModal';

export default function RequestsPage() {
  const { requests, loading, fetchRequests, resolveRequest, error } = useRequestStore();
  const { user } = useAuth();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [resolvingId, setResolvingId] = useState<string | null>(null);
  const [comments, setComments] = useState('');
  const [isRejecting, setIsRejecting] = useState(false);
  const [actionError, setActionError] = useState('');

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  const isApprover = user?.role === 'admin' || user?.role === 'project_manager';
  const isDevOps = user?.role === 'admin' || user?.role === 'devops_engineer';

  const handleResolve = async (id: string, status: 'approved' | 'rejected') => {
    setActionError('');
    if (status === 'rejected' && !comments.trim()) {
      setActionError('Please provide a reason or comment for rejection');
      return;
    }

    const success = await resolveRequest(id, status, comments.trim());
    if (success) {
      setResolvingId(null);
      setComments('');
      setIsRejecting(false);
    } else {
      setActionError('Failed to resolve request.');
    }
  };

  const getStatusBadgeStyle = (status: string) => {
    switch (status) {
      case 'provisioned':
      case 'approved':
        return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';
      case 'rejected':
        return 'bg-red-500/10 text-red-500 border-red-500/20';
      default:
        return 'bg-amber-500/10 text-amber-500 border-amber-500/20 animate-pulse';
    }
  };

  return (
    <div className="space-y-8 selection:bg-amber-500/30 selection:text-amber-200" style={{ color: 'var(--theme-text-primary)' }}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Resource Requests</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--theme-text-muted)' }}>
            Submit and approve infrastructure resource allocations
          </p>
        </div>
        {isDevOps && (
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 rounded-lg bg-amber-600 px-4 py-2 text-sm font-semibold text-zinc-950 hover:bg-amber-500 transition-colors"
          >
            <Plus className="h-4 w-4" />
            Request Resource
          </button>
        )}
      </div>

      {/* Errors */}
      {(error || actionError) && (
        <div className="rounded-lg border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-500">
          {actionError || error}
        </div>
      )}

      {/* Queue Grid */}
      <div className="grid gap-6">
        {requests.map((req) => {
          const stats = req.specs;
          const requester = req.requestedBy as { name: string; email: string } | null;
          const resolver = req.resolvedBy as { name: string } | null;
          const isPending = req.status === 'pending';
          const isPendingResolution = resolvingId === req._id;

          return (
            <div
              key={req._id}
              className="rounded-xl border p-5 shadow-sm transition-all"
              style={{
                borderColor: 'var(--theme-border)',
                backgroundColor: 'var(--theme-bg-card)',
              }}
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/10 text-blue-500 border border-blue-500/15 mt-0.5">
                    <Server className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-base" style={{ color: 'var(--theme-text-primary)' }}>
                      {req.name} <span className="text-xs uppercase px-1.5 py-0.5 rounded ml-2" style={{ backgroundColor: 'var(--theme-bg-elevated)', color: 'var(--theme-text-muted)' }}>{req.type}</span>
                    </h3>
                    <p className="text-xs mt-1" style={{ color: 'var(--theme-text-secondary)' }}>
                      Requested by: <span className="font-medium">{requester?.name || 'DevOps User'}</span> · Namespace: <span className="font-bold text-amber-500 uppercase">{req.environment}</span>
                    </p>
                    <p className="text-xs mt-1" style={{ color: 'var(--theme-text-muted)' }}>
                      Purpose: &quot;{req.purpose}&quot; · Allocated Duration: {req.duration} days
                    </p>
                  </div>
                </div>

                {/* Specs Box */}
                <div className="flex flex-wrap items-center gap-3 text-xs">
                  <div className="rounded-lg p-2 border" style={{ borderColor: 'var(--theme-border)', backgroundColor: 'var(--theme-bg-elevated)' }}>
                    <span style={{ color: 'var(--theme-text-muted)' }}>CPU</span>
                    <p className="font-semibold mt-0.5">{stats.cpu} Cores</p>
                  </div>
                  <div className="rounded-lg p-2 border" style={{ borderColor: 'var(--theme-border)', backgroundColor: 'var(--theme-bg-elevated)' }}>
                    <span style={{ color: 'var(--theme-text-muted)' }}>RAM</span>
                    <p className="font-semibold mt-0.5">{stats.ram} GB</p>
                  </div>
                  <div className="rounded-lg p-2 border" style={{ borderColor: 'var(--theme-border)', backgroundColor: 'var(--theme-bg-elevated)' }}>
                    <span style={{ color: 'var(--theme-text-muted)' }}>Region</span>
                    <p className="font-semibold mt-0.5 capitalize">{stats.region}</p>
                  </div>
                </div>

                {/* Status or Actions */}
                <div className="flex flex-col items-end gap-1.5 min-w-[120px]">
                  <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-semibold border ${getStatusBadgeStyle(req.status)}`}>
                    {req.status === 'provisioned' ? 'Provisioned / Active' : req.status}
                  </span>
                  
                  {req.comments && (
                    <p className="text-[10px] italic text-right mt-1 max-w-[200px]" style={{ color: 'var(--theme-text-muted)' }}>
                      Comments: &quot;{req.comments}&quot;
                    </p>
                  )}
                  {resolver && (
                    <p className="text-[9px]" style={{ color: 'var(--theme-text-muted)' }}>
                      By: {resolver.name}
                    </p>
                  )}
                </div>
              </div>

              {/* Approval Box for Project Manager / Admins (FR-2: Approval Process) */}
              {isApprover && isPending && (
                <div className="border-t mt-4 pt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3" style={{ borderColor: 'var(--theme-border-soft)' }}>
                  <div className="flex-1">
                    {isPendingResolution && isRejecting ? (
                      <input
                        type="text"
                        required
                        value={comments}
                        onChange={(e) => setComments(e.target.value)}
                        placeholder="Provide rejection reason comment..."
                        className="w-full rounded border px-3 py-1.5 text-xs outline-none focus:border-red-500"
                        style={{ borderColor: 'var(--theme-border)', backgroundColor: 'var(--theme-bg-input)' }}
                      />
                    ) : isPendingResolution ? (
                      <input
                        type="text"
                        value={comments}
                        onChange={(e) => setComments(e.target.value)}
                        placeholder="Add optional approval comments..."
                        className="w-full rounded border px-3 py-1.5 text-xs outline-none focus:border-emerald-500"
                        style={{ borderColor: 'var(--theme-border)', backgroundColor: 'var(--theme-bg-input)' }}
                      />
                    ) : (
                      <span className="text-xs text-amber-500 font-semibold flex items-center gap-1.5">
                        <Clock className="h-3.5 w-3.5" /> Pending approval review
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2 self-end">
                    {isPendingResolution ? (
                      <>
                        <button
                          onClick={() => {
                            setResolvingId(null);
                            setComments('');
                            setIsRejecting(false);
                          }}
                          className="rounded border px-2.5 py-1 text-xs transition-colors hover:bg-zinc-800/10 dark:hover:bg-zinc-850"
                          style={{ borderColor: 'var(--theme-border)' }}
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => handleResolve(req._id, isRejecting ? 'rejected' : 'approved')}
                          className={`rounded px-2.5 py-1 text-xs font-semibold text-zinc-950 transition-colors ${
                            isRejecting ? 'bg-red-500 hover:bg-red-400' : 'bg-emerald-600 hover:bg-emerald-500'
                          }`}
                        >
                          Confirm {isRejecting ? 'Rejection' : 'Approval'}
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => {
                            setResolvingId(req._id);
                            setIsRejecting(true);
                          }}
                          className="rounded border border-red-500/20 bg-red-500/10 px-3 py-1 text-xs font-semibold text-red-500 hover:bg-red-500/20"
                        >
                          Reject
                        </button>
                        <button
                          onClick={() => {
                            setResolvingId(req._id);
                            setIsRejecting(false);
                          }}
                          className="rounded bg-emerald-600 text-zinc-950 px-3 py-1 text-xs font-semibold hover:bg-emerald-500"
                        >
                          Approve Request
                        </button>
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {requests.length === 0 && !loading && (
        <div className="flex flex-col items-center justify-center py-20" style={{ color: 'var(--theme-text-muted)' }}>
          <GitPullRequest className="h-12 w-12 mb-4" style={{ color: 'var(--theme-border)' }} />
          <p className="text-lg font-medium">No requests logged</p>
          <p className="text-sm">Submit your first resource allocation request to get started.</p>
        </div>
      )}

      {/* Request Modal */}
      <CreateRequestModal isOpen={isModalOpen} onClose={() => { setIsModalOpen(false); fetchRequests(); }} />
    </div>
  );
}
