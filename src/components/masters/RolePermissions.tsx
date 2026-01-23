import { useState, useEffect } from 'react';
import { api } from '../../api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Badge } from '../ui/badge';
import { Checkbox } from '../ui/checkbox';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Plus, Edit, Shield, Eye, CheckCircle2, RefreshCw, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface Permission {
  module: string;
  canView: boolean;
  canCreate: boolean;
  canEdit: boolean;
  canDelete: boolean;
  canApprove: boolean;
}

interface Group {
  id: number;
  name: string;
  code: string | null;
  type: string | null;
  description: string | null;
}

interface Role {
  id: string;
  roleId: number;
  name: string;
  code: string;
  description: string;
  assignedGroups: Group[];
  permissions: Permission[];
  isActive: boolean;
}

interface RolePermissionsProps {
  authToken?: string;
}

const modules = [
  'Dashboard',
  'Purchase Requisition',
  'Vendor Management',
  'Quotations',
  'Purchase Orders',
  'Payments',
  'Reports',
  'Master Data'
];

export function RolePermissions({ authToken }: RolePermissionsProps) {
  const [roles, setRoles] = useState<Role[]>([]);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [isPermissionDialogOpen, setIsPermissionDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingPermissions, setIsLoadingPermissions] = useState(false);
  const [isSavingPermissions, setIsSavingPermissions] = useState(false);

  // Fetch roles from API
  const fetchRoles = async () => {
    if (!authToken) {
      console.log('No auth token available for fetching roles');
      return;
    }

    setIsLoading(true);

    try {
      const response = await api.get('/roles', {
        headers: {
          'accept': '*/*'
        }
      });

      if (response.ok) {
        const data = await response.json();

        // Map API response to our Role interface
        const mappedRoles: Role[] = data.map((role: any) => ({
          id: role.id?.toString() || '',
          roleId: role.id || 0,
          name: role.name || '',
          code: role.code || '',
          description: '', // API doesn't provide description, will use empty string
          assignedGroups: role.groups || [],
          permissions: modules.map(module => ({
            module,
            canView: false,
            canCreate: false,
            canEdit: false,
            canDelete: false,
            canApprove: false
          })), // Default permissions, will be updated when permissions API is available
          isActive: role.active !== undefined ? role.active : true
        }));

        setRoles(mappedRoles);
      } else {
        console.error('Failed to fetch roles:', response.status);
        toast.error('Failed to load roles', {
          description: 'Unable to retrieve roles from server'
        });
      }
    } catch (error) {
      console.error('Error fetching roles:', error);
      toast.error('Network error', {
        description: 'Unable to connect to server'
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch roles on component mount
  useEffect(() => {
    if (authToken) {
      fetchRoles();
    }
  }, [authToken]);

  // Fetch permissions for a specific role
  const fetchRolePermissions = async (roleId: number) => {
    if (!authToken) {
      toast.error('Authentication required', {
        description: 'Please log in to view permissions'
      });
      return null;
    }

    setIsLoadingPermissions(true);

    try {
      const response = await api.get(`/roles/${roleId}/permissions`, {
        headers: {
          'accept': '*/*'
        }
      });

      if (response.ok) {
        const data = await response.json();

        // Map API response to our Permission interface
        const permissions: Permission[] = data.map((perm: any) => ({
          module: perm.module || '',
          canView: perm.canView || false,
          canCreate: perm.canCreate || false,
          canEdit: perm.canEdit || false,
          canDelete: perm.canDelete || false,
          canApprove: perm.canApprove || false
        }));

        return permissions;
      } else {
        const errorData = await response.json().catch(() => null);
        const errorMessage = errorData?.message || 'Failed to fetch permissions';

        toast.error('Failed to load permissions', {
          description: errorMessage
        });
        return null;
      }
    } catch (error) {
      console.error('Error fetching role permissions:', error);
      toast.error('Network error', {
        description: 'Unable to connect to server'
      });
      return null;
    } finally {
      setIsLoadingPermissions(false);
    }
  };

  // Save/Update permissions for a specific role
  const saveRolePermissions = async (roleId: number, permissions: Permission[]) => {
    if (!authToken) {
      toast.error('Authentication required', {
        description: 'Please log in to save permissions'
      });
      return false;
    }

    setIsSavingPermissions(true);

    try {
      // Prepare request body (exclude id field if present)
      const requestBody = permissions.map(perm => ({
        module: perm.module,
        canView: perm.canView,
        canCreate: perm.canCreate,
        canEdit: perm.canEdit,
        canDelete: perm.canDelete,
        canApprove: perm.canApprove
      }));

      const response = await api.put(`/roles/${roleId}/permissions`, requestBody, {
        headers: {
          'accept': '*/*',
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        toast.success('Permissions updated successfully!');

        // Refresh roles list to update the permission summary
        await fetchRoles();

        return true;
      } else {
        const errorData = await response.json().catch(() => null);
        const errorMessage = errorData?.message || 'Failed to save permissions';

        toast.error('Failed to save permissions', {
          description: errorMessage
        });
        return false;
      }
    } catch (error) {
      console.error('Error saving role permissions:', error);
      toast.error('Network error', {
        description: 'Unable to connect to server'
      });
      return false;
    } finally {
      setIsSavingPermissions(false);
    }
  };

  const handlePermissionChange = (moduleIndex: number, field: keyof Omit<Permission, 'module'>) => {
    if (!selectedRole) return;

    const updatedPermissions = [...selectedRole.permissions];
    updatedPermissions[moduleIndex] = {
      ...updatedPermissions[moduleIndex],
      [field]: !updatedPermissions[moduleIndex][field]
    };

    setSelectedRole({
      ...selectedRole,
      permissions: updatedPermissions
    });
  };

  const handleSavePermissions = () => {
    if (!selectedRole) return;

    saveRolePermissions(selectedRole.roleId, selectedRole.permissions);
    setIsPermissionDialogOpen(false);
    setSelectedRole(null);
  };

  const openPermissionsDialog = async (role: Role) => {
    setSelectedRole(role);
    setIsPermissionDialogOpen(true);

    // Fetch fresh permissions from API
    const permissions = await fetchRolePermissions(role.roleId);

    if (permissions) {
      // Update selectedRole with fresh permissions
      setSelectedRole({
        ...role,
        permissions
      });
    }
  };

  const getPermissionSummary = (permissions: Permission[]) => {
    const hasFullAccess = permissions.every(p => p.canView && p.canCreate && p.canEdit && p.canDelete && p.canApprove);
    if (hasFullAccess) return 'Full Access';

    const viewCount = permissions.filter(p => p.canView).length;
    const createCount = permissions.filter(p => p.canCreate).length;

    return `${viewCount} View, ${createCount} Create`;
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Shield className="size-5 text-blue-600" />
                Roles & Permissions
              </CardTitle>
              <CardDescription>
                Configure role-based access control for different user groups
              </CardDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={fetchRoles}
              disabled={isLoading}
            >
              <RefreshCw className={`size-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border border-slate-200">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Role Name</TableHead>
                  <TableHead>Code</TableHead>
                  <TableHead>Assigned Groups</TableHead>
                  <TableHead>Permissions Summary</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-12">
                      <div className="flex flex-col items-center gap-3">
                        <Loader2 className="size-8 animate-spin text-blue-600" />
                        <p className="text-slate-500">Loading roles...</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : roles.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-12">
                      <div className="flex flex-col items-center gap-3">
                        <Shield className="size-12 text-slate-300" />
                        <div>
                          <p className="text-slate-900 mb-1">No roles found</p>
                          <p className="text-sm text-slate-500">
                            No roles are currently configured
                          </p>
                        </div>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  roles.map((role) => (
                    <TableRow key={role.id}>
                      <TableCell>
                        <div>
                          <p className="text-slate-900">{role.name}</p>
                          <p className="text-xs text-slate-500 mt-1">{role.description}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{role.code}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {role.assignedGroups.map((group, idx) => (
                            <Badge key={idx} variant="secondary" className="text-xs">
                              {group.name}
                            </Badge>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Eye className="size-4 text-blue-600" />
                          <span className="text-sm">{getPermissionSummary(role.permissions)}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={role.isActive ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-700'}>
                          {role.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openPermissionsDialog(role)}
                        >
                          <Edit className="size-4 mr-2" />
                          Edit Permissions
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Permissions Dialog */}
      <Dialog open={isPermissionDialogOpen} onOpenChange={setIsPermissionDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              Edit Permissions - {selectedRole?.name}
            </DialogTitle>
            <DialogDescription>
              Configure module-level permissions for this role
            </DialogDescription>
          </DialogHeader>

          {selectedRole && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Role Name</Label>
                  <Input value={selectedRole.name} disabled />
                </div>
                <div className="space-y-2">
                  <Label>Role Code</Label>
                  <Input value={selectedRole.code} disabled />
                </div>
              </div>

              {isLoadingPermissions ? (
                <div className="flex flex-col items-center gap-3 py-12">
                  <Loader2 className="size-8 animate-spin text-blue-600" />
                  <p className="text-slate-500">Loading permissions...</p>
                </div>
              ) : (
                <>
                  <div className="space-y-4">
                    <h3 className="text-slate-900">Module Permissions</h3>

                    <div className="rounded-lg border border-slate-200">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Module</TableHead>
                            <TableHead className="text-center">View</TableHead>
                            <TableHead className="text-center">Create</TableHead>
                            <TableHead className="text-center">Edit</TableHead>
                            <TableHead className="text-center">Delete</TableHead>
                            <TableHead className="text-center">Approve</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {selectedRole.permissions.map((permission, index) => (
                            <TableRow key={index}>
                              <TableCell className="text-slate-900">{permission.module}</TableCell>
                              <TableCell className="text-center">
                                <Checkbox
                                  checked={permission.canView}
                                  onCheckedChange={() => handlePermissionChange(index, 'canView')}
                                  disabled={isSavingPermissions}
                                />
                              </TableCell>
                              <TableCell className="text-center">
                                <Checkbox
                                  checked={permission.canCreate}
                                  onCheckedChange={() => handlePermissionChange(index, 'canCreate')}
                                  disabled={isSavingPermissions}
                                />
                              </TableCell>
                              <TableCell className="text-center">
                                <Checkbox
                                  checked={permission.canEdit}
                                  onCheckedChange={() => handlePermissionChange(index, 'canEdit')}
                                  disabled={isSavingPermissions}
                                />
                              </TableCell>
                              <TableCell className="text-center">
                                <Checkbox
                                  checked={permission.canDelete}
                                  onCheckedChange={() => handlePermissionChange(index, 'canDelete')}
                                  disabled={isSavingPermissions}
                                />
                              </TableCell>
                              <TableCell className="text-center">
                                <Checkbox
                                  checked={permission.canApprove}
                                  onCheckedChange={() => handlePermissionChange(index, 'canApprove')}
                                  disabled={isSavingPermissions}
                                />
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </div>

                  <div className="flex gap-3 pt-4">
                    <Button
                      onClick={handleSavePermissions}
                      className="flex-1"
                      disabled={isSavingPermissions}
                    >
                      {isSavingPermissions ? (
                        <>
                          <Loader2 className="size-4 mr-2 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="size-4 mr-2" />
                          Save Permissions
                        </>
                      )}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setIsPermissionDialogOpen(false);
                        setSelectedRole(null);
                      }}
                      disabled={isSavingPermissions}
                    >
                      Cancel
                    </Button>
                  </div>
                </>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}