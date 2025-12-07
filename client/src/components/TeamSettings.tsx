import React, { useState, useEffect } from 'react';
import { useOrganization } from '@/contexts/OrganizationContext';
import { useAuth } from '@/contexts/AuthContext';
import { usePermissions } from '@/hooks/usePermissions';
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
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { UserPlus, Trash2, Shield, Edit, Eye, Crown, Users } from 'lucide-react';
import { Membership, User, MemberRole } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { handleApiError } from '@/lib/api';

export const TeamSettings: React.FC = () => {
  const { currentOrganization } = useOrganization();
  const { user: currentUser } = useAuth();
  const permissions = usePermissions();
  const { toast } = useToast();
  const [members, setMembers] = useState<Membership[]>([]);
  const [loading, setLoading] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<MemberRole>('viewer');

  // Use permissions hook for role-based access
  const canManageMembers = permissions.canManageMembers || permissions.canInviteMembers;
  const isOwner = permissions.isOwner;
  const isManager = permissions.isManager;

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
    if (!currentOrganization || !canManageMembers) return;

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
    if (!currentOrganization || !canManageMembers) return;

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

  const handleRoleChange = async (userId: string, newRole: MemberRole) => {
    if (!currentOrganization || !canManageMembers) return;

    try {
      await organizationApi.updateMemberRole(currentOrganization._id, userId, newRole);
      toast({
        title: 'Success',
        description: 'Member role updated',
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

  const getRoleBadge = (role: MemberRole) => {
    const roleConfig = {
      owner: { 
        variant: 'default' as const, 
        icon: <Crown className="h-3 w-3 mr-1" />,
        color: 'bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800'
      },
      manager: { 
        variant: 'secondary' as const, 
        icon: <Shield className="h-3 w-3 mr-1" />,
        color: 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800'
      },
      editor: { 
        variant: 'outline' as const, 
        icon: <Edit className="h-3 w-3 mr-1" />,
        color: 'bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800'
      },
      viewer: { 
        variant: 'outline' as const, 
        icon: <Eye className="h-3 w-3 mr-1" />,
        color: 'bg-gray-100 text-gray-700 border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700'
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
      {/* Read-only notice for non-managers */}
      {!canManageMembers && (
        <Alert>
          <Eye className="h-4 w-4" />
          <AlertTitle>View Only</AlertTitle>
          <AlertDescription>
            You don't have permission to manage team members. 
            Only owners and managers can invite or remove members.
          </AlertDescription>
        </Alert>
      )}

      {/* Invite Member - Only show if user can manage members */}
      {canManageMembers && (
        <Card>
          <CardHeader>
            <CardTitle>Invite Team Member</CardTitle>
            <CardDescription>
              Add new members to your organization
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleInvite} className="flex gap-4 items-end flex-wrap">
              <div className="flex-1 min-w-[200px]">
                <Label htmlFor="invite-email">Email Address</Label>
                <Input
                  id="invite-email"
                  type="email"
                  placeholder="colleague@example.com"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  required
                />
              </div>
              <div className="w-[140px]">
                <Label htmlFor="invite-role">Role</Label>
                <Select value={inviteRole} onValueChange={(v) => setInviteRole(v as MemberRole)}>
                  <SelectTrigger>
                    <SelectValue />
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
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-violet-100 dark:bg-violet-900/30">
              <Users className="h-5 w-5 text-violet-600 dark:text-violet-400" />
            </div>
            <div>
              <CardTitle>Team Members</CardTitle>
              <CardDescription>
                {canManageMembers 
                  ? 'Manage your organization members' 
                  : 'View your organization members'}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : members.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No team members found
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
                  const memberUser = member.user as User;
                  const isCurrentUser = memberUser._id === currentUser?._id;
                  const isMemberOwner = member.role === 'owner';
                  const isMemberManager = member.role === 'manager';
                  
                  // Can only modify if:
                  // - Current user is owner (can modify anyone except self)
                  // - Current user is manager AND target is not owner/manager
                  const canModifyMember = canManageMembers && !isCurrentUser && !isMemberOwner && 
                    (isOwner || (isManager && !isMemberManager));

                  return (
                    <TableRow key={member._id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-10 w-10">
                            <AvatarImage src={memberUser.avatarUrl || memberUser.avatar} />
                            <AvatarFallback>
                              {memberUser.name?.charAt(0)?.toUpperCase() || 'U'}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">
                              {memberUser.name}
                              {isCurrentUser && (
                                <span className="text-muted-foreground ml-2">(You)</span>
                              )}
                            </p>
                            <p className="text-sm text-muted-foreground">{memberUser.email}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {canModifyMember ? (
                          <Select
                            value={member.role}
                            onValueChange={(v) => handleRoleChange(memberUser._id, v as MemberRole)}
                          >
                            <SelectTrigger className="w-[130px]">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="viewer">Viewer</SelectItem>
                              <SelectItem value="editor">Editor</SelectItem>
                              {isOwner && <SelectItem value="manager">Manager</SelectItem>}
                            </SelectContent>
                          </Select>
                        ) : (
                          getRoleBadge(member.role)
                        )}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {new Date(member.createdAt || '').toLocaleDateString()}
                      </TableCell>
                      {canManageMembers && (
                        <TableCell className="text-right">
                          {canModifyMember && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleRemoveMember(memberUser._id)}
                              className="text-destructive hover:text-destructive hover:bg-destructive/10"
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