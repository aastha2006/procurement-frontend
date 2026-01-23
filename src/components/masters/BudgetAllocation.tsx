import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Badge } from '../ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Plus, Edit, Wallet, TrendingUp } from 'lucide-react';
import { toast } from 'sonner';

interface BudgetAllocation {
  id: string;
  department: string;
  budgetHead: string;
  financialYear: string;
  allocatedAmount: number;
  utilizedAmount: number;
  remainingAmount: number;
  startDate: string;
  endDate: string;
}

export function BudgetAllocation() {
  const [allocations, setAllocations] = useState<BudgetAllocation[]>([
    {
      id: '1',
      department: 'Facility Management',
      budgetHead: 'Maintenance',
      financialYear: '2024-25',
      allocatedAmount: 500000,
      utilizedAmount: 320000,
      remainingAmount: 180000,
      startDate: '2024-04-01',
      endDate: '2025-03-31'
    },
    {
      id: '2',
      department: 'Facility Management',
      budgetHead: 'Corpus Fund',
      financialYear: '2024-25',
      allocatedAmount: 300000,
      utilizedAmount: 180000,
      remainingAmount: 120000,
      startDate: '2024-04-01',
      endDate: '2025-03-31'
    },
    {
      id: '3',
      department: 'Estate Management',
      budgetHead: 'Capital Expenditure',
      financialYear: '2024-25',
      allocatedAmount: 1000000,
      utilizedAmount: 450000,
      remainingAmount: 550000,
      startDate: '2024-04-01',
      endDate: '2025-03-31'
    },
    {
      id: '4',
      department: 'Security',
      budgetHead: 'Operational',
      financialYear: '2024-25',
      allocatedAmount: 200000,
      utilizedAmount: 145000,
      remainingAmount: 55000,
      startDate: '2024-04-01',
      endDate: '2025-03-31'
    },
  ]);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingAllocation, setEditingAllocation] = useState<BudgetAllocation | null>(null);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const allocatedAmount = parseFloat(formData.get('allocatedAmount') as string);
    const utilizedAmount = parseFloat(formData.get('utilizedAmount') as string) || 0;

    const newAllocation: BudgetAllocation = {
      id: editingAllocation?.id || Date.now().toString(),
      department: formData.get('department') as string,
      budgetHead: formData.get('budgetHead') as string,
      financialYear: formData.get('financialYear') as string,
      allocatedAmount,
      utilizedAmount,
      remainingAmount: allocatedAmount - utilizedAmount,
      startDate: formData.get('startDate') as string,
      endDate: formData.get('endDate') as string,
    };

    if (editingAllocation) {
      setAllocations(allocations.map(a => a.id === editingAllocation.id ? newAllocation : a));
      toast.success('Budget allocation updated successfully!');
    } else {
      setAllocations([...allocations, newAllocation]);
      toast.success('Budget allocation created successfully!');
    }

    setIsDialogOpen(false);
    setEditingAllocation(null);
  };

  const handleEdit = (allocation: BudgetAllocation) => {
    setEditingAllocation(allocation);
    setIsDialogOpen(true);
  };

  const getUtilizationColor = (percentage: number) => {
    if (percentage >= 80) return 'text-red-600';
    if (percentage >= 60) return 'text-orange-600';
    return 'text-green-600';
  };

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-slate-600">Total Allocated</p>
            <p className="text-slate-900 mt-1">
              ₹{(allocations.reduce((sum, a) => sum + a.allocatedAmount, 0) / 100000).toFixed(1)}L
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-slate-600">Total Utilized</p>
            <p className="text-slate-900 mt-1">
              ₹{(allocations.reduce((sum, a) => sum + a.utilizedAmount, 0) / 100000).toFixed(1)}L
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-slate-600">Total Remaining</p>
            <p className="text-slate-900 mt-1">
              ₹{(allocations.reduce((sum, a) => sum + a.remainingAmount, 0) / 100000).toFixed(1)}L
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-slate-600">Avg. Utilization</p>
            <p className="text-slate-900 mt-1">
              {((allocations.reduce((sum, a) => sum + a.utilizedAmount, 0) / 
                allocations.reduce((sum, a) => sum + a.allocatedAmount, 0)) * 100).toFixed(1)}%
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Wallet className="size-5 text-blue-600" />
                Budget Allocation
              </CardTitle>
              <CardDescription>
                Manage department-wise budget allocation and tracking
              </CardDescription>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={() => setEditingAllocation(null)}>
                  <Plus className="size-4 mr-2" />
                  Add Allocation
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>
                    {editingAllocation ? 'Edit Budget Allocation' : 'Add New Budget Allocation'}
                  </DialogTitle>
                  <DialogDescription>
                    {editingAllocation 
                      ? 'Update budget allocation details'
                      : 'Allocate budget to department and budget head'}
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="department">Department</Label>
                      <Select name="department" defaultValue={editingAllocation?.department} required>
                        <SelectTrigger id="department">
                          <SelectValue placeholder="Select department" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Facility Management">Facility Management</SelectItem>
                          <SelectItem value="Estate Management">Estate Management</SelectItem>
                          <SelectItem value="Security">Security</SelectItem>
                          <SelectItem value="Housekeeping">Housekeeping</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="budgetHead">Budget Head</Label>
                      <Select name="budgetHead" defaultValue={editingAllocation?.budgetHead} required>
                        <SelectTrigger id="budgetHead">
                          <SelectValue placeholder="Select budget head" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Maintenance">Maintenance</SelectItem>
                          <SelectItem value="Corpus Fund">Corpus Fund</SelectItem>
                          <SelectItem value="Capital Expenditure">Capital Expenditure</SelectItem>
                          <SelectItem value="Miscellaneous">Miscellaneous</SelectItem>
                          <SelectItem value="Operational">Operational</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="financialYear">Financial Year</Label>
                      <Select name="financialYear" defaultValue={editingAllocation?.financialYear || '2024-25'} required>
                        <SelectTrigger id="financialYear">
                          <SelectValue placeholder="Select FY" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="2023-24">2023-24</SelectItem>
                          <SelectItem value="2024-25">2024-25</SelectItem>
                          <SelectItem value="2025-26">2025-26</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="allocatedAmount">Allocated Amount (₹)</Label>
                      <Input
                        id="allocatedAmount"
                        name="allocatedAmount"
                        type="number"
                        placeholder="e.g., 500000"
                        defaultValue={editingAllocation?.allocatedAmount}
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="startDate">Start Date</Label>
                      <Input
                        id="startDate"
                        name="startDate"
                        type="date"
                        defaultValue={editingAllocation?.startDate}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="endDate">End Date</Label>
                      <Input
                        id="endDate"
                        name="endDate"
                        type="date"
                        defaultValue={editingAllocation?.endDate}
                        required
                      />
                    </div>
                  </div>

                  {editingAllocation && (
                    <div className="space-y-2">
                      <Label htmlFor="utilizedAmount">Utilized Amount (₹)</Label>
                      <Input
                        id="utilizedAmount"
                        name="utilizedAmount"
                        type="number"
                        placeholder="e.g., 320000"
                        defaultValue={editingAllocation?.utilizedAmount}
                      />
                    </div>
                  )}

                  <div className="flex gap-3 pt-4">
                    <Button type="submit" className="flex-1">
                      {editingAllocation ? 'Update Allocation' : 'Create Allocation'}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setIsDialogOpen(false);
                        setEditingAllocation(null);
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
                  <TableHead>Department</TableHead>
                  <TableHead>Budget Head</TableHead>
                  <TableHead>FY</TableHead>
                  <TableHead className="text-right">Allocated</TableHead>
                  <TableHead className="text-right">Utilized</TableHead>
                  <TableHead className="text-right">Remaining</TableHead>
                  <TableHead>Utilization %</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {allocations.map((allocation) => {
                  const utilizationPercent = (allocation.utilizedAmount / allocation.allocatedAmount) * 100;
                  return (
                    <TableRow key={allocation.id}>
                      <TableCell className="text-slate-900">{allocation.department}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{allocation.budgetHead}</Badge>
                      </TableCell>
                      <TableCell>{allocation.financialYear}</TableCell>
                      <TableCell className="text-right">₹{(allocation.allocatedAmount / 1000).toFixed(0)}K</TableCell>
                      <TableCell className="text-right">₹{(allocation.utilizedAmount / 1000).toFixed(0)}K</TableCell>
                      <TableCell className="text-right">₹{(allocation.remainingAmount / 1000).toFixed(0)}K</TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <TrendingUp className={`size-4 ${getUtilizationColor(utilizationPercent)}`} />
                            <span className={getUtilizationColor(utilizationPercent)}>
                              {utilizationPercent.toFixed(1)}%
                            </span>
                          </div>
                          <div className="w-full bg-slate-200 rounded-full h-2">
                            <div
                              className={`h-2 rounded-full ${
                                utilizationPercent >= 80 ? 'bg-red-600' :
                                utilizationPercent >= 60 ? 'bg-orange-600' :
                                'bg-green-600'
                              }`}
                              style={{ width: `${Math.min(utilizationPercent, 100)}%` }}
                            ></div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(allocation)}
                        >
                          <Edit className="size-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
