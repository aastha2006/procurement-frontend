import { useState, useEffect } from 'react';
import { api } from '../api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Badge } from './ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { FileQuestion, Send, Clock, CheckCircle2, Eye, DollarSign, Loader2 } from 'lucide-react';
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
  requestedBy: number;
  description: string;
  budgetHead: string;
  status: string;
  approvedBy: string | null;
  approvedOn: string | null;
  createdAt: string;
  items?: PRItem[];
}

interface Vendor {
  id: number;
  invitedOn: string;
}

interface RFQ {
  id: number;
  rfqNumber: string | null;
  pr: PR;
  vendors: Vendor[];
  status: string;
  createdAt: string;
}

interface Quotation {
  id?: number;
  rfqId: number;
  vendorId: number;
  price: number;
  deliveryTerms: string;
  warranty: string;
  paymentTerms: string;
  createdAt: string;
}

interface ItemQuotation {
  itemId: number;
  itemDescription: string;
  quantity: number;
  unit: string;
  estimatedCost: number;
  quotedPrice: string;
}

interface SupplierQuotationsProps {
  authToken?: string;
  vendorId?: number;
}

export function SupplierQuotations({ authToken, vendorId }: SupplierQuotationsProps) {
  const [rfqs, setRfqs] = useState<RFQ[]>([]);
  const [selectedRFQ, setSelectedRFQ] = useState<RFQ | null>(null);
  const [isSubmitDialogOpen, setIsSubmitDialogOpen] = useState(false);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Item-wise quotation state
  const [itemQuotations, setItemQuotations] = useState<ItemQuotation[]>([]);

  useEffect(() => {
    if (authToken && vendorId) {
      fetchRFQs();
    }
  }, [authToken, vendorId]);

  const fetchRFQs = async () => {
    if (!authToken || !vendorId) {
      toast.error('Authentication required', {
        description: 'Please log in to view RFQs'
      });
      return;
    }

    setIsLoading(true);
    try {
      const response = await api.get(`/procurement/rfq/vendor/${vendorId}`, {
        headers: {
          'accept': '*/*',
        }
      });

      if (response.ok) {
        const data = await response.json();
        console.log('RFQs fetched:', data);
        setRfqs(data || []);
      } else {
        const errorText = await response.text();
        toast.error('Failed to fetch RFQs', {
          description: errorText || 'Please try again later'
        });
      }
    } catch (error) {
      console.error('Error fetching RFQs:', error);
      toast.error('Error fetching RFQs', {
        description: 'Network error. Please check your connection.'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const openSubmitDialog = (rfq: RFQ) => {
    setSelectedRFQ(rfq);

    // Initialize item-wise quotations from PR items
    const initialQuotations = rfq.pr.items?.map((item) => ({
      itemId: item.id || 0,
      itemDescription: item.itemDescription,
      quantity: item.quantity,
      unit: item.unit,
      estimatedCost: item.estimatedCost,
      quotedPrice: ''
    })) || [];

    setItemQuotations(initialQuotations);
    setIsSubmitDialogOpen(true);
  };

  const openDetailDialog = (rfq: RFQ) => {
    setSelectedRFQ(rfq);
    setIsDetailDialogOpen(true);
  };

  const updateItemQuotation = (index: number, field: keyof ItemQuotation, value: string) => {
    setItemQuotations(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const calculateTotalQuotedPrice = () => {
    return itemQuotations.reduce((sum, item) => {
      const price = parseFloat(item.quotedPrice) || 0;
      return sum + price;
    }, 0);
  };

  const handleSubmitQuotation = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedRFQ || !vendorId || !authToken) return;

    // Validate that all items have quoted prices
    const hasEmptyPrices = itemQuotations.some(item => !item.quotedPrice || parseFloat(item.quotedPrice) <= 0);
    if (hasEmptyPrices) {
      toast.error('Incomplete quotation', {
        description: 'Please provide quoted prices for all items'
      });
      return;
    }

    setIsSubmitting(true);

    // Prepare item-wise quotation data
    const items = itemQuotations.map(item => ({
      itemId: item.itemId,
      price: parseFloat(item.quotedPrice),
      qty: item.quantity
    }));

    const quotationData = {
      rfqId: selectedRFQ.id,
      vendorId: vendorId,
      items: items
    };

    console.log('Submitting item-wise quotation:', quotationData);

    try {
      const response = await api.post('/procurement/rfq/submit', quotationData, {
        headers: {
          'accept': '*/*',
          'Content-Type': 'application/json',
        }
      });

      if (response.ok) {
        const result = await response.json();
        const rfqNumber = selectedRFQ.rfqNumber || `RFQ-${selectedRFQ.id}`;
        toast.success('Quotation submitted successfully!', {
          description: `Your item-wise quotation for ${rfqNumber} has been submitted.`
        });

        // Refresh RFQs list
        await fetchRFQs();

        setIsSubmitDialogOpen(false);
        setSelectedRFQ(null);
      } else {
        const errorText = await response.text();
        toast.error('Failed to submit quotation', {
          description: errorText || 'Please try again later.'
        });
      }
    } catch (error) {
      console.error('Error submitting quotation:', error);
      toast.error('Error submitting quotation', {
        description: 'Network error. Please check your connection and try again.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toUpperCase()) {
      case 'CREATED':
      case 'OPEN':
        return 'bg-green-100 text-green-700';
      case 'SUBMITTED':
      case 'QUOTED':
        return 'bg-blue-100 text-blue-700';
      case 'CLOSED':
      case 'AWARDED':
        return 'bg-slate-100 text-slate-700';
      default:
        return 'bg-slate-100 text-slate-700';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toUpperCase()) {
      case 'CREATED':
      case 'OPEN':
        return <Clock className="size-3" />;
      case 'SUBMITTED':
      case 'QUOTED':
        return <CheckCircle2 className="size-3" />;
      default:
        return null;
    }
  };

  const isRFQOpen = (status: string) => {
    return status.toUpperCase() === 'CREATED' || status.toUpperCase() === 'OPEN';
  };

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-slate-600">Total RFQs</p>
            <p className="text-slate-900 mt-1">{rfqs.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-slate-600">Open RFQs</p>
            <p className="text-slate-900 mt-1">
              {rfqs.filter(r => isRFQOpen(r.status)).length}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-slate-600">Submitted</p>
            <p className="text-slate-900 mt-1">
              {rfqs.filter(r => r.status.toUpperCase() === 'SUBMITTED' || r.status.toUpperCase() === 'QUOTED').length}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-slate-600">Pending Action</p>
            <p className="text-slate-900 mt-1">
              {rfqs.filter(r => isRFQOpen(r.status)).length}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileQuestion className="size-5 text-blue-600" />
            Request for Quotations
          </CardTitle>
          <CardDescription>
            View and respond to RFQs sent by the society
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border border-slate-200">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>RFQ Number</TableHead>
                  <TableHead>PR Number</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead className="text-right">Quantity</TableHead>
                  <TableHead className="text-right">Est. Budget</TableHead>
                  <TableHead>Invited On</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-12">
                      <div className="flex items-center justify-center gap-3">
                        <Loader2 className="size-6 animate-spin text-blue-600" />
                        <span className="text-slate-600">Loading RFQs...</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : rfqs.length > 0 ? (
                  rfqs.map((rfq) => {
                    const rfqNumber = rfq.rfqNumber || `RFQ-${rfq.id}`;
                    const invitedVendor = rfq.vendors.find(v => v.id === vendorId);
                    const invitedDate = invitedVendor ? new Date(invitedVendor.invitedOn).toLocaleDateString() : 'N/A';

                    // Calculate total quantity and cost from items
                    const items = rfq.pr.items || [];
                    const totalQuantity = items.reduce((sum, item) => sum + (item.quantity || 0), 0);
                    const totalCost = items.reduce((sum, item) => sum + (item.estimatedCost || 0), 0);
                    const itemsCount = items.length;

                    return (
                      <TableRow key={rfq.id}>
                        <TableCell>
                          <Badge variant="outline">{rfqNumber}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary">{rfq.pr.prNumber}</Badge>
                        </TableCell>
                        <TableCell>
                          <div className="max-w-xs">
                            <p className="text-sm text-slate-900 truncate">{rfq.pr.description}</p>
                            <p className="text-xs text-slate-500 mt-1">{rfq.pr.department}</p>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          {itemsCount > 0 ? (
                            <div>
                              <p className="text-sm text-slate-900">{itemsCount} item(s)</p>
                              <p className="text-xs text-slate-500">Total: {totalQuantity.toLocaleString()}</p>
                            </div>
                          ) : (
                            <span className="text-slate-500">-</span>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          ₹{totalCost.toLocaleString()}
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="text-sm text-slate-900">{invitedDate}</p>
                            <p className="text-xs text-slate-500 mt-1">Invited</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(rfq.status)}>
                            {getStatusIcon(rfq.status)}
                            <span className="ml-1">{rfq.status}</span>
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex gap-2 justify-end">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => openDetailDialog(rfq)}
                            >
                              <Eye className="size-4" />
                            </Button>
                            {isRFQOpen(rfq.status) && (
                              <Button
                                size="sm"
                                onClick={() => openSubmitDialog(rfq)}
                              >
                                <Send className="size-4 mr-1" />
                                Submit Quote
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })
                ) : (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-12">
                      <FileQuestion className="size-12 text-slate-300 mx-auto mb-3" />
                      <p className="text-slate-600">No RFQs available</p>
                      <p className="text-sm text-slate-500 mt-2">
                        You will see RFQs here when the society invites you to bid
                      </p>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* RFQ Detail Dialog */}
      <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>RFQ Details</DialogTitle>
            <DialogDescription>
              Complete information about the request for quotation
            </DialogDescription>
          </DialogHeader>
          {selectedRFQ && (
            <div className="space-y-6">
              {/* RFQ Information */}
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <h3 className="text-sm text-blue-900 mb-3">RFQ Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-slate-600">RFQ Number</p>
                    <p className="text-slate-900 mt-1">{selectedRFQ.rfqNumber || `RFQ-${selectedRFQ.id}`}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-600">Status</p>
                    <Badge className={getStatusColor(selectedRFQ.status)}>
                      {selectedRFQ.status}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-sm text-slate-600">RFQ Created On</p>
                    <p className="text-slate-900 mt-1">
                      {new Date(selectedRFQ.createdAt).toLocaleDateString('en-GB', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric'
                      })}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-600">Invited Vendors</p>
                    <p className="text-slate-900 mt-1">{selectedRFQ.vendors.length} vendor(s)</p>
                  </div>
                </div>
              </div>

              {/* PR Information */}
              <div className="space-y-4">
                <h3 className="text-slate-900">Purchase Requisition Details</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-slate-600">PR Number</p>
                    <p className="text-slate-900 mt-1">{selectedRFQ.pr.prNumber}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-600">Department</p>
                    <p className="text-slate-900 mt-1">{selectedRFQ.pr.department}</p>
                  </div>
                </div>

                <div>
                  <p className="text-sm text-slate-600">Description</p>
                  <p className="text-slate-900 mt-1">{selectedRFQ.pr.description}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-slate-600">Budget Head</p>
                    <p className="text-slate-900 mt-1">{selectedRFQ.pr.budgetHead}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-600">PR Status</p>
                    <Badge variant="outline">{selectedRFQ.pr.status}</Badge>
                  </div>
                </div>

                <div>
                  <p className="text-sm text-slate-600 mb-2">PR Created On</p>
                  <p className="text-slate-900">
                    {new Date(selectedRFQ.pr.createdAt).toLocaleDateString('en-GB', {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
              </div>

              {/* Items List */}
              {selectedRFQ.pr.items && selectedRFQ.pr.items.length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-slate-900">Items / Services ({selectedRFQ.pr.items.length})</h3>
                  <div className="space-y-3">
                    {selectedRFQ.pr.items.map((item, index) => (
                      <div key={index} className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="text-sm text-slate-900">Item {index + 1}</h4>
                          <Badge variant="outline" className="text-xs">
                            ₹{(item.estimatedCost || 0).toLocaleString()}
                          </Badge>
                        </div>
                        <p className="text-sm text-slate-900 mb-2">{item.itemDescription || 'No description'}</p>
                        <div className="flex gap-4 text-xs text-slate-600">
                          <span>Qty: {item.quantity || 0} {item.unit || 'unit'}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-900">Total Estimated Cost:</span>
                      <span className="text-blue-900">
                        ₹{selectedRFQ.pr.items.reduce((sum, item) => sum + (item.estimatedCost || 0), 0).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex gap-3 pt-4 border-t">
                {isRFQOpen(selectedRFQ.status) && (
                  <Button
                    className="flex-1"
                    onClick={() => {
                      setIsDetailDialogOpen(false);
                      openSubmitDialog(selectedRFQ);
                    }}
                  >
                    <Send className="size-4 mr-2" />
                    Submit Quotation
                  </Button>
                )}
                <Button variant="outline" onClick={() => setIsDetailDialogOpen(false)}>
                  Close
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Submit Quotation Dialog */}
      <Dialog open={isSubmitDialogOpen} onOpenChange={setIsSubmitDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <DollarSign className="size-5 text-green-600" />
              Submit Item-wise Quotation
            </DialogTitle>
            <DialogDescription>
              Provide your best quote for each item in {selectedRFQ?.rfqNumber || `RFQ-${selectedRFQ?.id}`}
            </DialogDescription>
          </DialogHeader>
          {selectedRFQ && (
            <form onSubmit={handleSubmitQuotation} className="space-y-6">
              {/* RFQ Summary */}
              <div className="p-4 bg-slate-50 rounded-lg space-y-2">
                <div>
                  <p className="text-sm text-slate-900">{selectedRFQ.pr.description}</p>
                  <p className="text-xs text-slate-600 mt-1">
                    {selectedRFQ.pr.department} • {selectedRFQ.pr.budgetHead}
                  </p>
                </div>
              </div>

              {/* Item-wise Quotations */}
              {itemQuotations.length > 0 && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-slate-900">Quote for Each Item</h3>
                    <Badge variant="outline" className="text-xs">
                      {itemQuotations.length} item(s)
                    </Badge>
                  </div>

                  {itemQuotations.map((item, index) => (
                    <div key={index} className="p-4 border border-slate-200 rounded-lg space-y-4 bg-white">
                      {/* Item Header */}
                      <div className="flex items-start justify-between pb-3 border-b border-slate-200">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge variant="secondary" className="text-xs">Item {index + 1}</Badge>
                            <Badge variant="outline" className="text-xs">
                              Est: ₹{item.estimatedCost.toLocaleString()}
                            </Badge>
                          </div>
                          <p className="text-sm text-slate-900">{item.itemDescription}</p>
                          <p className="text-xs text-slate-600 mt-1">
                            Quantity: {item.quantity} {item.unit}
                          </p>
                        </div>
                      </div>

                      {/* Quotation Fields */}
                      <div className="space-y-2">
                        <Label htmlFor={`quotedPrice-${index}`}>
                          <DollarSign className="size-3 inline mr-1" />
                          Your Quoted Price per Unit (₹) *
                        </Label>
                        <Input
                          id={`quotedPrice-${index}`}
                          type="number"
                          step="0.01"
                          placeholder="e.g., 450.75"
                          value={item.quotedPrice}
                          onChange={(e) => updateItemQuotation(index, 'quotedPrice', e.target.value)}
                          required
                          disabled={isSubmitting}
                          className="text-base"
                        />
                        {item.quotedPrice && parseFloat(item.quotedPrice) > 0 && (
                          <p className="text-xs text-slate-600">
                            Total for this item: ₹{(parseFloat(item.quotedPrice) * item.quantity).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}

                  {/* Total Quoted Price */}
                  <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-900">Total Quoted Price:</span>
                      <span className="text-green-900 text-lg">
                        ₹{calculateTotalQuotedPrice().toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-xs text-blue-900">
                  Please ensure all item prices are accurate. Once submitted, your quotation will be reviewed by the procurement team.
                </p>
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="size-4 mr-2 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Send className="size-4 mr-2" />
                      Submit Item-wise Quotation
                    </>
                  )}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsSubmitDialogOpen(false)}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
