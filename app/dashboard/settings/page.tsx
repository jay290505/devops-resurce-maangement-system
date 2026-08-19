'use client';

import React, { useEffect, useState } from 'react';
import { Settings, Shield, Trash2, ShieldAlert, Loader2 } from 'lucide-react';
import { useUserStore } from '@/store/userStore';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';

export default function SettingsPage() {
  const { users, loading, fetchUsers, updateUserRole, deleteUser, error } = useUserStore();
  const { user: currentUser } = useAuth();
  const router = useRouter();

  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [actionError, setActionError] = useState('');

  useEffect(() => {
    // Client-side access guard
    if (currentUser && currentUser.role !== 'admin') {
      router.push('/dashboard');
      return;
    }
    fetchUsers();
  }, [currentUser, router, fetchUsers]);

  if (!currentUser || currentUser.role !== 'admin') {
    return (
      <div className="flex h-96 flex-col items-center justify-center gap-4 text-center">
        <ShieldAlert className="h-16 w-16 text-rose-500 animate-bounce" />
        <h2 className="text-xl font-bold">Access Denied</h2>
        <p className="text-sm max-w-xs" style={{ color: 'var(--theme-text-muted)' }}>
          This page contains sensitive system settings and user details reserved only for System Administrators.
        </p>
      </div>
    );
  }

  const handleRoleChange = async (userId: string, newRole: string) => {
    setActionError('');
    setUpdatingId(userId);
    const success = await updateUserRole(userId, newRole);
    setUpdatingId(null);
    if (!success) {
      const storeErr = useUserStore.getState().error;
      setActionError(storeErr || 'Failed to update user role.');
    }
  };

  const handleDeleteUser = async (userId: string) => {
    setActionError('');
    const success = await deleteUser(userId);
    if (success) {
      setConfirmDeleteId(null);
    } else {
      const storeErr = useUserStore.getState().error;
      setActionError(storeErr || 'Failed to delete user.');
    }
  };

  const getRoleBadgeStyle = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-rose-500/10 text-rose-500 border-rose-500/20';
      case 'devops_engineer':
        return 'bg-amber-500/10 text-amber-500 border-amber-500/20';
      default:
        return 'bg-zinc-500/10 text-zinc-500 border-zinc-500/20';
    }
  };

  return (
    <div className="space-y-8 selection:bg-amber-500/30 selection:text-amber-200" style={{ color: 'var(--theme-text-primary)' }}>
      {/* Header */}
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">System Settings</h1>
        <p className="text-sm mt-1" style={{ color: 'var(--theme-text-muted)' }}>
          Manage system configurations, user role authorizations, and platform accounts
        </p>
      </div>

      {/* Errors */}
      {(error || actionError) && (
        <div className="rounded-lg border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-500">
          {actionError || error}
        </div>
      )}

      {/* User Management Panel */}
      <div
        className="rounded-xl border shadow-sm overflow-hidden"
        style={{ borderColor: 'var(--theme-border)', backgroundColor: 'var(--theme-bg-card)' }}
      >
        <div className="border-b p-5 flex items-center gap-2.5" style={{ borderColor: 'var(--theme-border-soft)' }}>
          <Shield className="h-5 w-5 text-amber-500" />
          <div>
            <h3 className="font-semibold text-base">User Accounts Management</h3>
            <p className="text-xs" style={{ color: 'var(--theme-text-muted)' }}>
              Total users registered: {users.length}
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr
                className="border-b font-semibold"
                style={{ borderColor: 'var(--theme-border-soft)', color: 'var(--theme-text-muted)' }}
              >
                <th className="p-4">User Details</th>
                <th className="p-4">Email Address</th>
                <th className="p-4">Current Role</th>
                <th className="p-4">Created At</th>
                <th className="p-4 text-right">Settings</th>
              </tr>
            </thead>
            <tbody style={{ color: 'var(--theme-text-secondary)' }}>
              {users.map((usr) => {
                const isSelf = usr._id === currentUser.id;
                const isUpdating = updatingId === usr._id;

                return (
                  <tr
                    key={usr._id}
                    className="border-b transition-colors"
                    style={{ borderColor: 'var(--theme-border-soft)' }}
                  >
                    {/* Name */}
                    <td className="p-4 font-medium" style={{ color: 'var(--theme-text-primary)' }}>
                      <div className="flex items-center gap-2">
                        {usr.name}
                        {isSelf && (
                          <span className="rounded bg-amber-500/10 text-amber-500 border border-amber-500/20 px-1 py-0.5 text-[9px] font-bold">
                            YOU
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Email */}
                    <td className="p-4">{usr.email}</td>

                    {/* Role badge */}
                    <td className="p-4">
                      <span className={`inline-flex items-center rounded-md px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider border ${getRoleBadgeStyle(usr.role || '')}`}>
                        {(usr.role || '').replace('_', ' ')}
                      </span>
                    </td>

                    {/* Join Date */}
                    <td className="p-4 text-xs" style={{ color: 'var(--theme-text-muted)' }}>
                      {usr.createdAt ? new Date(usr.createdAt).toLocaleDateString() : 'N/A'}
                    </td>

                    {/* Dynamic Role Change / Delete settings */}
                    <td className="p-4 text-right">
                      {isUpdating ? (
                        <Loader2 className="h-4 w-4 animate-spin inline-block" />
                      ) : (
                        <div className="flex items-center justify-end gap-3">
                          {/* Role Selector dropdown */}
                          <select
                            disabled={isSelf}
                            value={usr.role}
                            onChange={(e) => handleRoleChange(usr._id, e.target.value)}
                            className="rounded border px-2 py-1 text-xs outline-none focus:border-amber-500 disabled:opacity-50"
                            style={{
                              borderColor: 'var(--theme-border)',
                              backgroundColor: 'var(--theme-bg-input)',
                              color: 'var(--theme-text-primary)',
                            }}
                          >
                            <option value="viewer">Viewer</option>
                            <option value="devops_engineer">DevOps Engineer</option>
                            <option value="admin">Administrator</option>
                          </select>

                          {/* Account Deletion */}
                          {!isSelf && (
                            <>
                              {confirmDeleteId === usr._id ? (
                                <div className="flex items-center gap-1.5">
                                  <button
                                    onClick={() => setConfirmDeleteId(null)}
                                    className="rounded border px-2 py-0.5 text-[10px]"
                                    style={{ borderColor: 'var(--theme-border)' }}
                                  >
                                    Cancel
                                  </button>
                                  <button
                                    onClick={() => handleDeleteUser(usr._id)}
                                    className="rounded bg-red-600 text-white px-2 py-0.5 text-[10px] font-bold"
                                  >
                                    Delete
                                  </button>
                                </div>
                              ) : (
                                <button
                                  onClick={() => setConfirmDeleteId(usr._id)}
                                  className="p-1 text-zinc-400 hover:text-red-500 hover:bg-red-500/10 rounded transition-colors"
                                  title="Delete User"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              )}
                            </>
                          )}
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
