import { useMemo } from 'react';
import { useOrganization } from '@/contexts/OrganizationContext';
import { useAuth } from '@/contexts/AuthContext';

export interface UserPermissions {
  role: 'owner' | 'manager' | 'editor' | 'viewer' | null;
  canManageMembers: boolean;
  canConnectChannels: boolean;
  canCreatePosts: boolean;
  canPublishPosts: boolean;
  canViewAnalytics: boolean;
  canViewPosts: boolean;
  canViewMedia: boolean;
  canManageBrand: boolean;
  canDeleteBrand: boolean;
  canInviteMembers: boolean;
  isOwner: boolean;
  isManager: boolean;
  isEditor: boolean;
  isViewer: boolean;
}

export function usePermissions(): UserPermissions {
  const { currentOrganization } = useOrganization();
  const { user } = useAuth();

  return useMemo(() => {
    // Default permissions (no access)
    const defaultPermissions: UserPermissions = {
      role: null,
      canManageMembers: false,
      canConnectChannels: false,
      canCreatePosts: false,
      canPublishPosts: false,
      canViewAnalytics: false,
      canViewPosts: false,
      canViewMedia: false,
      canManageBrand: false,
      canDeleteBrand: false,
      canInviteMembers: false,
      isOwner: false,
      isManager: false,
      isEditor: false,
      isViewer: false,
    };

    if (!currentOrganization || !user) {
      return defaultPermissions;
    }

    // Get user's role from organization (returned from API)
    // The role is included in the organization response from getUserOrganizations
    const orgRole = (currentOrganization as any).role as 'owner' | 'manager' | 'editor' | 'viewer' | undefined;

    // Check if user is owner by comparing IDs
    const ownerId = typeof currentOrganization.owner === 'object' 
      ? (currentOrganization.owner as any)._id 
      : currentOrganization.owner;
    
    const isOwnerById = ownerId === user._id;

    // Determine final role (prefer API role, fallback to owner check)
    let role: 'owner' | 'manager' | 'editor' | 'viewer' | null = orgRole || null;
    
    // If no role from API but user is owner, set role to owner
    if (!role && isOwnerById) {
      role = 'owner';
    }

    // If still no role, try localStorage (fallback)
    if (!role) {
      const storedRole = localStorage.getItem(`org_${currentOrganization._id}_role`) as 
        'owner' | 'manager' | 'editor' | 'viewer' | null;
      role = storedRole;
    }

    // Return permissions based on role
    switch (role) {
      case 'owner':
        return {
          role: 'owner',
          canManageMembers: true,
          canConnectChannels: true,
          canCreatePosts: true,
          canPublishPosts: true,
          canViewAnalytics: true,
          canViewPosts: true,
          canViewMedia: true,
          canManageBrand: true,
          canDeleteBrand: true,
          canInviteMembers: true,
          isOwner: true,
          isManager: false,
          isEditor: false,
          isViewer: false,
        };
      case 'manager':
        return {
          role: 'manager',
          canManageMembers: true,
          canConnectChannels: true,
          canCreatePosts: true,
          canPublishPosts: true,
          canViewAnalytics: true,
          canViewPosts: true,
          canViewMedia: true,
          canManageBrand: false,
          canDeleteBrand: false,
          canInviteMembers: true,
          isOwner: false,
          isManager: true,
          isEditor: false,
          isViewer: false,
        };
      case 'editor':
        return {
          role: 'editor',
          canManageMembers: false,
          canConnectChannels: false,
          canCreatePosts: true,
          canPublishPosts: true,
          canViewAnalytics: true,
          canViewPosts: true,
          canViewMedia: true,
          canManageBrand: false,
          canDeleteBrand: false,
          canInviteMembers: false,
          isOwner: false,
          isManager: false,
          isEditor: true,
          isViewer: false,
        };
      case 'viewer':
        return {
          role: 'viewer',
          canManageMembers: false,
          canConnectChannels: false,
          canCreatePosts: false,
          canPublishPosts: false,
          canViewAnalytics: true,
          canViewPosts: true,
          canViewMedia: false,
          canManageBrand: false,
          canDeleteBrand: false,
          canInviteMembers: false,
          isOwner: false,
          isManager: false,
          isEditor: false,
          isViewer: true,
        };
      default:
        return defaultPermissions;
    }
  }, [currentOrganization, user]);
}