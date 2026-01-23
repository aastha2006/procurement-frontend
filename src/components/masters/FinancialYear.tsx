import { useState, useEffect } from 'react';
import { api } from '../../api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Badge } from '../ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Plus, Calendar, CheckCircle2, Loader2, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

interface FinancialYearData {
  id: string;
  year: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
  isClosed: boolean;
}

interface FinancialYearProps {
  authToken?: string;
}

export function FinancialYear({ authToken }: FinancialYearProps) {
  const [financialYears, setFinancialYears] = useState<FinancialYearData[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [activatingId, setActivatingId] = useState<string | null>(null);
  const [closingId, setClosingId] = useState<string | null>(null);

  // Fetch financial years on component mount
  useEffect(() => {
    if (authToken) {
      fetchFinancialYears();
    }
  }, [authToken]);

  const fetchFinancialYears = async () => {
    setIsLoading(true);
    try {
      const response = await api.get('/financial-years', {
        headers: {
          'accept': '*/*'
        }
      });

      if (response.ok) {
        const data = await response.json();

        // Map API response to UI format
        const mappedFinancialYears = data.map((fy: any) => ({
          id: fy.id?.toString() || '',
          year: fy.year,
          startDate: fy.startDate,
          endDate: fy.endDate,
          isActive: fy.active || false,
          isClosed: fy.closed || false
        }));

        setFinancialYears(mappedFinancialYears);
      } else {
        console.error('Failed to fetch financial years');
        toast.error('Failed to load financial years');
      }
    } catch (error) {
      console.error('Error fetching financial years:', error);
      toast.error('Unable to load financial years', {
        description: 'Please check your connection and try again'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchFinancialYearById = async (id: number | string) => {
    try {
      const response = await api.get(`/financial-years/${id}`, {
        headers: {
          'accept': '*/*'
        }
      });

      if (response.ok) {
        const fy = await response.json();
        return {
          id: fy.id?.toString() || '',
          year: fy.year,
          startDate: fy.startDate,
          endDate: fy.endDate,
          isActive: fy.active || false,
          isClosed: fy.closed || false
        };
      }
    } catch (error) {
      console.error('Error fetching financial year by ID:', error);
    }
    return null;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!authToken) {
      toast.error('Authentication required', {
        description: 'Please log in to create a financial year'
      });
      return;
    }

    setIsSubmitting(true);

    const formData = new FormData(e.currentTarget);

    const financialYearData = {
      year: formData.get('year') as string,
      startDate: formData.get('startDate') as string,
      endDate: formData.get('endDate') as string,
      active: false,
      closed: false
    };

    try {
      const response = await api.post('/financial-years', financialYearData, {
        headers: {
          'accept': '*/*',
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const createdFY = await response.json();

        toast.success('Financial year created successfully!');
        setIsDialogOpen(false);

        // Reset form
        e.currentTarget.reset();

        // Refresh the financial years list from API
        fetchFinancialYears();
      } else {
        const errorData = await response.json().catch(() => null);
        const errorMessage = errorData?.message || 'Failed to create financial year';

        toast.error('Creation Failed', {
          description: errorMessage
        });
      }
    } catch (error) {
      console.error('Error creating financial year:', error);
      toast.error('Unable to create financial year', {
        description: 'Please check your connection and try again'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const setActiveYear = async (id: string) => {
    if (!authToken) {
      toast.error('Authentication required', {
        description: 'Please log in to activate a financial year'
      });
      return;
    }

    setActivatingId(id);

    try {
      const response = await api.put(`/financial-years/${id}/activate`, undefined, {
        headers: {
          'accept': '*/*'
        }
      });

      if (response.ok) {
        toast.success('Active financial year updated!');

        // Refresh the financial years list to get updated status from API
        await fetchFinancialYears();
      } else {
        const errorData = await response.json().catch(() => null);
        const errorMessage = errorData?.message || 'Failed to activate financial year';

        toast.error('Activation Failed', {
          description: errorMessage
        });
      }
    } catch (error) {
      console.error('Error activating financial year:', error);
      toast.error('Unable to activate financial year', {
        description: 'Please check your connection and try again'
      });
    } finally {
      setActivatingId(null);
    }
  };

  const closeYear = async (id: string) => {
    if (!authToken) {
      toast.error('Authentication required', {
        description: 'Please log in to close a financial year'
      });
      return;
    }

    setClosingId(id);

    try {
      const response = await api.put(`/financial-years/${id}/close`, undefined, {
        headers: {
          'accept': '*/*'
        }
      });

      if (response.ok) {
        toast.success('Financial year closed successfully!');

        // Refresh the financial years list to get updated status from API
        await fetchFinancialYears();
      } else {
        const errorData = await response.json().catch(() => null);
        const errorMessage = errorData?.message || 'Failed to close financial year';

        toast.error('Close Failed', {
          description: errorMessage
        });
      }
    } catch (error) {
      console.error('Error closing financial year:', error);
      toast.error('Unable to close financial year', {
        description: 'Please check your connection and try again'
      });
    } finally {
      setClosingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="size-5 text-blue-600" />
                Financial Year Management
              </CardTitle>
              <CardDescription>
                Manage financial years for budget and accounting periods
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={fetchFinancialYears}
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
                  <Button>
                    <Plus className="size-4 mr-2" />
                    Add Financial Year
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add New Financial Year</DialogTitle>
                    <DialogDescription>
                      Create a new financial year period
                    </DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="year">Financial Year</Label>
                      <Input
                        id="year"
                        name="year"
                        placeholder="e.g., 2025-26"
                        required
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="startDate">Start Date</Label>
                        <Input
                          id="startDate"
                          name="startDate"
                          type="date"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="endDate">End Date</Label>
                        <Input
                          id="endDate"
                          name="endDate"
                          type="date"
                          required
                        />
                      </div>
                    </div>

                    <div className="flex gap-3 pt-4">
                      <Button type="submit" className="flex-1" disabled={isSubmitting}>
                        {isSubmitting ? (
                          <>
                            <Loader2 className="size-4 mr-2 animate-spin" />
                            Creating...
                          </>
                        ) : (
                          'Create Financial Year'
                        )}
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setIsDialogOpen(false)}
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
                  <TableHead>Financial Year</TableHead>
                  <TableHead>Start Date</TableHead>
                  <TableHead>End Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8">
                      <div className="flex items-center justify-center gap-2 text-slate-500">
                        <Loader2 className="size-5 animate-spin" />
                        <span>Loading financial years...</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : financialYears.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8">
                      <div className="text-slate-500">
                        <Calendar className="size-12 mx-auto mb-2 text-slate-300" />
                        <p>No financial years found</p>
                        <p className="text-sm mt-1">Click "Add Financial Year" to create your first financial year</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  financialYears.map((fy) => (
                    <TableRow key={fy.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span className="text-slate-900">{fy.year}</span>
                          {fy.isActive && (
                            <Badge className="bg-blue-100 text-blue-700">
                              <CheckCircle2 className="size-3 mr-1" />
                              Active
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>{new Date(fy.startDate).toLocaleDateString()}</TableCell>
                      <TableCell>{new Date(fy.endDate).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <Badge className={fy.isClosed ? 'bg-slate-100 text-slate-700' : 'bg-green-100 text-green-700'}>
                          {fy.isClosed ? 'Closed' : 'Open'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex gap-2 justify-end">
                          {!fy.isActive && !fy.isClosed && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setActiveYear(fy.id)}
                              disabled={activatingId === fy.id}
                            >
                              {activatingId === fy.id ? (
                                <>
                                  <Loader2 className="size-4 mr-2 animate-spin" />
                                  Setting...
                                </>
                              ) : (
                                'Set Active'
                              )}
                            </Button>
                          )}
                          {fy.isActive && !fy.isClosed && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => closeYear(fy.id)}
                              disabled={closingId === fy.id}
                            >
                              {closingId === fy.id ? (
                                <>
                                  <Loader2 className="size-4 mr-2 animate-spin" />
                                  Closing...
                                </>
                              ) : (
                                'Close Year'
                              )}
                            </Button>
                          )}
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