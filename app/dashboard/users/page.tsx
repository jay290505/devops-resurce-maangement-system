'use client';

import React, { useEffect, useState } from 'react';
import {
  Users,
  Shield,
  Trash2,
  ChevronDown,
  Search,
  UserCog,
  AlertTriangle,
  Check,
  X,
  RefreshCw,
} from 'lucide-react';
import { useUserStore } from '@/store/userStore';
import { useAuth } from '@/hooks/useAuth';

type UserRole = 'admin' | 'devops_engineer' | 'project_manager' | 'viewer';

const ROLES: { value: UserRole; label: string; color: string; bg: string }[] = [
  { value: 'admin',           label: 'Administrator',     color: 'text-rose-400',   bg: 'bg-rose-500/10 border-rose-500/20' },
  { value: 'project_manager', label: 'Project Manager',  color: 'text-purple-400', bg: 'bg-purple-500/10 border-purple-500/20' },
  { value: 'devops_engineer', label: 'DevOps Engineer',  color: 'text-amber-400',  bg: 'bg-amber-500/10 border-amber-500/20' },
  { value: 'viewer',          label: 'Viewer / Auditor', color: 'text-blue-400',   bg: 'bg-blue-500/10 border-blue-500/20' },
];

function RoleBadge({ role }: { role: string }) {
  const found = ROLES.find((r) => r.value === role);
  if (!found) return <span className="text-xs text-zinc-400 italic">Unknown</span>;
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold ${found.bg} ${found.color}`}>
      <Shield className="h-3 w-3" />
      {found.label}
    </span>
  );
}

export default function UsersPage() {
  const { users, loading, error, fetchUsers, updateUserRole, deleteUser, clearError } = useUserStore();
  const { user: currentUser } = useAuth();

  const [search, setSearch] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editRole, setEditRole] = useState<UserRole>('viewer');
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const filtered = users.filter((u) => {
    const q = search.toLowerCase();
    return (
      u.name?.toLowerCase().includes(q) ||
      u.email?.toLowerCase().includes(q) ||
      u.role?.toLowerCase().includes(q)
    );
  });

  const showSuccess = (msg: string) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  const handleRoleUpdate = async (id: string) => {
    setActionLoading(true);
    const ok = await updateUserRole(id, editRole);
    setActionLoading(false);
    if (ok) {
      setEditingId(null);
      showSuccess('User role updated successfully');
    }
  };

  const handleDelete = async (id: string) => {
    setActionLoading(true);
    const ok = await deleteUser(id);
    setActionLoading(false);
    if (ok) {
      setDeletingId(null);
      showSuccess('User removed from platform');
    }
  };

  // Role distribution stats
  const roleCounts = ROLES.map((r) => ({
    ...r,
    count: users.filter((u) => u.role === r.value).length,
  }));

  return (
    <div className="space-y-8" style={{ color: 'var(--theme-text-primary)' }}>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">User Management</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--theme-text-muted)' }}>
            Manage platform accounts, assign roles, and control access levels
          </p>
        </div>
        <button
          onClick={() => { clearError(); fetchUsers(); }}
          className="flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-semibold transition-colors hover:bg-zinc-100 dark:hover:bg-zinc-800"
          style={{ borderColor: 'var(--theme-border)' }}
        >
          <RefreshCw className="h-4 w-4" />
          Refresh
        </button>
      </div>

      {/* Success toast */}
      {successMsg && (
        <div className="flex items-center gap-2 rounded-lg border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm font-medium text-emerald-500">
          <Check className="h-4 w-4" />
          {successMsg}
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="flex items-center gap-2 rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-500">
          <AlertTriangle className="h-4 w-4" />
          {error}
        </div>
      )}

      {/* Role Distribution Stats */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {roleCounts.map((r) => (
          <div
            key={r.value}
            className="rounded-xl border p-4"
            style={{ borderColor: 'var(--theme-border)', backgroundColor: 'var(--theme-bg-card)' }}
          >
            <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--theme-text-muted)' }}>
              {r.label}
            </p>
            <p className={`text-3xl font-bold mt-1 ${r.color}`}>{r.count}</p>
          </div>
        ))}
      </div>

      {/* Search */}
      <div
        className="flex items-center gap-3 rounded-xl border px-4 py-3"
        style={{ borderColor: 'var(--theme-border)', backgroundColor: 'var(--theme-bg-card)' }}
      >
        <Search className="h-4 w-4 shrink-0" style={{ color: 'var(--theme-text-muted)' }} />
        <input
          type="text"
          placeholder="Search by name, email or role..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-transparent text-sm outline-none placeholder:text-zinc-400"
          style={{ color: 'var(--theme-text-primary)' }}
        />
      </div>

      {/* Users Table */}
      <div
        className="overflow-hidden rounded-xl border shadow-sm"
        style={{ borderColor: 'var(--theme-border)' }}
      >
        <table className="w-full text-left border-collapse text-sm">
          <thead>
            <tr
              className="border-b text-xs font-semibold uppercase tracking-wider"
              style={{ borderColor: 'var(--theme-border)', color: 'var(--theme-text-muted)', backgroundColor: 'var(--theme-bg-elevated)' }}
            >
              <th className="px-5 py-3.5">User</th>
              <th className="px-5 py-3.5">Role</th>
              <th className="px-5 py-3.5 hidden sm:table-cell">Joined</th>
              <th className="px-5 py-3.5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((u) => {
              const isSelf = currentUser && (currentUser.id === u._id || currentUser.email === u.email);
              const isEditing = editingId === u._id;
              const isDeleting = deletingId === u._id;

              return (
                <tr
                  key={u._id}
                  className="border-b transition-colors hover:bg-zinc-50/50 dark:hover:bg-zinc-800/30"
                  style={{ borderColor: 'var(--theme-border-soft)' }}
                >
                  {/* User Info */}
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div
                        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-bold"
                        style={{ backgroundColor: 'var(--theme-bg-elevated)', color: 'var(--theme-text-primary)' }}
                      >
                        {u.name?.charAt(0).toUpperCase() || '?'}
                      </div>
                      <div>
                        <p className="font-semibold" style={{ color: 'var(--theme-text-primary)' }}>
                          {u.name}
                          {isSelf && (
                            <span className="ml-2 rounded bg-amber-500/10 px-1.5 py-0.5 text-[10px] font-bold text-amber-500">
                              YOU
                            </span>
                          )}
                        </p>
                        <p className="text-xs" style={{ color: 'var(--theme-text-muted)' }}>{u.email}</p>
                      </div>
                    </div>
                  </td>

                  {/* Role — editable */}
                  <td className="px-5 py-4">
                    {isEditing ? (
                      <select
                        value={editRole}
                        onChange={(e) => setEditRole(e.target.value as UserRole)}
                        autoFocus
                        className="rounded-lg border px-2 py-1 text-xs outline-none focus:border-amber-500"
                        style={{
                          borderColor: 'var(--theme-border)',
                          backgroundColor: 'var(--theme-bg-input)',
                          color: 'var(--theme-text-primary)',
                        }}
                      >
                        {ROLES.map((r) => (
                          <option key={r.value} value={r.value}>
                            {r.label}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <RoleBadge role={u.role || 'viewer'} />
                    )}
                  </td>

                  {/* Joined date */}
                  <td className="px-5 py-4 text-xs hidden sm:table-cell" style={{ color: 'var(--theme-text-muted)' }}>
                    {u.createdAt ? new Date(u.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : '—'}
                  </td>

                  {/* Actions */}
                  <td className="px-5 py-4">
                    <div className="flex items-center justify-end gap-2">
                      {isEditing ? (
                        <>
                          <button
                            onClick={() => setEditingId(null)}
                            disabled={actionLoading}
                            className="rounded-lg border px-2.5 py-1 text-xs transition-colors"
                            style={{ borderColor: 'var(--theme-border)' }}
                          >
                            Cancel
                          </button>
                          <button
                            onClick={() => handleRoleUpdate(u._id!)}
                            disabled={actionLoading}
                            className="flex items-center gap-1 rounded-lg bg-amber-600 px-2.5 py-1 text-xs font-semibold text-zinc-950 hover:bg-amber-500 disabled:opacity-60"
                          >
                            <Check className="h-3 w-3" />
                            Save Role
                          </button>
                        </>
                      ) : isDeleting ? (
                        <>
                          <p className="text-xs text-red-400 mr-1">Delete this user?</p>
                          <button
                            onClick={() => setDeletingId(null)}
                            className="rounded-lg border px-2.5 py-1 text-xs"
                            style={{ borderColor: 'var(--theme-border)' }}
                          >
                            No
                          </button>
                          <button
                            onClick={() => handleDelete(u._id!)}
                            disabled={actionLoading}
                            className="flex items-center gap-1 rounded-lg bg-red-600 px-2.5 py-1 text-xs font-semibold text-white hover:bg-red-500 disabled:opacity-60"
                          >
                            <Trash2 className="h-3 w-3" />
                            Confirm
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            title="Change Role"
                            onClick={() => {
                              setEditingId(u._id!);
                              setEditRole((u.role as UserRole) || 'viewer');
                              setDeletingId(null);
                            }}
                            disabled={isSelf ?? false}
                            className="flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-semibold transition-colors hover:bg-zinc-100 dark:hover:bg-zinc-800 disabled:opacity-40 disabled:cursor-not-allowed"
                            style={{ borderColor: 'var(--theme-border)' }}
                          >
                            <UserCog className="h-3.5 w-3.5" />
                            Edit Role
                          </button>
                          <button
                            title="Delete User"
                            onClick={() => {
                              setDeletingId(u._id!);
                              setEditingId(null);
                            }}
                            disabled={isSelf ?? false}
                            className="flex items-center gap-1.5 rounded-lg border border-red-500/20 bg-red-500/5 px-3 py-1.5 text-xs font-semibold text-red-500 transition-colors hover:bg-red-500/15 disabled:opacity-40 disabled:cursor-not-allowed"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                            Remove
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {filtered.length === 0 && !loading && (
          <div className="flex flex-col items-center justify-center py-16 gap-3" style={{ color: 'var(--theme-text-muted)' }}>
            <Users className="h-10 w-10" style={{ color: 'var(--theme-border)' }} />
            <p className="font-medium">{search ? 'No users match your search' : 'No users found'}</p>
          </div>
        )}
      </div>

      <p className="text-xs text-center" style={{ color: 'var(--theme-text-muted)' }}>
        Showing {filtered.length} of {users.length} total platform users · You cannot edit or delete your own account
      </p>
    </div>
  );
}
