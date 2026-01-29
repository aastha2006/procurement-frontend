import { useState, useEffect } from 'react';
import { api } from '../api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { Checkbox } from './ui/checkbox';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { FileQuestion, Plus, Trash2, Send, Users, UserPlus, Mail, Phone, Building2, Loader2, CheckCircle2, Package } from 'lucide-react';
import { toast } from 'sonner';

interface PRItem {
  id?: number;
  pr?: string;
  itemDescription: string;
  quantity: number;
  unit: string;
  estimatedCost: number;
}

interface PR {
  id: number;
  prNumber: string;
  department: string;
  description: string;
  budgetHead?: string;
  status: string;
  items?: PRItem[];
}

interface Vendor {
  id: number;
  name: string;
  email: string;
  phone: string;
  category: string;
  rating: number;
}

interface InviteSupplier {
  name: string;
  email: string;
  phone: string;
  companyName: string;
}

interface RecentRFQ {
  id: number;
  rfqNumber: string;
  prNumber: string;
  vendorCount: number;
  status: string;
  createdDate: string;
}

interface RFQDetails {
  id: number;
  rfqNumber: string;
  pr: {
    id: number;
    prNumber: string;
    department: string;
    requestedBy: number;
    description: string;
    status: string;
    approvedBy?: string;
    approvedOn?: string;
    budgetHead?: string;
    createdAt: string;
    items: {
      id: number;
      itemDescription: string;
      quantity: number;
      unit: string;
      estimatedCost: number;
    }[];
  };
  vendors: {
    id: number;
    invitedOn: string;
  }[];
  status: string;
  createdAt: string;
  selectedVendor?: number;
  selectedBy?: number;
  selectedOn?: string;
}

interface RFQManagementProps {
  authToken: string;
}

export function RFQManagement({ authToken }: RFQManagementProps) {
  const [approvedPRs, setApprovedPRs] = useState<PR[]>([]);
  const [approvedVendors, setApprovedVendors] = useState<Vendor[]>([]);
  const [recentRFQs, setRecentRFQs] = useState<RecentRFQ[]>([]);
  const [rfqDetails, setRFQDetails] = useState<RFQDetails | null>(null);
  const [selectedPR, setSelectedPR] = useState<number | null>(null);
  const [selectedVendorIds, setSelectedVendorIds] = useState<number[]>([]);
  const [inviteSuppliers, setInviteSuppliers] = useState<InviteSupplier[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isPRLoading, setIsPRLoading] = useState(false);
  const [isVendorLoading, setIsVendorLoading] = useState(false);
  const [isRecentRFQLoading, setIsRecentRFQLoading] = useState(false);
  const [isDetailsLoading, setIsDetailsLoading] = useState(false);
  const [isAddingSupplier, setIsAddingSupplier] = useState(false);
  const [searchVendor, setSearchVendor] = useState('');

  // New supplier form state
  const [newSupplierName, setNewSupplierName] = useState('');
  const [newSupplierEmail, setNewSupplierEmail] = useState('');
  const [newSupplierPhone, setNewSupplierPhone] = useState('');
  const [newSupplierCompany, setNewSupplierCompany] = useState('');

  useEffect(() => {
    if (authToken) {
      fetchApprovedPRs();
      fetchApprovedVendors();
      fetchRecentRFQs();
    }
  }, [authToken]);

  const fetchApprovedPRs = async () => {
    setIsPRLoading(true);
    try {
      const response = await api.get('/procurement/pr/approved', {
        headers: {
          'accept': '*/*'
        }
      });

      if (response.ok) {
        const data = await response.json();

        // Handle response - could be array or paginated object
        if (Array.isArray(data)) {
          setApprovedPRs(data);
        } else if (data.content && Array.isArray(data.content)) {
          setApprovedPRs(data.content);
        } else {
          setApprovedPRs([]);
        }
      } else {
        const errorText = await response.text();
        toast.error('Failed to fetch approved PRs', {
          description: errorText || 'Please try again later'
        });
        setApprovedPRs([]);
      }
    } catch (error) {
      console.error('Error fetching approved PRs:', error);
      toast.error('Error fetching approved PRs', {
        description: 'Network error. Please check your connection.'
      });
      setApprovedPRs([]);
    } finally {
      setIsPRLoading(false);
    }
  };

  const fetchApprovedVendors = async () => {
    setIsVendorLoading(true);
    try {
      const response = await api.get('/vendors/approved', {
        headers: {
          'accept': '*/*'
        }
      });

      if (response.ok) {
        const data = await response.json();

        // Handle response - could be array or paginated object
        if (Array.isArray(data)) {
          setApprovedVendors(data.filter((v: any) => v.companyName?.toLowerCase() !== 'ezatlas'));
        } else if (data.content && Array.isArray(data.content)) {
          setApprovedVendors(data.content.filter((v: any) => v.companyName?.toLowerCase() !== 'ezatlas'));
        } else {
          setApprovedVendors([]);
        }
      } else {
        const errorText = await response.text();
        toast.error('Failed to fetch approved vendors', {
          description: errorText || 'Please try again later'
        });
        setApprovedVendors([]);
      }
    } catch (error) {
      console.error('Error fetching approved vendors:', error);
      toast.error('Error fetching approved vendors', {
        description: 'Network error. Please check your connection.'
      });
      setApprovedVendors([]);
    } finally {
      setIsVendorLoading(false);
    }
  };

  const fetchRecentRFQs = async () => {
    setIsRecentRFQLoading(true);
    try {
      const response = await api.get('/procurement/rfq/recent', {
        headers: {
          'accept': '*/*'
        }
      });

      if (response.ok) {
        const data = await response.json();

        // Handle response - could be array or paginated object
        if (Array.isArray(data)) {
          setRecentRFQs(data);
        } else if (data.content && Array.isArray(data.content)) {
          setRecentRFQs(data.content);
        } else {
          setRecentRFQs([]);
        }
      } else {
        const errorText = await response.text();
        toast.error('Failed to fetch recent RFQs', {
          description: errorText || 'Please try again later'
        });
        setRecentRFQs([]);
      }
    } catch (error) {
      console.error('Error fetching recent RFQs:', error);
      toast.error('Error fetching recent RFQs', {
        description: 'Network error. Please check your connection.'
      });
      setRecentRFQs([]);
    } finally {
      setIsRecentRFQLoading(false);
    }
  };

  const toggleVendorSelection = (vendorId: number) => {
    setSelectedVendorIds(prev =>
      prev.includes(vendorId)
        ? prev.filter(id => id !== vendorId)
        : [...prev, vendorId]
    );
  };

  const addInviteSupplier = () => {
    if (!newSupplierName || !newSupplierEmail || !newSupplierPhone || !newSupplierCompany) {
      toast.error('Please fill all supplier details');
      return;
    }

    const newSupplier: InviteSupplier = {
      name: newSupplierName,
      email: newSupplierEmail,
      phone: newSupplierPhone,
      companyName: newSupplierCompany
    };

    setInviteSuppliers([...inviteSuppliers, newSupplier]);

    // Reset form
    setNewSupplierName('');
    setNewSupplierEmail('');
    setNewSupplierPhone('');
    setNewSupplierCompany('');

    toast.success('Supplier added to invitation list');
  };

  const removeInviteSupplier = (index: number) => {
    setInviteSuppliers(inviteSuppliers.filter((_, i) => i !== index));
    toast.success('Supplier removed from invitation list');
  };

  const handleLaunchRFQ = async () => {
    if (!selectedPR) {
      toast.error('Please select a Purchase Requisition');
      return;
    }

    if (selectedVendorIds.length === 0 && inviteSuppliers.length === 0) {
      toast.error('Please select at least one vendor or add a new supplier');
      return;
    }

    setIsLoading(true);

    // Map inviteSuppliers to match API format (companyName -> name)
    const formattedInviteSuppliers = inviteSuppliers.map(supplier => ({
      name: supplier.companyName,
      email: supplier.email,
      phone: supplier.phone
    }));

    const rfqData = {
      prId: selectedPR,
      vendorIds: selectedVendorIds,
      inviteSuppliers: formattedInviteSuppliers
    };

    try {
      const response = await api.post('/procurement/rfq', rfqData, {
        headers: {
          'accept': '*/*',
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const result = await response.json();

        toast.success('RFQ launched successfully!', {
          description: `Sent to ${selectedVendorIds.length + inviteSuppliers.length} suppliers`
        });

        // Reset form
        setSelectedPR(null);
        setSelectedVendorIds([]);
        setInviteSuppliers([]);
        setIsDialogOpen(false);

        // Refresh recent RFQs list
        fetchRecentRFQs();

        // Optional: Log the RFQ details from response
        console.log('RFQ launched:', result);
      } else {
        let errorMessage = 'Please try again';

        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorMessage;
        } catch {
          const errorText = await response.text();
          errorMessage = errorText || errorMessage;
        }

        toast.error('Failed to launch RFQ', {
          description: errorMessage
        });
      }
    } catch (error) {
      console.error('Error launching RFQ:', error);
      toast.error('Error launching RFQ', {
        description: 'Network error. Please try again later.'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchRFQDetails = async (rfqId: number) => {
    setIsDetailsLoading(true);
    setIsDetailsDialogOpen(true);

    try {
      const response = await api.get(`/procurement/rfq/${rfqId}`, {
        headers: {
          'accept': '*/*'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setRFQDetails(data);
      } else {
        const errorText = await response.text();
        toast.error('Failed to fetch RFQ details', {
          description: errorText || 'Please try again later'
        });
        setIsDetailsDialogOpen(false);
      }
    } catch (error) {
      console.error('Error fetching RFQ details:', error);
      toast.error('Error fetching RFQ details', {
        description: 'Network error. Please check your connection.'
      });
      setIsDetailsDialogOpen(false);
    } finally {
      setIsDetailsLoading(false);
    }
  };

  const filteredVendors = approvedVendors.filter(vendor =>
    vendor.name.toLowerCase().includes(searchVendor.toLowerCase()) ||
    vendor.category.toLowerCase().includes(searchVendor.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <FileQuestion className="size-5 text-blue-600" />
                Request for Quotation (RFQ)
              </CardTitle>
              <CardDescription>
                Launch RFQs to approved vendors and invite new suppliers
              </CardDescription>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Send className="size-4 mr-2" />
                  Launch New RFQ
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Launch Request for Quotation</DialogTitle>
                  <DialogDescription>
                    Select PR, choose vendors, and invite new suppliers
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-6">
                  {/* Step 1: Select PR */}
                  <div className="space-y-3">
                    <h3 className="text-slate-900">Step 1: Select Purchase Requisition</h3>
                    {isPRLoading ? (
                      <div className="flex items-center justify-center p-4 border border-slate-200 rounded-lg">
                        <Loader2 className="size-5 animate-spin text-blue-600 mr-2" />
                        <span className="text-sm text-slate-600">Loading approved PRs...</span>
                      </div>
                    ) : approvedPRs.length === 0 ? (
                      <div className="p-4 border border-slate-200 rounded-lg text-center">
                        <p className="text-sm text-slate-600">No approved PRs available</p>
                        <p className="text-xs text-slate-500 mt-1">All approved PRs may have been processed</p>
                      </div>
                    ) : (
                      <Select
                        value={selectedPR?.toString()}
                        onValueChange={(value) => setSelectedPR(parseInt(value))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select approved PR" />
                        </SelectTrigger>
                        <SelectContent>
                          {approvedPRs.map((pr) => {
                            const totalCost = pr.items && pr.items.length > 0
                              ? pr.items.reduce((sum, item) => sum + (item.estimatedCost || 0), 0)
                              : 0;
                            return (
                              <SelectItem key={pr.id} value={pr.id.toString()}>
                                {pr.prNumber} - {pr.description} (₹{totalCost.toLocaleString()})
                              </SelectItem>
                            );
                          })}
                        </SelectContent>
                      </Select>
                    )}
                  </div>

                  {/* Step 2: Select Approved Vendors */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="text-slate-900">Step 2: Select Approved Vendors</h3>
                      <Badge variant="outline">
                        {selectedVendorIds.length} selected
                      </Badge>
                    </div>

                    {!isVendorLoading && (
                      <Input
                        placeholder="Search vendors by name or category..."
                        value={searchVendor}
                        onChange={(e) => setSearchVendor(e.target.value)}
                      />
                    )}

                    <div className="border border-slate-200 rounded-lg max-h-64 overflow-y-auto">
                      {isVendorLoading ? (
                        <div className="flex items-center justify-center p-8">
                          <Loader2 className="size-6 animate-spin text-blue-600 mr-2" />
                          <span className="text-sm text-slate-600">Loading approved vendors...</span>
                        </div>
                      ) : approvedVendors.length === 0 ? (
                        <div className="p-8 text-center">
                          <Users className="size-12 mx-auto text-slate-300 mb-3" />
                          <p className="text-sm text-slate-600">No approved vendors available</p>
                          <p className="text-xs text-slate-500 mt-1">Add vendors from the Vendor Management section</p>
                        </div>
                      ) : filteredVendors.length === 0 ? (
                        <div className="p-8 text-center">
                          <p className="text-sm text-slate-600">No vendors match your search</p>
                          <p className="text-xs text-slate-500 mt-1">Try a different search term</p>
                        </div>
                      ) : (
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead className="w-12"></TableHead>
                              <TableHead>Vendor Name</TableHead>
                              <TableHead>Category</TableHead>
                              <TableHead>Rating</TableHead>
                              <TableHead>Contact</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {filteredVendors.map((vendor) => (
                              <TableRow key={vendor.id}>
                                <TableCell>
                                  <Checkbox
                                    checked={selectedVendorIds.includes(vendor.id)}
                                    onCheckedChange={() => toggleVendorSelection(vendor.id)}
                                  />
                                </TableCell>
                                <TableCell className="text-slate-900">{vendor.name}</TableCell>
                                <TableCell>
                                  <Badge variant="outline">{vendor.category}</Badge>
                                </TableCell>
                                <TableCell>⭐ {vendor.rating}</TableCell>
                                <TableCell>
                                  <div className="text-sm">
                                    <p className="text-slate-600">{vendor.email}</p>
                                    <p className="text-slate-500">{vendor.phone}</p>
                                  </div>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      )}
                    </div>
                  </div>

                  {/* Step 3: Invite Unregistered Suppliers */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="text-slate-900">Step 3: Invite Unregistered Suppliers (Optional)</h3>
                      <Badge variant="outline">
                        {inviteSuppliers.length} invited
                      </Badge>
                    </div>

                    {/* Add New Supplier Form */}
                    <div className="p-4 border-2 border-dashed border-slate-200 rounded-lg space-y-4">
                      <div className="flex items-center gap-2">
                        <UserPlus className="size-5 text-purple-600" />
                        <p className="text-sm text-slate-900">Add New Supplier</p>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="supplierName">Contact Person Name</Label>
                          <Input
                            id="supplierName"
                            placeholder="e.g., John Doe"
                            value={newSupplierName}
                            onChange={(e) => setNewSupplierName(e.target.value)}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="supplierCompany">Company Name</Label>
                          <Input
                            id="supplierCompany"
                            placeholder="e.g., ABC Suppliers Ltd"
                            value={newSupplierCompany}
                            onChange={(e) => setNewSupplierCompany(e.target.value)}
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="supplierEmail">
                            <Mail className="size-4 inline mr-1" />
                            Email Address
                          </Label>
                          <Input
                            id="supplierEmail"
                            type="email"
                            placeholder="email@company.com"
                            value={newSupplierEmail}
                            onChange={(e) => setNewSupplierEmail(e.target.value)}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="supplierPhone">
                            <Phone className="size-4 inline mr-1" />
                            Phone Number
                          </Label>
                          <Input
                            id="supplierPhone"
                            type="tel"
                            placeholder="+91 98765 43210"
                            value={newSupplierPhone}
                            onChange={(e) => setNewSupplierPhone(e.target.value)}
                          />
                        </div>
                      </div>

                      <Button type="button" onClick={addInviteSupplier} variant="outline" className="w-full">
                        <Plus className="size-4 mr-2" />
                        Add to Invitation List
                      </Button>
                    </div>

                    {/* Invited Suppliers List */}
                    {inviteSuppliers.length > 0 && (
                      <div className="space-y-2">
                        <p className="text-sm text-slate-600">Suppliers to be invited:</p>
                        {inviteSuppliers.map((supplier, index) => (
                          <div
                            key={index}
                            className="p-3 bg-purple-50 border border-purple-200 rounded-lg flex items-start justify-between"
                          >
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <Building2 className="size-4 text-purple-600" />
                                <p className="text-sm text-slate-900">{supplier.companyName}</p>
                              </div>
                              <p className="text-sm text-slate-600 mt-1">
                                Contact: {supplier.name}
                              </p>
                              <div className="flex gap-4 mt-1 text-xs text-slate-500">
                                <span>📧 {supplier.email}</span>
                                <span>📱 {supplier.phone}</span>
                              </div>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeInviteSupplier(index)}
                            >
                              <Trash2 className="size-4 text-red-600" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Summary */}
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <h4 className="text-sm text-blue-900 mb-2">RFQ Summary</h4>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-blue-700">Selected PR:</p>
                        <p className="text-blue-900">
                          {selectedPR
                            ? approvedPRs.find(pr => pr.id === selectedPR)?.prNumber
                            : 'Not selected'}
                        </p>
                      </div>
                      <div>
                        <p className="text-blue-700">Total Recipients:</p>
                        <p className="text-blue-900">
                          {selectedVendorIds.length + inviteSuppliers.length} suppliers
                        </p>
                      </div>
                      <div>
                        <p className="text-blue-700">Approved Vendors:</p>
                        <p className="text-blue-900">{selectedVendorIds.length}</p>
                      </div>
                      <div>
                        <p className="text-blue-700">New Invitations:</p>
                        <p className="text-blue-900">{inviteSuppliers.length}</p>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-3 pt-4">
                    <Button
                      onClick={handleLaunchRFQ}
                      disabled={isLoading || !selectedPR}
                      className="flex-1"
                    >
                      <Send className="size-4 mr-2" />
                      {isLoading ? 'Launching RFQ...' : 'Launch RFQ'}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setIsDialogOpen(false)}
                      disabled={isLoading}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <FileQuestion className="size-16 mx-auto text-slate-300 mb-4" />
            <p className="text-slate-600 mb-4">Launch RFQs to get competitive quotations</p>
            <p className="text-sm text-slate-500">
              Select from {approvedVendors.length} approved vendors or invite new suppliers
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Recent RFQs */}
      <Card>
        <CardHeader>
          <CardTitle>Recent RFQs</CardTitle>
          <CardDescription>View recently launched requests for quotation</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {isRecentRFQLoading ? (
              <div className="flex items-center justify-center p-4 border border-slate-200 rounded-lg">
                <Loader2 className="size-5 animate-spin text-blue-600 mr-2" />
                <span className="text-sm text-slate-600">Loading recent RFQs...</span>
              </div>
            ) : recentRFQs.length === 0 ? (
              <div className="p-4 border border-slate-200 rounded-lg text-center">
                <p className="text-sm text-slate-600">No recent RFQs available</p>
                <p className="text-xs text-slate-500 mt-1">Launch new RFQs to see them here</p>
              </div>
            ) : (
              recentRFQs.map((rfq) => (
                <div key={rfq.id} className="p-4 border border-slate-200 rounded-lg flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">{rfq.rfqNumber}</Badge>
                      <Badge variant="secondary">{rfq.prNumber}</Badge>
                      <Badge className={rfq.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-700'}>
                        {rfq.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-slate-600 mt-2">
                      Sent to {rfq.vendorCount} suppliers • {rfq.createdDate}
                    </p>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => fetchRFQDetails(rfq.id)}>
                    View Details
                  </Button>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* RFQ Details Dialog */}
      <Dialog open={isDetailsDialogOpen} onOpenChange={setIsDetailsDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>RFQ Details</DialogTitle>
            <DialogDescription>
              View complete RFQ information and vendor list
            </DialogDescription>
          </DialogHeader>

          {isDetailsLoading ? (
            <div className="flex items-center justify-center p-8">
              <Loader2 className="size-8 animate-spin text-blue-600 mr-3" />
              <span className="text-slate-600">Loading RFQ details...</span>
            </div>
          ) : rfqDetails ? (
            <div className="space-y-6">
              {/* Vendor Selected Banner */}
              {rfqDetails.status === 'VENDOR_SELECTED' && rfqDetails.selectedVendor && (
                <div className="p-4 bg-green-50 border border-green-300 rounded-lg">
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="size-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-green-900">RFQ Process Complete</p>
                      <p className="text-sm text-green-700 mt-1">
                        Vendor (ID: {rfqDetails.selectedVendor}) has been selected for this RFQ.
                        {rfqDetails.selectedOn && ` Selected on ${new Date(rfqDetails.selectedOn).toLocaleString()}`}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* RFQ Header Info */}
              <div className={`p-4 border rounded-lg ${rfqDetails.status === 'VENDOR_SELECTED' ? 'bg-green-50 border-green-200' : 'bg-blue-50 border-blue-200'}`}>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className={`text-sm ${rfqDetails.status === 'VENDOR_SELECTED' ? 'text-green-700' : 'text-blue-700'}`}>RFQ Number</p>
                    <p className={rfqDetails.status === 'VENDOR_SELECTED' ? 'text-green-900' : 'text-blue-900'}>{rfqDetails.rfqNumber}</p>
                  </div>
                  <div>
                    <p className={`text-sm ${rfqDetails.status === 'VENDOR_SELECTED' ? 'text-green-700' : 'text-blue-700'}`}>Status</p>
                    {rfqDetails.status === 'VENDOR_SELECTED' ? (
                      <Badge className="bg-green-600 hover:bg-green-700">
                        <CheckCircle2 className="size-3 mr-1" />
                        Vendor Selected
                      </Badge>
                    ) : (
                      <Badge variant="default">{rfqDetails.status}</Badge>
                    )}
                  </div>
                  <div>
                    <p className={`text-sm ${rfqDetails.status === 'VENDOR_SELECTED' ? 'text-green-700' : 'text-blue-700'}`}>PR Number</p>
                    <p className={rfqDetails.status === 'VENDOR_SELECTED' ? 'text-green-900' : 'text-blue-900'}>{rfqDetails.pr.prNumber}</p>
                  </div>
                  <div>
                    <p className={`text-sm ${rfqDetails.status === 'VENDOR_SELECTED' ? 'text-green-700' : 'text-blue-700'}`}>Department</p>
                    <p className={rfqDetails.status === 'VENDOR_SELECTED' ? 'text-green-900' : 'text-blue-900'}>{rfqDetails.pr.department}</p>
                  </div>
                  <div>
                    <p className={`text-sm ${rfqDetails.status === 'VENDOR_SELECTED' ? 'text-green-700' : 'text-blue-700'}`}>Created Date</p>
                    <p className={rfqDetails.status === 'VENDOR_SELECTED' ? 'text-green-900' : 'text-blue-900'}>
                      {new Date(rfqDetails.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <p className={`text-sm ${rfqDetails.status === 'VENDOR_SELECTED' ? 'text-green-700' : 'text-blue-700'}`}>Total Vendors Invited</p>
                    <p className={rfqDetails.status === 'VENDOR_SELECTED' ? 'text-green-900' : 'text-blue-900'}>{rfqDetails.vendors.length}</p>
                  </div>
                </div>
                <div className={`mt-3 pt-3 border-t ${rfqDetails.status === 'VENDOR_SELECTED' ? 'border-green-200' : 'border-blue-200'}`}>
                  <p className={`text-sm ${rfqDetails.status === 'VENDOR_SELECTED' ? 'text-green-700' : 'text-blue-700'}`}>PR Description</p>
                  <p className={rfqDetails.status === 'VENDOR_SELECTED' ? 'text-green-900' : 'text-blue-900'}>{rfqDetails.pr.description}</p>
                </div>
                {rfqDetails.pr.budgetHead && (
                  <div className={`mt-3 pt-3 border-t ${rfqDetails.status === 'VENDOR_SELECTED' ? 'border-green-200' : 'border-blue-200'}`}>
                    <p className={`text-sm ${rfqDetails.status === 'VENDOR_SELECTED' ? 'text-green-700' : 'text-blue-700'}`}>Budget Head</p>
                    <p className={rfqDetails.status === 'VENDOR_SELECTED' ? 'text-green-900' : 'text-blue-900'}>{rfqDetails.pr.budgetHead}</p>
                  </div>
                )}
              </div>

              {/* PR Items */}
              {rfqDetails.pr.items && rfqDetails.pr.items.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Package className="size-5 text-blue-600" />
                    <h3 className="text-slate-900">Items Requested ({rfqDetails.pr.items.length})</h3>
                  </div>
                  <div className="border border-slate-200 rounded-lg overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Item Description</TableHead>
                          <TableHead className="text-right">Quantity</TableHead>
                          <TableHead>Unit</TableHead>
                          <TableHead className="text-right">Estimated Cost</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {rfqDetails.pr.items.map((item) => (
                          <TableRow key={item.id}>
                            <TableCell className="text-slate-900">{item.itemDescription}</TableCell>
                            <TableCell className="text-right text-slate-900">{item.quantity}</TableCell>
                            <TableCell className="text-slate-600">{item.unit}</TableCell>
                            <TableCell className="text-right text-slate-900">₹{item.estimatedCost.toLocaleString()}</TableCell>
                          </TableRow>
                        ))}
                        <TableRow className="bg-slate-50">
                          <TableCell colSpan={3} className="text-right text-slate-900">Total Estimated Cost:</TableCell>
                          <TableCell className="text-right text-slate-900">
                            ₹{rfqDetails.pr.items.reduce((sum, item) => sum + item.estimatedCost, 0).toLocaleString()}
                          </TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </div>
                </div>
              )}

              {/* Invited Vendors List */}
              {rfqDetails.vendors && rfqDetails.vendors.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Users className="size-5 text-blue-600" />
                    <h3 className="text-slate-900">Invited Vendors ({rfqDetails.vendors.length})</h3>
                  </div>
                  <div className="border border-slate-200 rounded-lg overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Vendor ID</TableHead>
                          <TableHead>Invited On</TableHead>
                          <TableHead>Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {rfqDetails.vendors.map((vendor) => {
                          const isSelected = rfqDetails.selectedVendor === vendor.id;
                          return (
                            <TableRow key={vendor.id} className={isSelected ? 'bg-green-50' : ''}>
                              <TableCell className="text-slate-900">
                                <div className="flex items-center gap-2">
                                  <span>Vendor #{vendor.id}</span>
                                  {isSelected && (
                                    <Badge className="bg-green-600 hover:bg-green-700 text-xs">
                                      <CheckCircle2 className="size-3 mr-1" />
                                      Selected
                                    </Badge>
                                  )}
                                </div>
                              </TableCell>
                              <TableCell className="text-slate-600">
                                {new Date(vendor.invitedOn).toLocaleString()}
                              </TableCell>
                              <TableCell>
                                {isSelected ? (
                                  <Badge variant="outline" className="bg-green-50 border-green-300 text-green-700">
                                    Winner
                                  </Badge>
                                ) : (
                                  <Badge variant="outline">Invited</Badge>
                                )}
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              )}

              {/* Close Button */}
              <div className="flex justify-end pt-4">
                <Button variant="outline" onClick={() => setIsDetailsDialogOpen(false)}>
                  Close
                </Button>
              </div>
            </div>
          ) : (
            <div className="p-8 text-center">
              <p className="text-slate-600">No details available</p>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}