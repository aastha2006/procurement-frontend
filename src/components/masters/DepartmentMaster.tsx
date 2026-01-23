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
import { Plus, Edit, Trash2, Building2, Users, Loader2, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

interface Department {
  id: string | number;
  name: string;
  code: string;
  departmentHead?: string; // API uses departmentHead
  head?: string; // UI uses head
  email?: string; // API uses email
  contactEmail?: string; // UI uses contactEmail
  phone?: string; // API uses phone
  contactPhone?: string; // UI uses contactPhone
  description?: string;
  isActive?: boolean;
}

interface DepartmentMasterProps {
  authToken?: string;
}

export function DepartmentMaster({ authToken }: DepartmentMasterProps) {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingDepartment, setEditingDepartment] = useState<Department | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch departments on component mount
  useEffect(() => {
    if (authToken) {
      fetchDepartments();
    }
  }, [authToken]);

  const fetchDepartments = async () => {
    setIsLoading(true);
    try {
      const response = await api.get('/common/department', {
        headers: {
          'accept': '*/*'
        }
      });

      if (response.ok) {
        const data = await response.json();

        // Map API response to UI format
        const mappedDepartments = data.map((dept: any) => ({
          id: dept.id,
          name: dept.name,
          code: dept.code,
          head: dept.departmentHead,
          contactEmail: dept.email,
          contactPhone: dept.phone,
          description: dept.description || '',
          isActive: true
        }));

        setDepartments(mappedDepartments);
      } else {
        console.error('Failed to fetch departments');
        toast.error('Failed to load departments');
      }
    } catch (error) {
      console.error('Error fetching departments:', error);
      toast.error('Unable to load departments', {
        description: 'Please check your connection and try again'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchDepartmentById = async (id: number | string) => {
    try {
      const response = await api.get(`/common/department/${id}`, {
        headers: {
          'accept': '*/*'
        }
      });

      if (response.ok) {
        const dept = await response.json();
        return {
          id: dept.id,
          name: dept.name,
          code: dept.code,
          head: dept.departmentHead,
          contactEmail: dept.email,
          contactPhone: dept.phone,
          description: dept.description || '',
          isActive: true
        };
      }
    } catch (error) {
      console.error('Error fetching department by ID:', error);
    }
    return null;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    const departmentData = {
      name: formData.get('name') as string,
      code: formData.get('code') as string,
      departmentHead: formData.get('head') as string,
      email: formData.get('contactEmail') as string,
      phone: formData.get('contactPhone') as string,
      society: {
        id: 1
      }
    };

    if (editingDepartment) {
      // Update existing department (local only for now)
      const updatedDepartment: Department = {
        id: editingDepartment.id,
        name: departmentData.name,
        code: departmentData.code,
        head: departmentData.departmentHead,
        contactEmail: departmentData.email,
        contactPhone: departmentData.phone,
        description: formData.get('description') as string,
        isActive: true
      };
      setDepartments(departments.map(d => d.id === editingDepartment.id ? updatedDepartment : d));
      toast.success('Department updated successfully!');
      setIsDialogOpen(false);
      setEditingDepartment(null);
    } else {
      // Create new department via API
      setIsSubmitting(true);
      try {
        const response = await api.post('/common/department/create', departmentData, {
          headers: {
            'accept': '*/*',
            'Content-Type': 'application/json'
          }
        });

        if (response.ok) {
          const createdDepartment = await response.json();

          toast.success('Department created successfully!');
          setIsDialogOpen(false);
          setEditingDepartment(null);

          // Refresh the department list from API
          fetchDepartments();
        } else {
          const errorText = await response.text();
          toast.error('Failed to create department', {
            description: errorText || 'Please try again'
          });
        }
      } catch (error) {
        console.error('Department creation error:', error);
        toast.error('Network error', {
          description: 'Unable to create department. Please check your connection.'
        });
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const handleEdit = (department: Department) => {
    setEditingDepartment(department);
    setIsDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    setDepartments(departments.filter(d => d.id !== id));
    toast.success('Department deleted successfully!');
  };

  const toggleStatus = (id: string) => {
    setDepartments(departments.map(d =>
      d.id === id ? { ...d, isActive: !d.isActive } : d
    ));
    toast.success('Department status updated!');
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="size-5 text-blue-600" />
                Department Master
              </CardTitle>
              <CardDescription>
                Manage departments and their responsible personnel
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={fetchDepartments}
                disabled={isLoading}
              >
                {isLoading ? (
                  <Loader2 className="size-4 mr-2 animate-spin" />
                ) : (
                  <RefreshCw className="size-4 mr-2" />
                )}
                Refresh
              </Button>
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button onClick={() => setEditingDepartment(null)}>
                    <Plus className="size-4 mr-2" />
                    Add Department
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>
                      {editingDepartment ? 'Edit Department' : 'Add New Department'}
                    </DialogTitle>
                    <DialogDescription>
                      {editingDepartment
                        ? 'Update department information'
                        : 'Create a new department for the society'}
                    </DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">Department Name</Label>
                        <Input
                          id="name"
                          name="name"
                          placeholder="e.g., Facility Management"
                          defaultValue={editingDepartment?.name}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="code">Department Code</Label>
                        <Input
                          id="code"
                          name="code"
                          placeholder="e.g., FM"
                          defaultValue={editingDepartment?.code}
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="head">Department Head</Label>
                      <Input
                        id="head"
                        name="head"
                        placeholder="Name of department head"
                        defaultValue={editingDepartment?.head}
                        required
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="contactEmail">Contact Email</Label>
                        <Input
                          id="contactEmail"
                          name="contactEmail"
                          type="email"
                          placeholder="department@society.com"
                          defaultValue={editingDepartment?.contactEmail}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="contactPhone">Contact Phone</Label>
                        <Input
                          id="contactPhone"
                          name="contactPhone"
                          type="tel"
                          placeholder="+91 98765 43210"
                          defaultValue={editingDepartment?.contactPhone}
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        name="description"
                        placeholder="Brief description of department responsibilities..."
                        rows={3}
                        defaultValue={editingDepartment?.description}
                        required
                      />
                    </div>

                    <div className="flex gap-3 pt-4">
                      <Button type="submit" className="flex-1" disabled={isSubmitting}>
                        {isSubmitting && <Loader2 className="size-4 mr-2 animate-spin" />}
                        {editingDepartment ? 'Update Department' : 'Create Department'}
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          setIsDialogOpen(false);
                          setEditingDepartment(null);
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
                  <TableHead>Code</TableHead>
                  <TableHead>Department Name</TableHead>
                  <TableHead>Department Head</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      <div className="flex items-center justify-center gap-2 text-slate-500">
                        <Loader2 className="size-5 animate-spin" />
                        <span>Loading departments...</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : departments.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      <div className="text-slate-500">
                        <Building2 className="size-12 mx-auto mb-2 text-slate-300" />
                        <p>No departments found</p>
                        <p className="text-sm mt-1">Click "Add Department" to create your first department</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  departments.map((dept) => (
                    <TableRow key={dept.id}>
                      <TableCell>
                        <Badge variant="outline">{dept.code}</Badge>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="text-slate-900">{dept.name}</p>
                          <p className="text-xs text-slate-500 mt-1">{dept.description}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Users className="size-4 text-slate-400" />
                          <span>{dept.head}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <p className="text-slate-900">{dept.contactEmail}</p>
                          <p className="text-slate-500">{dept.contactPhone}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleStatus(dept.id)}
                        >
                          <Badge className={dept.isActive ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-700'}>
                            {dept.isActive ? 'Active' : 'Inactive'}
                          </Badge>
                        </Button>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex gap-2 justify-end">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(dept)}
                          >
                            <Edit className="size-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(dept.id)}
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