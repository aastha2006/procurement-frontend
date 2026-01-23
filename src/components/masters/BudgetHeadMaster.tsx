import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Badge } from '../ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Plus, Edit, Trash2, FolderOpen } from 'lucide-react';
import { toast } from 'sonner';

interface BudgetHead {
  id: string;
  name: string;
  code: string;
  type: 'Operational' | 'Capital' | 'Reserve';
  description: string;
  isActive: boolean;
}

export function BudgetHeadMaster() {
  const [budgetHeads, setBudgetHeads] = useState<BudgetHead[]>([
    {
      id: '1',
      name: 'Maintenance',
      code: 'MAINT',
      type: 'Operational',
      description: 'Regular maintenance and repairs',
      isActive: true
    },
    {
      id: '2',
      name: 'Corpus Fund',
      code: 'CORPUS',
      type: 'Reserve',
      description: 'Long-term reserve fund',
      isActive: true
    },
    {
      id: '3',
      name: 'Capital Expenditure',
      code: 'CAPEX',
      type: 'Capital',
      description: 'Major improvements and equipment',
      isActive: true
    },
    {
      id: '4',
      name: 'Miscellaneous',
      code: 'MISC',
      type: 'Operational',
      description: 'Other operational expenses',
      isActive: true
    },
    {
      id: '5',
      name: 'Utilities',
      code: 'UTIL',
      type: 'Operational',
      description: 'Electricity, water, and other utilities',
      isActive: true
    },
  ]);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingHead, setEditingHead] = useState<BudgetHead | null>(null);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const newHead: BudgetHead = {
      id: editingHead?.id || Date.now().toString(),
      name: formData.get('name') as string,
      code: formData.get('code') as string,
      type: formData.get('type') as 'Operational' | 'Capital' | 'Reserve',
      description: formData.get('description') as string,
      isActive: true
    };

    if (editingHead) {
      setBudgetHeads(budgetHeads.map(h => h.id === editingHead.id ? newHead : h));
      toast.success('Budget head updated successfully!');
    } else {
      setBudgetHeads([...budgetHeads, newHead]);
      toast.success('Budget head created successfully!');
    }

    setIsDialogOpen(false);
    setEditingHead(null);
  };

  const handleEdit = (head: BudgetHead) => {
    setEditingHead(head);
    setIsDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    setBudgetHeads(budgetHeads.filter(h => h.id !== id));
    toast.success('Budget head deleted successfully!');
  };

  const toggleStatus = (id: string) => {
    setBudgetHeads(budgetHeads.map(h => 
      h.id === id ? { ...h, isActive: !h.isActive } : h
    ));
    toast.success('Budget head status updated!');
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'Operational':
        return 'bg-blue-100 text-blue-700';
      case 'Capital':
        return 'bg-purple-100 text-purple-700';
      case 'Reserve':
        return 'bg-green-100 text-green-700';
      default:
        return 'bg-slate-100 text-slate-700';
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <FolderOpen className="size-5 text-blue-600" />
                Budget Head Master
              </CardTitle>
              <CardDescription>
                Manage budget categories and classification
              </CardDescription>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={() => setEditingHead(null)}>
                  <Plus className="size-4 mr-2" />
                  Add Budget Head
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>
                    {editingHead ? 'Edit Budget Head' : 'Add New Budget Head'}
                  </DialogTitle>
                  <DialogDescription>
                    {editingHead 
                      ? 'Update budget head information'
                      : 'Create a new budget head category'}
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Budget Head Name</Label>
                      <Input
                        id="name"
                        name="name"
                        placeholder="e.g., Maintenance"
                        defaultValue={editingHead?.name}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="code">Budget Code</Label>
                      <Input
                        id="code"
                        name="code"
                        placeholder="e.g., MAINT"
                        defaultValue={editingHead?.code}
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="type">Budget Type</Label>
                    <Select name="type" defaultValue={editingHead?.type || 'Operational'} required>
                      <SelectTrigger id="type">
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Operational">Operational</SelectItem>
                        <SelectItem value="Capital">Capital</SelectItem>
                        <SelectItem value="Reserve">Reserve</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      name="description"
                      placeholder="Brief description of this budget head..."
                      rows={3}
                      defaultValue={editingHead?.description}
                      required
                    />
                  </div>

                  <div className="flex gap-3 pt-4">
                    <Button type="submit" className="flex-1">
                      {editingHead ? 'Update Budget Head' : 'Create Budget Head'}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setIsDialogOpen(false);
                        setEditingHead(null);
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
                  <TableHead>Code</TableHead>
                  <TableHead>Budget Head</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {budgetHeads.map((head) => (
                  <TableRow key={head.id}>
                    <TableCell>
                      <Badge variant="outline">{head.code}</Badge>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="text-slate-900">{head.name}</p>
                        <p className="text-xs text-slate-500 mt-1">{head.description}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={getTypeColor(head.type)}>
                        {head.type}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleStatus(head.id)}
                      >
                        <Badge className={head.isActive ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-700'}>
                          {head.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </Button>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex gap-2 justify-end">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(head)}
                        >
                          <Edit className="size-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(head.id)}
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
