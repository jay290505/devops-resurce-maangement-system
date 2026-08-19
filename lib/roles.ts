/**
 * Role-Based Access Control (RBAC) System
 * 
 * This file defines the permission matrix for the DevOps Resource Management Platform.
 * Extended to match the workflow and system architecture diagram classes.
 */

// All authorized actions in our platform
export type Action =
  | 'create_resource'     // Create a new VM, database, or container
  | 'edit_resource'       // Edit existing resource specs/configurations
  | 'delete_resource'     // Hard delete a resource (Admin only)
  | 'create_deployment'    // Deploy a code version to a resource
  | 'manage_users'        // View/update user roles (Admin only)
  | 'resolve_incident'    // Change status of degraded/down resources
  | 'create_request'      // Request new resources (DevOps Engineer / Team member)
  | 'approve_request'     // Approve/reject resource requests (Admin / Project Manager)
  | 'view_audit_logs'     // Access security audit log files (Admin / Auditor)
  | 'view_reports';       // Generate/export reports (Admin, PM, Auditor)

// Authorized system roles matching the architecture diagram
export type UserRole = 'admin' | 'devops_engineer' | 'project_manager' | 'viewer';

// Permission Matrix mapping each role to a set of allowed actions
const permissionMatrix: Record<UserRole, Set<Action>> = {
  // Admins have full access to everything
  admin: new Set([
    'create_resource',
    'edit_resource',
    'delete_resource',
    'create_deployment',
    'manage_users',
    'resolve_incident',
    'create_request',
    'approve_request',
    'view_audit_logs',
    'view_reports',
  ]),

  // Project Managers review requests and reports
  project_manager: new Set([
    'approve_request',
    'resolve_incident',
    'view_reports',
    'view_audit_logs',
  ]),

  // DevOps Engineers manage assets, trigger deployments, and request new infrastructure
  devops_engineer: new Set([
    'create_resource',
    'edit_resource',
    'create_deployment',
    'resolve_incident',
    'create_request',
  ]),

  // Viewers/Auditors have read-only access to stats and reports
  viewer: new Set([
    'view_reports',
  ]),
};

/**
 * Core helper function to authorize actions based on a user's role.
 * 
 * @param role - User's role
 * @param action - Action they wish to perform
 * @returns boolean - True if authorized, false otherwise
 */
export function hasPermission(role: UserRole, action: Action): boolean {
  const permissions = permissionMatrix[role];
  if (!permissions) return false;
  
  return permissions.has(action);
}
