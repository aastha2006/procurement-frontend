import {
  fetchApprovedVendors,
  fetchPendingVendors,
  fetchVendorById,
  createVendor,
  approveVendor,
} from '../services/vendorService';


import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Users, Plus, Search, CheckCircle2, Clock, Building2, Phone, Mail, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  PaginationEllipsis
} from './ui/pagination';

interface Vendor {
  id: number;
  name: string;
  fullName: string | null;
  companyName: string | null;
  gst: string | null;
  pan: string | null;
  bankAccount: string | null;
  bankIfsc: string | null;
  contactPerson: string | null;
  phone: string | null;
  email: string | null;
  address: string | null;
  verified: boolean;
  status: string;
  createdAt: string | null;
  invitedOn: string | null;
  // 👇 UI-used optional fields
  category?: string;
  contactPhone?: string;
  totalOrders?: number;
  rating?: number;
  approvedBy?: string;
  approvedOn?: string;
}

interface PageInfo {
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
}

interface VendorManagementProps {
  authToken?: string;
  userGroupName?: string;
  vendorId?: number;
  isSupplierProfile?: boolean;
}

export function VendorManagement({ authToken, userGroupName, vendorId, isSupplierProfile }: VendorManagementProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [approvedVendors, setApprovedVendors] = useState<Vendor[]>([]);
  const [pendingVendors, setPendingVendors] = useState<Vendor[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isPendingLoading, setIsPendingLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
  const [selectedVendor, setSelectedVendor] = useState<Vendor | null>(null);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);
  const [approvingVendorId, setApprovingVendorId] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [pendingCurrentPage, setPendingCurrentPage] = useState(0);
  const [pageSize] = useState(10);
  const [pageInfo, setPageInfo] = useState<PageInfo>({
    totalElements: 0,
    totalPages: 0,
    size: 10,
    number: 0,
    first: true,
    last: true
  });
  const [pendingPageInfo, setPendingPageInfo] = useState<PageInfo>({
    totalElements: 0,
    totalPages: 0,
    size: 10,
    number: 0,
    first: true,
    last: true
  });
  // 1️⃣ Supplier profile — load only their own vendor details
  useEffect(() => {
    if (!authToken) return;
    if (!isSupplierProfile || !vendorId) return;

    handleViewDetails(vendorId);
  }, [authToken, isSupplierProfile, vendorId]);


  // 2️⃣ Society users — load approved vendors (pagination-aware)
  useEffect(() => {
    if (!authToken) return;
    if (isSupplierProfile) return;

    loadApprovedVendors();
  }, [authToken, currentPage, isSupplierProfile]);


  // 3️⃣ Society users — load pending vendors (pagination-aware)
  useEffect(() => {
    if (!authToken) return;
    if (isSupplierProfile) return;

    loadPendingVendors();
  }, [authToken, pendingCurrentPage, isSupplierProfile]);



  const loadApprovedVendors = async () => {
    if (!authToken) return;
    setIsLoading(true);
    try {
      const data = await fetchApprovedVendors(authToken, currentPage, pageSize);
      setApprovedVendors(data.content ?? data);
      setPageInfo({
        totalElements: data.totalElements ?? data.length,
        totalPages: data.totalPages ?? 1,
        size: data.size ?? pageSize,
        number: data.number ?? 0,
        first: data.first ?? true,
        last: data.last ?? true,
      });
    } catch (e: any) {
      toast.error('Failed to fetch vendors', { description: e.message });
    } finally {
      setIsLoading(false);
    }
  };


  const loadPendingVendors = async () => {
    if (!authToken) return;
    setIsPendingLoading(true);
    try {
      const data = await fetchPendingVendors(authToken, pendingCurrentPage, pageSize);
      setPendingVendors(data.content ?? data);
      setPendingPageInfo({
        totalElements: data.totalElements ?? data.length,
        totalPages: data.totalPages ?? 1,
        size: data.size ?? pageSize,
        number: data.number ?? 0,
        first: data.first ?? true,
        last: data.last ?? true,
      });
    } catch (e: any) {
      toast.error('Failed to fetch pending vendors', { description: e.message });
    } finally {
      setIsPendingLoading(false);
    }
  };


  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handlePendingPageChange = (page: number) => {
    setPendingCurrentPage(page);
  };

  const handleViewDetails = async (id: number) => {
    if (!authToken) return;

    setIsDetailsDialogOpen(true);
    setIsLoadingDetails(true);

    try {
      const data = await fetchVendorById(authToken, id);
      setSelectedVendor(data);
    } catch (e: any) {
      toast.error('Failed to fetch vendor details', {
        description: e.message
      });
      setIsDetailsDialogOpen(false);
    } finally {
      setIsLoadingDetails(false);
    }
  };


  const handleAddVendor = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!authToken) return;

    const payload = Object.fromEntries(new FormData(e.currentTarget).entries());
    setIsSubmitting(true);

    try {
      await createVendor(authToken, payload);
      toast.success('Vendor onboarded successfully');
      setIsDialogOpen(false);
      e.currentTarget.reset();
      loadApprovedVendors();
      loadPendingVendors();
    } catch (e: any) {
      toast.error('Failed to onboard vendor', { description: e.message });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleApproveVendor = async (id: number, name: string) => {
    if (!authToken) return;

    setApprovingVendorId(id);

    try {
      await approveVendor(authToken, id);
      toast.success(`${name} approved successfully`);
      loadApprovedVendors();
      loadPendingVendors();
    } catch (e: any) {
      toast.error('Approval failed', {
        description: e.message
      });
    } finally {
      setApprovingVendorId(null);
    }
  };



  const filteredVendors = approvedVendors.filter(vendor =>
    (vendor.companyName?.toLowerCase() !== 'ezatlas') &&
    (vendor.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vendor.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vendor.companyName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vendor.gst?.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const renderPagination = () => {
    if (pageInfo.totalPages <= 1) return null;

    const pages = [];
    const maxVisiblePages = 5;
    let startPage = Math.max(0, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(pageInfo.totalPages - 1, startPage + maxVisiblePages - 1);

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(0, endPage - maxVisiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    return (
      <Pagination>
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious
              onClick={() => !pageInfo.first && handlePageChange(currentPage - 1)}
              className={pageInfo.first ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
            />
          </PaginationItem>

          {startPage > 0 && (
            <>
              <PaginationItem>
                <PaginationLink onClick={() => handlePageChange(0)}>1</PaginationLink>
              </PaginationItem>
              {startPage > 1 && (
                <PaginationItem>
                  <PaginationEllipsis />
                </PaginationItem>
              )}
            </>
          )}

          {pages.map((page) => (
            <PaginationItem key={page}>
              <PaginationLink
                onClick={() => handlePageChange(page)}
                isActive={currentPage === page}
              >
                {page + 1}
              </PaginationLink>
            </PaginationItem>
          ))}

          {endPage < pageInfo.totalPages - 1 && (
            <>
              {endPage < pageInfo.totalPages - 2 && (
                <PaginationItem>
                  <PaginationEllipsis />
                </PaginationItem>
              )}
              <PaginationItem>
                <PaginationLink onClick={() => handlePageChange(pageInfo.totalPages - 1)}>
                  {pageInfo.totalPages}
                </PaginationLink>
              </PaginationItem>
            </>
          )}

          <PaginationItem>
            <PaginationNext
              onClick={() => !pageInfo.last && handlePageChange(currentPage + 1)}
              className={pageInfo.last ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    );
  };

  const renderPendingPagination = () => {
    if (pendingPageInfo.totalPages <= 1) return null;

    const pages = [];
    const maxVisiblePages = 5;
    let startPage = Math.max(0, pendingCurrentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(pendingPageInfo.totalPages - 1, startPage + maxVisiblePages - 1);

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(0, endPage - maxVisiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    return (
      <Pagination>
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious
              onClick={() => !pendingPageInfo.first && handlePendingPageChange(pendingCurrentPage - 1)}
              className={pendingPageInfo.first ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
            />
          </PaginationItem>

          {startPage > 0 && (
            <>
              <PaginationItem>
                <PaginationLink onClick={() => handlePendingPageChange(0)}>1</PaginationLink>
              </PaginationItem>
              {startPage > 1 && (
                <PaginationItem>
                  <PaginationEllipsis />
                </PaginationItem>
              )}
            </>
          )}

          {pages.map((page) => (
            <PaginationItem key={page}>
              <PaginationLink
                onClick={() => handlePendingPageChange(page)}
                isActive={pendingCurrentPage === page}
              >
                {page + 1}
              </PaginationLink>
            </PaginationItem>
          ))}

          {endPage < pendingPageInfo.totalPages - 1 && (
            <>
              {endPage < pendingPageInfo.totalPages - 2 && (
                <PaginationItem>
                  <PaginationEllipsis />
                </PaginationItem>
              )}
              <PaginationItem>
                <PaginationLink onClick={() => handlePendingPageChange(pendingPageInfo.totalPages - 1)}>
                  {pendingPageInfo.totalPages}
                </PaginationLink>
              </PaginationItem>
            </>
          )}

          <PaginationItem>
            <PaginationNext
              onClick={() => !pendingPageInfo.last && handlePendingPageChange(pendingCurrentPage + 1)}
              className={pendingPageInfo.last ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    );
  };

  return (
    <div className="space-y-6">
      {isSupplierProfile ? (
        // Supplier Profile View - Non-editable
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="size-5 text-blue-600" />
              My Profile
            </CardTitle>
            <CardDescription>View your registered vendor information (Read-only)</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoadingDetails ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="size-8 animate-spin text-blue-600 mr-3" />
                <span className="text-slate-600">Loading your profile...</span>
              </div>
            ) : !selectedVendor ? (
              <div className="text-center py-12">
                <Building2 className="size-12 text-slate-300 mx-auto mb-4" />
                <p className="text-slate-600">Profile information not available</p>
                <p className="text-sm text-slate-500 mt-2">
                  Please contact the procurement team if you believe this is an error
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Read-only Notice */}
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
                  <p className="text-sm text-amber-900">
                    <strong>Note:</strong> This is a read-only view of your profile. You cannot edit these details yourself.
                    To update your information, please contact the society procurement team.
                  </p>
                </div>

                {/* Header Section */}
                <div className="flex items-start gap-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="p-3 bg-blue-100 rounded-lg">
                    <Building2 className="size-8 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 flex-wrap">
                      <h2 className="text-xl text-slate-900">{selectedVendor.name}</h2>
                      {selectedVendor.verified && (
                        <Badge className="bg-green-100 text-green-800 border-green-300">
                          <CheckCircle2 className="size-3 mr-1" />
                          Verified
                        </Badge>
                      )}
                      <Badge>{selectedVendor.status}</Badge>
                    </div>
                    {selectedVendor.companyName && selectedVendor.companyName.toLowerCase() !== 'ezatlas' && (
                      <p className="text-sm text-slate-600 mt-1">{selectedVendor.companyName}</p>
                    )}
                  </div>
                </div>

                {/* Basic Information */}
                <div className="space-y-4">
                  <h3 className="text-slate-900 flex items-center gap-2">
                    <Users className="size-4" />
                    Basic Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-slate-50 rounded-lg">
                    {selectedVendor.fullName && (
                      <div>
                        <Label className="text-sm text-slate-600">Full Name</Label>
                        <p className="text-slate-900 mt-1">{selectedVendor.fullName}</p>
                      </div>
                    )}
                    {selectedVendor.contactPerson && (
                      <div>
                        <Label className="text-sm text-slate-600">Contact Person</Label>
                        <p className="text-slate-900 mt-1">{selectedVendor.contactPerson}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Contact Information */}
                <div className="space-y-4">
                  <h3 className="text-slate-900 flex items-center gap-2">
                    <Phone className="size-4" />
                    Contact Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-slate-50 rounded-lg">
                    {selectedVendor.phone && (
                      <div>
                        <Label className="text-sm text-slate-600">Phone Number</Label>
                        <p className="text-slate-900 mt-1 flex items-center gap-2">
                          <Phone className="size-4 text-slate-400" />
                          {selectedVendor.phone}
                        </p>
                      </div>
                    )}
                    {selectedVendor.email && (
                      <div>
                        <Label className="text-sm text-slate-600">Email Address</Label>
                        <p className="text-slate-900 mt-1 flex items-center gap-2">
                          <Mail className="size-4 text-slate-400" />
                          {selectedVendor.email}
                        </p>
                      </div>
                    )}
                    {selectedVendor.address && (
                      <div className="md:col-span-2">
                        <Label className="text-sm text-slate-600">Registered Address</Label>
                        <p className="text-slate-900 mt-1">{selectedVendor.address}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Tax & Financial Information */}
                <div className="space-y-4">
                  <h3 className="text-slate-900 flex items-center gap-2">
                    <CheckCircle2 className="size-4" />
                    Tax & Financial Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-slate-50 rounded-lg">
                    {selectedVendor.gst && (
                      <div>
                        <Label className="text-sm text-slate-600">GST Number</Label>
                        <p className="text-slate-900 mt-1">{selectedVendor.gst}</p>
                      </div>
                    )}
                    {selectedVendor.pan && (
                      <div>
                        <Label className="text-sm text-slate-600">PAN Number</Label>
                        <p className="text-slate-900 mt-1">{selectedVendor.pan}</p>
                      </div>
                    )}
                    {selectedVendor.bankAccount && (
                      <div>
                        <Label className="text-sm text-slate-600">Bank Account Number</Label>
                        <p className="text-slate-900 mt-1">{selectedVendor.bankAccount}</p>
                      </div>
                    )}
                    {selectedVendor.bankIfsc && (
                      <div>
                        <Label className="text-sm text-slate-600">IFSC Code</Label>
                        <p className="text-slate-900 mt-1">{selectedVendor.bankIfsc}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Timeline Information */}
                {(selectedVendor.createdAt || selectedVendor.invitedOn) && (
                  <div className="space-y-4">
                    <h3 className="text-slate-900 flex items-center gap-2">
                      <Clock className="size-4" />
                      Timeline
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-slate-50 rounded-lg">
                      {selectedVendor.createdAt && (
                        <div>
                          <Label className="text-sm text-slate-600">Created On</Label>
                          <p className="text-slate-900 mt-1">
                            {new Date(selectedVendor.createdAt).toLocaleDateString('en-GB', {
                              day: '2-digit',
                              month: 'short',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </p>
                        </div>
                      )}
                      {selectedVendor.invitedOn && (
                        <div>
                          <Label className="text-sm text-slate-600">Invited On</Label>
                          <p className="text-slate-900 mt-1">
                            {new Date(selectedVendor.invitedOn).toLocaleDateString('en-GB', {
                              day: '2-digit',
                              month: 'short',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      ) : (
        // Society User View - Vendor Management
        <>
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="size-5 text-blue-600" />
                    Vendor Management
                  </CardTitle>
                  <CardDescription>Manage approved vendors and onboard new suppliers</CardDescription>
                </div>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="size-4 mr-1" />
                      Onboard Vendor
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>Onboard New Vendor</DialogTitle>
                      <DialogDescription>
                        Fill in the vendor details and required documents
                      </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleAddVendor} className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="name">Vendor Name</Label>
                          <Input id="name" name="name" placeholder="e.g., Ace Traders" required />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="fullName">Full Name</Label>
                          <Input id="fullName" name="fullName" placeholder="e.g., Rajesh Kumar" required />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="companyName">Company Name</Label>
                        <Input id="companyName" name="companyName" placeholder="e.g., Ace Trading Pvt Ltd" required />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="gst">GST Number</Label>
                          <Input id="gst" name="gst" placeholder="27ABCDE1234F1Z5" required />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="pan">PAN Number</Label>
                          <Input id="pan" name="pan" placeholder="ABCDE1234F" required />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="bankAccount">Bank Account Number</Label>
                          <Input id="bankAccount" name="bankAccount" placeholder="123456789012" required />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="bankIfsc">IFSC Code</Label>
                          <Input id="bankIfsc" name="bankIfsc" placeholder="HDFC0001234" required />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="contactPerson">Contact Person</Label>
                        <Input id="contactPerson" name="contactPerson" placeholder="e.g., Rajesh Kumar" required />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="phone">Contact Phone</Label>
                          <Input id="phone" name="phone" type="tel" placeholder="+91 9876543210" required />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="email">Email Address</Label>
                          <Input id="email" name="email" type="email" placeholder="rajesh@acetraders.com" required />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="address">Registered Address</Label>
                        <Input id="address" name="address" placeholder="Plot 22, Industrial Area, Mumbai" required />
                      </div>

                      <div className="space-y-2">
                        <Label>Documents Required</Label>
                        <div className="grid grid-cols-1 gap-2">
                          <div className="flex items-center gap-2 text-sm text-slate-600">
                            <CheckCircle2 className="size-4" />
                            <span>GST Registration Certificate</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-slate-600">
                            <CheckCircle2 className="size-4" />
                            <span>PAN Card Copy</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-slate-600">
                            <CheckCircle2 className="size-4" />
                            <span>Cancelled Cheque / Bank Statement</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-slate-600">
                            <CheckCircle2 className="size-4" />
                            <span>Vendor Declaration (No Conflict of Interest)</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex gap-3 pt-4">
                        <Button type="submit" className="flex-1" disabled={isSubmitting}>
                          {isSubmitting ? (
                            <>
                              <Loader2 className="size-4 mr-2 animate-spin" />
                              Submitting...
                            </>
                          ) : (
                            'Submit for Approval'
                          )}
                        </Button>
                      </div>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
          </Card>

          <Tabs defaultValue="approved">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="approved">
                Approved Vendors ({pageInfo.totalElements})
              </TabsTrigger>
              <TabsTrigger value="pending">
                Pending Approval ({pendingPageInfo.totalElements})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="approved" className="space-y-4">
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-4">
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
                      <Input
                        placeholder="Search vendors by name, code, category, or GST..."
                        className="pl-10"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <div className="flex items-center justify-center py-12">
                      <Loader2 className="size-8 animate-spin text-blue-600" />
                    </div>
                  ) : filteredVendors.length === 0 ? (
                    <div className="text-center py-12">
                      <Building2 className="size-12 text-slate-300 mx-auto mb-4" />
                      <p className="text-slate-600">No approved vendors found</p>
                      {authToken && (
                        <p className="text-sm text-slate-500 mt-2">
                          {searchTerm ? 'Try adjusting your search criteria' : 'Start by onboarding vendors'}
                        </p>
                      )}
                      {!authToken && (
                        <p className="text-sm text-slate-500 mt-2">
                          Please log in to view vendors
                        </p>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {filteredVendors.map((vendor) => (
                        <div
                          key={vendor.id}
                          className="p-4 border border-slate-200 rounded-lg hover:border-slate-300 hover:shadow-sm transition-all"
                        >
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex items-start gap-4 flex-1">
                              <div className="p-3 bg-blue-100 rounded-lg">
                                <Building2 className="size-6 text-blue-600" />
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <h3 className="text-slate-900">{vendor.name}</h3>
                                  {vendor.fullName && <Badge variant="outline">{vendor.fullName}</Badge>}
                                  {vendor.status && <Badge>{vendor.status}</Badge>}
                                </div>
                                {vendor.category && (
                                  <p className="text-sm text-slate-600 mt-1">{vendor.category}</p>
                                )}

                                <div className="flex flex-wrap gap-4 mt-3 text-sm">
                                  {vendor.contactPhone && (
                                    <div className="flex items-center gap-1.5 text-slate-600">
                                      <Phone className="size-4" />
                                      <span>{vendor.contactPhone}</span>
                                    </div>
                                  )}
                                  {vendor.email && (
                                    <div className="flex items-center gap-1.5 text-slate-600">
                                      <Mail className="size-4" />
                                      <span>{vendor.email}</span>
                                    </div>
                                  )}
                                </div>

                                <div className="flex items-center gap-4 mt-3 text-sm flex-wrap">
                                  {vendor.gst && (
                                    <div>
                                      <span className="text-slate-600">GST: </span>
                                      <span className="text-slate-900">{vendor.gst}</span>
                                    </div>
                                  )}
                                  {vendor.pan && (
                                    <div>
                                      <span className="text-slate-600">PAN: </span>
                                      <span className="text-slate-900">{vendor.pan}</span>
                                    </div>
                                  )}
                                  {vendor.totalOrders !== undefined && (
                                    <div>
                                      <span className="text-slate-600">Orders: </span>
                                      <span className="text-slate-900">{vendor.totalOrders}</span>
                                    </div>
                                  )}
                                  {vendor.rating && (
                                    <div>
                                      <span className="text-slate-600">Rating: </span>
                                      <span className="text-slate-900">⭐ {vendor.rating}</span>
                                    </div>
                                  )}
                                </div>

                                {(vendor.approvedBy || vendor.approvedOn) && (
                                  <div className="mt-3 text-sm">
                                    <span className="text-slate-600">Approved </span>
                                    {vendor.approvedBy && (
                                      <span className="text-slate-900">by {vendor.approvedBy} </span>
                                    )}
                                    {vendor.approvedOn && (
                                      <span className="text-slate-600">
                                        on {new Date(vendor.approvedOn).toLocaleDateString()}
                                      </span>
                                    )}
                                  </div>
                                )}
                              </div>
                            </div>

                            <div className="flex gap-2">
                              <Button variant="outline" size="sm" onClick={() => handleViewDetails(vendor.id)}>
                                View Details
                              </Button>
                              <Button variant="ghost" size="sm">
                                Get Quote
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {filteredVendors.length > 0 && (
                    <div className="mt-6 flex items-center justify-between">
                      <p className="text-sm text-slate-600">
                        Showing {(currentPage * pageSize) + 1} to {Math.min((currentPage + 1) * pageSize, pageInfo.totalElements)} of {pageInfo.totalElements} vendors
                      </p>
                      {renderPagination()}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="pending" className="space-y-4">
              <Card>
                <CardContent className="pt-6">
                  {isPendingLoading ? (
                    <div className="flex items-center justify-center py-12">
                      <Loader2 className="size-8 animate-spin text-orange-600" />
                    </div>
                  ) : pendingVendors.length === 0 ? (
                    <div className="text-center py-12">
                      <Clock className="size-12 text-slate-300 mx-auto mb-4" />
                      <p className="text-slate-600">No pending vendors</p>
                      <p className="text-sm text-slate-500 mt-2">
                        All vendors have been processed
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {pendingVendors.map((vendor) => (
                        <div
                          key={vendor.id}
                          className="p-4 border-2 border-orange-200 bg-orange-50 rounded-lg"
                        >
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex items-start gap-4 flex-1">
                              <div className="p-3 bg-orange-200 rounded-lg">
                                <Clock className="size-6 text-orange-700" />
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <h3 className="text-slate-900">{vendor.name}</h3>
                                  {vendor.fullName && <Badge variant="outline">{vendor.fullName}</Badge>}
                                </div>
                                <p className="text-sm text-slate-600 mt-1">{vendor.category || 'General Supplier'}</p>

                                <div className="grid grid-cols-2 gap-4 mt-3">
                                  {vendor.gst && (
                                    <div className="text-sm">
                                      <span className="text-slate-600">GST: </span>
                                      <span className="text-slate-900">{vendor.gst}</span>
                                    </div>
                                  )}
                                  {vendor.pan && (
                                    <div className="text-sm">
                                      <span className="text-slate-600">PAN: </span>
                                      <span className="text-slate-900">{vendor.pan}</span>
                                    </div>
                                  )}
                                  {vendor.contactPhone && (
                                    <div className="text-sm">
                                      <span className="text-slate-600">Phone: </span>
                                      <span className="text-slate-900">{vendor.contactPhone}</span>
                                    </div>
                                  )}
                                  {vendor.email && (
                                    <div className="text-sm">
                                      <span className="text-slate-600">Email: </span>
                                      <span className="text-slate-900">{vendor.email}</span>
                                    </div>
                                  )}
                                </div>

                                {vendor.createdAt && (
                                  <div className="mt-2 text-sm">
                                    <span className="text-slate-600">Submitted on: </span>
                                    <span className="text-slate-900">
                                      {new Date(vendor.createdAt).toLocaleDateString('en-GB', {
                                        day: '2-digit',
                                        month: 'short',
                                        year: 'numeric'
                                      })}
                                    </span>
                                  </div>
                                )}

                                <Badge variant="outline" className="mt-2 bg-orange-100 text-orange-800 border-orange-300">
                                  {vendor.status || 'Pending Review'}
                                </Badge>
                              </div>
                            </div>

                            <div className="flex gap-2">
                              {['Admin', 'SOCIETY_MEMBER'].includes(userGroupName || '') && (
                                <Button
                                  size="sm"
                                  onClick={() => handleApproveVendor(vendor.id, vendor.name)}
                                  disabled={approvingVendorId === vendor.id}
                                >
                                  {approvingVendorId === vendor.id ? (
                                    <>
                                      <Loader2 className="size-4 mr-1 animate-spin" />
                                      Approving...
                                    </>
                                  ) : (
                                    <>
                                      <CheckCircle2 className="size-4 mr-1" />
                                      Approve
                                    </>
                                  )}
                                </Button>
                              )}
                              <Button variant="outline" size="sm" onClick={() => handleViewDetails(vendor.id)}>
                                Review
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {pendingVendors.length > 0 && (
                    <div className="mt-6 flex items-center justify-between">
                      <p className="text-sm text-slate-600">
                        Showing {(pendingCurrentPage * pageSize) + 1} to {Math.min((pendingCurrentPage + 1) * pageSize, pendingPageInfo.totalElements)} of {pendingPageInfo.totalElements} pending vendors
                      </p>
                      {renderPendingPagination()}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Vendor Details Dialog */}
          <Dialog open={isDetailsDialogOpen} onOpenChange={setIsDetailsDialogOpen}>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Building2 className="size-5 text-blue-600" />
                  Vendor Details
                </DialogTitle>
                <DialogDescription>
                  Complete information for this vendor
                </DialogDescription>
              </DialogHeader>

              {isLoadingDetails ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="size-8 animate-spin text-blue-600" />
                </div>
              ) : selectedVendor ? (
                <div className="space-y-6">
                  {/* Header Section */}
                  <div className="flex items-start gap-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="p-3 bg-blue-100 rounded-lg">
                      <Building2 className="size-8 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-3 flex-wrap">
                        <h2 className="text-xl text-slate-900">{selectedVendor.name}</h2>
                        {selectedVendor.verified && (
                          <Badge className="bg-green-100 text-green-800 border-green-300">
                            <CheckCircle2 className="size-3 mr-1" />
                            Verified
                          </Badge>
                        )}
                        <Badge>{selectedVendor.status}</Badge>
                      </div>
                      {selectedVendor.companyName && (
                        <p className="text-sm text-slate-600 mt-1">{selectedVendor.companyName}</p>
                      )}
                    </div>
                  </div>

                  {/* Basic Information */}
                  <div className="space-y-4">
                    <h3 className="text-slate-900 flex items-center gap-2">
                      <Users className="size-4" />
                      Basic Information
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-slate-50 rounded-lg">
                      {selectedVendor.fullName && (
                        <div>
                          <Label className="text-sm text-slate-600">Full Name</Label>
                          <p className="text-slate-900 mt-1">{selectedVendor.fullName}</p>
                        </div>
                      )}
                      {selectedVendor.contactPerson && (
                        <div>
                          <Label className="text-sm text-slate-600">Contact Person</Label>
                          <p className="text-slate-900 mt-1">{selectedVendor.contactPerson}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Contact Information */}
                  <div className="space-y-4">
                    <h3 className="text-slate-900 flex items-center gap-2">
                      <Phone className="size-4" />
                      Contact Information
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-slate-50 rounded-lg">
                      {selectedVendor.phone && (
                        <div>
                          <Label className="text-sm text-slate-600">Phone Number</Label>
                          <p className="text-slate-900 mt-1 flex items-center gap-2">
                            <Phone className="size-4 text-slate-400" />
                            {selectedVendor.phone}
                          </p>
                        </div>
                      )}
                      {selectedVendor.email && (
                        <div>
                          <Label className="text-sm text-slate-600">Email Address</Label>
                          <p className="text-slate-900 mt-1 flex items-center gap-2">
                            <Mail className="size-4 text-slate-400" />
                            {selectedVendor.email}
                          </p>
                        </div>
                      )}
                      {selectedVendor.address && (
                        <div className="md:col-span-2">
                          <Label className="text-sm text-slate-600">Registered Address</Label>
                          <p className="text-slate-900 mt-1">{selectedVendor.address}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Tax & Financial Information */}
                  <div className="space-y-4">
                    <h3 className="text-slate-900 flex items-center gap-2">
                      <CheckCircle2 className="size-4" />
                      Tax & Financial Information
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-slate-50 rounded-lg">
                      {selectedVendor.gst && (
                        <div>
                          <Label className="text-sm text-slate-600">GST Number</Label>
                          <p className="text-slate-900 mt-1">{selectedVendor.gst}</p>
                        </div>
                      )}
                      {selectedVendor.pan && (
                        <div>
                          <Label className="text-sm text-slate-600">PAN Number</Label>
                          <p className="text-slate-900 mt-1">{selectedVendor.pan}</p>
                        </div>
                      )}
                      {selectedVendor.bankAccount && (
                        <div>
                          <Label className="text-sm text-slate-600">Bank Account Number</Label>
                          <p className="text-slate-900 mt-1">{selectedVendor.bankAccount}</p>
                        </div>
                      )}
                      {selectedVendor.bankIfsc && (
                        <div>
                          <Label className="text-sm text-slate-600">IFSC Code</Label>
                          <p className="text-slate-900 mt-1">{selectedVendor.bankIfsc}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Timeline Information */}
                  {(selectedVendor.createdAt || selectedVendor.invitedOn) && (
                    <div className="space-y-4">
                      <h3 className="text-slate-900 flex items-center gap-2">
                        <Clock className="size-4" />
                        Timeline
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-slate-50 rounded-lg">
                        {selectedVendor.createdAt && (
                          <div>
                            <Label className="text-sm text-slate-600">Created On</Label>
                            <p className="text-slate-900 mt-1">
                              {new Date(selectedVendor.createdAt).toLocaleDateString('en-GB', {
                                day: '2-digit',
                                month: 'short',
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </p>
                          </div>
                        )}
                        {selectedVendor.invitedOn && (
                          <div>
                            <Label className="text-sm text-slate-600">Invited On</Label>
                            <p className="text-slate-900 mt-1">
                              {new Date(selectedVendor.invitedOn).toLocaleDateString('en-GB', {
                                day: '2-digit',
                                month: 'short',
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex gap-3 pt-4 border-t">
                    <Button variant="outline" className="flex-1" onClick={() => setIsDetailsDialogOpen(false)}>
                      Close
                    </Button>
                    <Button className="flex-1">
                      Get Quote
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className="text-slate-600">No vendor data available</p>
                </div>
              )}
            </DialogContent>
          </Dialog>
        </>
      )}
    </div>
  );
}
