import React, { useState, useEffect } from 'react';
import { useOrganization } from '@/contexts/OrganizationContext';
import { useAuth } from '@/contexts/AuthContext';
import { organizationApi } from '@/services/organizationApi';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { UserPlus, Trash2, Shield, Edit, Eye, Crown } from 'lucide-react';
import { Membership, User, MemberRole } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { handleApiError } from '@/lib/api';

export const TeamSettings: React.FC = () => {
  const { currentOrganization } = useOrganization();
  const { user: currentUser } = useAuth();
  const { toast } = useToast();
  const [members, setMembers] = useState<Membership[]>([]);
  const [loading, setLoading] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<MemberRole>('viewer');

  // Find current user's membership to check permissions
  const currentUserMembership = members.find(
    m => (m.user as User)._id === currentUser?._id
  );
  const currentUserRole = currentUserMembership?.role;
  const canManageMembers = currentUserRole === 'owner' || currentUserRole === 'manager';
  const isOwner = currentUserRole === 'owner';

  const fetchMembers = async () => {
    if (!currentOrganization) return;

    try {
      setLoading(true);
      const response = await organizationApi.getMembers(currentOrganization._id);
      setMembers(response.data);
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: handleApiError(error),
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMembers();
  }, [currentOrganization]);

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentOrganization) return;

    try {
      await organizationApi.inviteMember(currentOrganization._id, {
        email: inviteEmail,
        role: inviteRole,
      });
      toast({
        title: 'Success',
        description: 'Invitation sent successfully',
      });
      setInviteEmail('');
      setInviteRole('viewer');
      fetchMembers();
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: handleApiError(error),
      });
    }
  };

  const handleRemoveMember = async (userId: string) => {
    if (!currentOrganization) return;

    try {
      await organizationApi.removeMember(currentOrganization._id, userId);
      toast({
        title: 'Success',
        description: 'Member removed successfully',
      });
      fetchMembers();
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: handleApiError(error),
      });
    }
  };

  const handleUpdateRole = async (userId: string, role: MemberRole) => {
    if (!currentOrganization) return;

    try {
      await organizationApi.updateMemberRole(currentOrganization._id, userId, role);
      toast({
        title: 'Success',
        description: 'Role updated successfully',
      });
      fetchMembers();
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: handleApiError(error),
      });
    }
  };

  // Check if current user can change a specific member's role
  const canChangeRole = (member: Membership): boolean => {
    const memberUser = member.user as User;
    
    // Can't change own role
    if (memberUser._id === currentUser?._id) return false;
    
    // Can't change owner's role
    if (member.role === 'owner') return false;
    
    // Only owner and manager can change roles
    if (!canManageMembers) return false;
    
    // Managers can't change other managers
    if (currentUserRole === 'manager' && member.role === 'manager') return false;
    
    return true;
  };

  // Check if current user can remove a specific member
  const canRemoveMember = (member: Membership): boolean => {
    const memberUser = member.user as User;
    
    // Can't remove owner
    if (member.role === 'owner') return false;
    
    // Users can leave themselves (except owner)
    if (memberUser._id === currentUser?._id && currentUserRole !== 'owner') return true;
    
    // Only owner and manager can remove others
    if (!canManageMembers) return false;
    
    // Managers can't remove other managers
    if (currentUserRole === 'manager' && member.role === 'manager') return false;
    
    return true;
  };

  // Get available roles for dropdown based on current user's role
  const getAvailableRoles = (): MemberRole[] => {
    if (isOwner) {
      return ['viewer', 'editor', 'manager'];
    }
    if (currentUserRole === 'manager') {
      return ['viewer', 'editor']; // Managers can't promote to manager
    }
    return [];
  };

  // Helper: Get role badge variant and icon
  const getRoleBadge = (role: MemberRole) => {
    const roleConfig = {
      owner: { 
        variant: 'default' as const, 
        icon: <Crown className="h-3 w-3 mr-1" />,
        color: 'bg-purple-100 text-purple-700 border-purple-200'
      },
      manager: { 
        variant: 'secondary' as const, 
        icon: <Shield className="h-3 w-3 mr-1" />,
        color: 'bg-blue-100 text-blue-700 border-blue-200'
      },
      editor: { 
        variant: 'outline' as const, 
        icon: <Edit className="h-3 w-3 mr-1" />,
        color: 'bg-green-100 text-green-700 border-green-200'
      },
      viewer: { 
        variant: 'outline' as const, 
        icon: <Eye className="h-3 w-3 mr-1" />,
        color: 'bg-gray-100 text-gray-700 border-gray-200'
      },
    };

    const config = roleConfig[role];
    return (
      <Badge variant={config.variant} className={`${config.color} flex items-center w-fit`}>
        {config.icon}
        {role.charAt(0).toUpperCase() + role.slice(1)}
      </Badge>
    );
  };

  if (!currentOrganization) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Team Members</CardTitle>
          <CardDescription>No organization selected</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Invite Member - Only show if user can manage members */}
      {canManageMembers && (
        <Card>
          <CardHeader>
            <CardTitle>Invite Team Member</CardTitle>
            <CardDescription>Send an invitation to join your organization</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleInvite} className="flex gap-4">
              <div className="flex-1 space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder="colleague@example.com"
                  required
                />
              </div>
              <div className="w-40 space-y-2">
                <Label htmlFor="role">Role</Label>
                <Select 
                  value={inviteRole} 
                  onValueChange={(value: MemberRole) => setInviteRole(value)}
                >
                  <SelectTrigger id="role">
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="viewer">
                      <div className="flex items-center gap-2">
                        <Eye className="h-4 w-4" />
                        Viewer
                      </div>
                    </SelectItem>
                    <SelectItem value="editor">
                      <div className="flex items-center gap-2">
                        <Edit className="h-4 w-4" />
                        Editor
                      </div>
                    </SelectItem>
                    {isOwner && (
                      <SelectItem value="manager">
                        <div className="flex items-center gap-2">
                          <Shield className="h-4 w-4" />
                          Manager
                        </div>
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-end">
                <Button type="submit" disabled={loading}>
                  <UserPlus className="mr-2 h-4 w-4" />
                  {loading ? 'Inviting...' : 'Invite'}
                </Button>
              </div>
            </form>

            {/* Role Descriptions */}
            <div className="mt-4 p-4 bg-muted rounded-lg space-y-2 text-sm">
              <p className="font-medium">Role Permissions:</p>
              <ul className="space-y-1 text-muted-foreground">
                <li><strong>Owner:</strong> Full access, manage members, transfer ownership</li>
                <li><strong>Manager:</strong> Connect channels, create/publish posts, invite viewers/editors</li>
                <li><strong>Editor:</strong> Create/publish posts, view analytics</li>
                <li><strong>Viewer:</strong> View analytics and posts only</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Team Members List */}
      <Card>
        <CardHeader>
          <CardTitle>Team Members</CardTitle>
          <CardDescription>
            {canManageMembers 
              ? 'Manage your organization members' 
              : 'View your organization members'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : members.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No team members yet. Invite someone to get started!
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Member</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Joined</TableHead>
                  {canManageMembers && <TableHead className="text-right">Actions</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {members.map((member) => {
                  const user = member.user as User;
                  const isCurrentUser = user._id === currentUser?._id;
                  
                  return (
                    <TableRow key={member._id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={user.avatarUrl || user.avatar} />
                            <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium">
                              {user.name}
                              {isCurrentUser && (
                                <span className="ml-2 text-xs text-muted-foreground">(You)</span>
                              )}
                            </div>
                            <div className="text-sm text-muted-foreground">{user.email}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {!canChangeRole(member) ? (
                          getRoleBadge(member.role)
                        ) : (
                          <Select
                            value={member.role}
                            onValueChange={(value: MemberRole) =>
                              handleUpdateRole(user._id, value)
                            }
                          >
                            <SelectTrigger className="w-32">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {getAvailableRoles().map((role) => (
                                <SelectItem key={role} value={role}>
                                  {role.charAt(0).toUpperCase() + role.slice(1)}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        )}
                      </TableCell>
                      <TableCell>
                        {new Date(member.createdAt).toLocaleDateString()}
                      </TableCell>
                      {canManageMembers && (
                        <TableCell className="text-right">
                          {canRemoveMember(member) && (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleRemoveMember(user._id)}
                              title={isCurrentUser ? 'Leave organization' : 'Remove member'}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </TableCell>
                      )}
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};