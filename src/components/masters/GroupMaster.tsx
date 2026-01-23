import { useState, useEffect } from 'react';
import { api } from '../../api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Badge } from '../ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Plus, Edit, Trash2, Users2, AlertCircle, Loader2, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

interface Group {
  id: string;
  groupId: number;
  name: string;
  code: string;
  type: 'Society' | 'Supplier';
  description: string;
  memberCount: number;
  isActive: boolean;
}

interface GroupMasterProps {
  authToken?: string;
}

export function GroupMaster({ authToken }: GroupMasterProps) {
  const [groups, setGroups] = useState<Group[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingGroup, setEditingGroup] = useState<Group | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch groups from API
  const fetchGroups = async () => {
    if (!authToken) {
      console.log('No auth token available for fetching groups');
      return;
    }

    setIsLoading(true);

    try {
      const response = await api.get('/auth/groups', {
        headers: {
          'accept': '*/*'
        }
      });

      if (response.ok) {
        const data = await response.json();

        // Map API response to our Group interface
        const mappedGroups: Group[] = data.map((group: any) => ({
          id: group.id?.toString() || '',
          groupId: group.id || 0,
          name: group.name || '',
          code: group.code || '',
          type: group.type || 'Society',
          description: group.description || '',
          memberCount: group.memberCount || 0,
          isActive: group.active !== undefined ? group.active : true
        }));

        setGroups(mappedGroups);
      } else {
        console.error('Failed to fetch groups:', response.status);
        toast.error('Failed to load groups', {
          description: 'Unable to retrieve groups from server'
        });
      }
    } catch (error) {
      console.error('Error fetching groups:', error);
      toast.error('Network error', {
        description: 'Unable to connect to server'
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch groups on component mount
  useEffect(() => {
    if (authToken) {
      fetchGroups();
    }
  }, [authToken]);

  // Fetch group by ID
  const fetchGroupById = async (id: string) => {
    if (!authToken) {
      toast.error('Authentication required', {
        description: 'Please log in to view group details'
      });
      return null;
    }

    try {
      const response = await api.get(`/auth/groups?id=${id}`, {
        headers: {
          'accept': '*/*'
        }
      });

      if (response.ok) {
        const data = await response.json();

        // Map API response to our Group interface
        const group: Group = {
          id: data.id?.toString() || '',
          groupId: data.id || 0,
          name: data.name || '',
          code: data.code || '',
          type: data.type || 'Society',
          description: data.description || '',
          memberCount: data.memberCount || 0,
          isActive: data.active !== undefined ? data.active : true
        };

        return group;
      } else {
        const errorData = await response.json().catch(() => null);
        const errorMessage = errorData?.message || 'Failed to fetch group details';

        toast.error('Failed to load group', {
          description: errorMessage
        });
        return null;
      }
    } catch (error) {
      console.error('Error fetching group by ID:', error);
      toast.error('Network error', {
        description: 'Unable to connect to server'
      });
      return null;
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!authToken) {
      toast.error('Authentication required', {
        description: 'Please log in to create a group'
      });
      return;
    }

    setIsSubmitting(true);

    const formData = new FormData(e.currentTarget);

    const groupData = {
      name: formData.get('name') as string,
      description: formData.get('description') as string,
      code: formData.get('code') as string,
      type: formData.get('type') as string,
      active: true
    };

    try {
      if (editingGroup) {
        // Update existing group (will be implemented later)
        const updatedGroup: Group = {
          ...editingGroup,
          name: groupData.name,
          code: groupData.code,
          type: groupData.type as 'Society' | 'Supplier',
          description: groupData.description
        };

        setGroups(groups.map(g => g.id === editingGroup.id ? updatedGroup : g));
        toast.success('Group updated successfully!');
        setIsDialogOpen(false);
        setEditingGroup(null);
      } else {
        // Create new group via API
        const response = await api.post('/auth/groups', groupData, {
          headers: {
            'Content-Type': 'application/json'
          }
        });

        if (response.ok) {
          const createdGroup = await response.json();

          toast.success('Group created successfully!');
          setIsDialogOpen(false);

          // Reset form and refresh the list
          e.currentTarget.reset();
          await fetchGroups();
        } else {
          const errorData = await response.json().catch(() => null);
          const errorMessage = errorData?.message || 'Failed to create group';

          toast.error('Creation Failed', {
            description: errorMessage
          });
        }
      }
    } catch (error) {
      console.error('Error creating group:', error);
      toast.error('Unable to create group', {
        description: 'Please check your connection and try again'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (group: Group) => {
    setEditingGroup(group);
    setIsDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    const group = groups.find(g => g.id === id);
    if (group && group.memberCount > 0) {
      toast.error('Cannot delete group', {
        description: 'This group has active members. Please reassign members before deleting.'
      });
      return;
    }
    setGroups(groups.filter(g => g.id !== id));
    toast.success('Group deleted successfully!');
  };

  const toggleStatus = (id: string) => {
    setGroups(groups.map(g =>
      g.id === id ? { ...g, isActive: !g.isActive } : g
    ));
    toast.success('Group status updated!');
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Users2 className="size-5 text-blue-600" />
                Group Master
              </CardTitle>
              <CardDescription>
                Manage user groups for society members and suppliers
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={fetchGroups}
                disabled={isLoading}
              >
                <RefreshCw className={`size-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button onClick={() => setEditingGroup(null)}>
                    <Plus className="size-4 mr-2" />
                    Add Group
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>
                      {editingGroup ? 'Edit Group' : 'Add New Group'}
                    </DialogTitle>
                    <DialogDescription>
                      {editingGroup
                        ? 'Update group information'
                        : 'Create a new user group'}
                    </DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">Group Name</Label>
                        <Input
                          id="name"
                          name="name"
                          placeholder="e.g., MC Members"
                          defaultValue={editingGroup?.name}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="code">Group Code</Label>
                        <Input
                          id="code"
                          name="code"
                          placeholder="e.g., MC"
                          defaultValue={editingGroup?.code}
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="type">Group Type</Label>
                      <Select name="type" defaultValue={editingGroup?.type || 'Society'} required>
                        <SelectTrigger id="type">
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Society">Society</SelectItem>
                          <SelectItem value="Supplier">Supplier</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        name="description"
                        placeholder="Brief description of this group and its purpose..."
                        rows={3}
                        defaultValue={editingGroup?.description}
                        required
                      />
                    </div>

                    <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <div className="flex items-start gap-2">
                        <AlertCircle className="size-4 text-blue-600 flex-shrink-0 mt-0.5" />
                        <p className="text-xs text-blue-900">
                          Groups are used to organize users and assign permissions. You can assign roles to groups in the Roles & Permissions tab.
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-3 pt-4">
                      <Button type="submit" className="flex-1" disabled={isSubmitting}>
                        {isSubmitting ? (
                          <>
                            <Loader2 className="size-4 mr-2 animate-spin" />
                            {editingGroup ? 'Updating...' : 'Creating...'}
                          </>
                        ) : (
                          editingGroup ? 'Update Group' : 'Create Group'
                        )}
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          setIsDialogOpen(false);
                          setEditingGroup(null);
                        }}
                        disabled={isSubmitting}
                      >
                        Cancel
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border border-slate-200">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Group ID</TableHead>
                  <TableHead>Group Name</TableHead>
                  <TableHead>Code</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Members</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-12">
                      <div className="flex flex-col items-center gap-3">
                        <Loader2 className="size-8 animate-spin text-blue-600" />
                        <p className="text-slate-500">Loading groups...</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : groups.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-12">
                      <div className="flex flex-col items-center gap-3">
                        <Users2 className="size-12 text-slate-300" />
                        <div>
                          <p className="text-slate-900 mb-1">No groups found</p>
                          <p className="text-sm text-slate-500">
                            Get started by creating your first group
                          </p>
                        </div>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  groups.map((group) => (
                    <TableRow key={group.id}>
                      <TableCell>
                        <Badge variant="outline">#{group.groupId}</Badge>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="text-slate-900">{group.name}</p>
                          <p className="text-xs text-slate-500 mt-1">{group.description}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{group.code}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={group.type === 'Society' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'}>
                          {group.type}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Users2 className="size-4 text-slate-400" />
                          <span>{group.memberCount}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleStatus(group.id)}
                        >
                          <Badge className={group.isActive ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-700'}>
                            {group.isActive ? 'Active' : 'Inactive'}
                          </Badge>
                        </Button>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex gap-2 justify-end">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(group)}
                          >
                            <Edit className="size-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(group.id)}
                          >
                            <Trash2 className="size-4 text-red-600" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}