import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Badge } from '../ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Plus, Edit, Trash2, Shield } from 'lucide-react';
import { toast } from 'sonner';

interface ApprovalLimit {
  id: string;
  role: string;
  processType: string;
  minAmount: number;
  maxAmount: number;
  requiresAdditionalApproval: boolean;
  additionalApprover?: string;
}

export function ApprovalLimits() {
  const [limits, setLimits] = useState<ApprovalLimit[]>([
    {
      id: '1',
      role: 'Estate Manager',
      processType: 'Purchase Requisition',
      minAmount: 0,
      maxAmount: 10000,
      requiresAdditionalApproval: false
    },
    {
      id: '2',
      role: 'Treasurer',
      processType: 'Purchase Requisition',
      minAmount: 10001,
      maxAmount: 25000,
      requiresAdditionalApproval: true,
      additionalApprover: 'Secretary'
    },
    {
      id: '3',
      role: 'MC Committee',
      processType: 'Purchase Requisition',
      minAmount: 25001,
      maxAmount: 999999999,
      requiresAdditionalApproval: true,
      additionalApprover: 'Majority Vote'
    },
    {
      id: '4',
      role: 'Treasurer',
      processType: 'Payment Approval',
      minAmount: 0,
      maxAmount: 25000,
      requiresAdditionalApproval: false
    },
    {
      id: '5',
      role: 'Treasurer',
      processType: 'Payment Approval',
      minAmount: 25001,
      maxAmount: 50000,
      requiresAdditionalApproval: true,
      additionalApprover: 'Secretary'
    },
  ]);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingLimit, setEditingLimit] = useState<ApprovalLimit | null>(null);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const newLimit: ApprovalLimit = {
      id: editingLimit?.id || Date.now().toString(),
      role: formData.get('role') as string,
      processType: formData.get('processType') as string,
      minAmount: parseFloat(formData.get('minAmount') as string),
      maxAmount: parseFloat(formData.get('maxAmount') as string),
      requiresAdditionalApproval: formData.get('requiresAdditionalApproval') === 'yes',
      additionalApprover: formData.get('additionalApprover') as string || undefined,
    };

    if (editingLimit) {
      setLimits(limits.map(l => l.id === editingLimit.id ? newLimit : l));
      toast.success('Approval limit updated successfully!');
    } else {
      setLimits([...limits, newLimit]);
      toast.success('Approval limit created successfully!');
    }

    setIsDialogOpen(false);
    setEditingLimit(null);
  };

  const handleEdit = (limit: ApprovalLimit) => {
    setEditingLimit(limit);
    setIsDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    setLimits(limits.filter(l => l.id !== id));
    toast.success('Approval limit deleted successfully!');
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Shield className="size-5 text-blue-600" />
                Approval Limits
              </CardTitle>
              <CardDescription>
                Define approval authority limits for different roles and processes
              </CardDescription>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={() => setEditingLimit(null)}>
                  <Plus className="size-4 mr-2" />
                  Add Limit
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>
                    {editingLimit ? 'Edit Approval Limit' : 'Add New Approval Limit'}
                  </DialogTitle>
                  <DialogDescription>
                    Configure approval authority and financial limits
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="role">Role / Designation</Label>
                      <Select name="role" defaultValue={editingLimit?.role} required>
                        <SelectTrigger id="role">
                          <SelectValue placeholder="Select role" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Estate Manager">Estate Manager</SelectItem>
                          <SelectItem value="Treasurer">Treasurer</SelectItem>
                          <SelectItem value="Secretary">Secretary</SelectItem>
                          <SelectItem value="President">President</SelectItem>
                          <SelectItem value="MC Committee">MC Committee</SelectItem>
                          <SelectItem value="Accountant">Accountant</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="processType">Process Type</Label>
                      <Select name="processType" defaultValue={editingLimit?.processType} required>
                        <SelectTrigger id="processType">
                          <SelectValue placeholder="Select process" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Purchase Requisition">Purchase Requisition</SelectItem>
                          <SelectItem value="Quotation Approval">Quotation Approval</SelectItem>
                          <SelectItem value="Purchase Order">Purchase Order</SelectItem>
                          <SelectItem value="Payment Approval">Payment Approval</SelectItem>
                          <SelectItem value="Vendor Onboarding">Vendor Onboarding</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="minAmount">Minimum Amount (₹)</Label>
                      <Input
                        id="minAmount"
                        name="minAmount"
                        type="number"
                        placeholder="e.g., 0"
                        defaultValue={editingLimit?.minAmount}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="maxAmount">Maximum Amount (₹)</Label>
                      <Input
                        id="maxAmount"
                        name="maxAmount"
                        type="number"
                        placeholder="e.g., 10000"
                        defaultValue={editingLimit?.maxAmount}
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="requiresAdditionalApproval">Requires Additional Approval?</Label>
                    <Select 
                      name="requiresAdditionalApproval" 
                      defaultValue={editingLimit?.requiresAdditionalApproval ? 'yes' : 'no'} 
                      required
                    >
                      <SelectTrigger id="requiresAdditionalApproval">
                        <SelectValue placeholder="Select option" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="no">No</SelectItem>
                        <SelectItem value="yes">Yes</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="additionalApprover">Additional Approver (if required)</Label>
                    <Input
                      id="additionalApprover"
                      name="additionalApprover"
                      placeholder="e.g., Secretary, Majority Vote"
                      defaultValue={editingLimit?.additionalApprover}
                    />
                  </div>

                  <div className="flex gap-3 pt-4">
                    <Button type="submit" className="flex-1">
                      {editingLimit ? 'Update Limit' : 'Create Limit'}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setIsDialogOpen(false);
                        setEditingLimit(null);
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border border-slate-200">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Role</TableHead>
                  <TableHead>Process Type</TableHead>
                  <TableHead>Amount Range</TableHead>
                  <TableHead>Additional Approval</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {limits.map((limit) => (
                  <TableRow key={limit.id}>
                    <TableCell>
                      <Badge variant="outline">{limit.role}</Badge>
                    </TableCell>
                    <TableCell className="text-slate-900">{limit.processType}</TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <span className="text-slate-900">
                          ₹{limit.minAmount.toLocaleString()} - ₹{limit.maxAmount.toLocaleString()}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {limit.requiresAdditionalApproval ? (
                        <div>
                          <Badge className="bg-orange-100 text-orange-700">Required</Badge>
                          {limit.additionalApprover && (
                            <p className="text-xs text-slate-500 mt-1">{limit.additionalApprover}</p>
                          )}
                        </div>
                      ) : (
                        <Badge className="bg-green-100 text-green-700">Not Required</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex gap-2 justify-end">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(limit)}
                        >
                          <Edit className="size-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(limit.id)}
                        >
                          <Trash2 className="size-4 text-red-600" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
