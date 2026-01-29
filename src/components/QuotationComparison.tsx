import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { FileQuestion, TrendingDown, Award, AlertCircle, Loader2, RefreshCw, CheckCircle2, ShoppingCart, ArrowDownToLine } from 'lucide-react';
import { toast } from 'sonner';
import {
  fetchRecentRFQs,
  fetchRFQComparison,
  selectRFQVendor,
  generatePOFromQuotation,
  submitInvoice
} from '../services/procurementService';

// TypeScript Interfaces matching API structure
interface ComparisonItem {
  itemId: number;
  itemDescription: string;
  quantity: number;
  unit: string;
}

interface ComparisonVendor {
  vendorId: number;
  vendorName: string;
  vendorCode: string;
  rating: number;
  basePrice: number;
  gst: number;
  total: number;
  delivery: string;
  warranty: string;
  paymentTerms: string;
  isLowest: boolean;
  isBestValue: boolean;
}

interface ComparisonData {
  rfqId: number;
  prNumber: string;
  items: ComparisonItem[];
  vendors: ComparisonVendor[];
  recommendation: string;
}

interface RFQWithComparison {
  id: number;
  rfqNumber: string;
  status: string;
  prNumber?: string;
  quotationCount?: number;
  hasQuotations: boolean;
  comparisonData?: ComparisonData;
  selectedVendor?: number;
  selectedBy?: number;
  selectedOn?: string;
}

interface QuotationComparisonProps {
  authToken?: string;
}

export function QuotationComparison({ authToken }: QuotationComparisonProps) {
  const [rfqs, setRfqs] = useState<RFQWithComparison[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedVendors, setSelectedVendors] = useState<{ [key: number]: number }>({});
  const [fetchingComparison, setFetchingComparison] = useState<{ [key: number]: boolean }>({});
  const [approvingRFQ, setApprovingRFQ] = useState<{ [key: number]: boolean }>({});
  const [generatingPO, setGeneratingPO] = useState<{ [key: number]: boolean }>({});
  const [generatedPOs, setGeneratedPOs] = useState<{ [key: number]: any }>({});
  const [processingInvoice, setProcessingInvoice] = useState<{ [key: number]: boolean }>({});

  // Fetch list of RFQs that have quotations
  const fetchRFQs = async () => {
    if (!authToken) return;

    setLoading(true);
    try {
      const data = await fetchRecentRFQs(authToken);

      // Handle paginated response if applicable
      const rfqList = data.content || data;

      const normalized = rfqList.map((rfq: any) => ({
        id: rfq.id,
        rfqNumber: rfq.rfqNumber || `RFQ-${rfq.id}`,
        status: rfq.status || 'Unknown',
        prNumber: rfq.pr?.prNumber || rfq.prNumber || rfq.prId || '',
        quotationCount: rfq.quotationCount || 0,
        hasQuotations: rfq.quotationCount > 0 ||
          ['OPEN', 'Quotations Received', 'Evaluation', 'QUOTATIONS_RECEIVED', 'VENDOR_SELECTED'].includes(rfq.status),
        selectedVendor: rfq.selectedVendor || null,
        selectedBy: rfq.selectedBy || null,
        selectedOn: rfq.selectedOn || null,
      }));

      setRfqs(normalized);
    } catch (error: any) {
      toast.error('Failed to load RFQs', {
        description: error.message || 'Please try again later',
      });
    } finally {
      setLoading(false);
    }
  };

  // Fetch comparison data for a specific RFQ
  const fetchComparisonData = async (rfqId: number) => {
    if (!authToken) return;

    setFetchingComparison((prev) => ({ ...prev, [rfqId]: true }));
    try {
      const comparisonData = await fetchRFQComparison(authToken, rfqId);

      setRfqs((prevRfqs) =>
        prevRfqs.map((rfq) =>
          rfq.id === rfqId ? { ...rfq, comparisonData } : rfq
        )
      );
    } catch (error: any) {
      toast.error('Failed to load comparison data', {
        description: error.message,
      });
    } finally {
      setFetchingComparison((prev) => ({ ...prev, [rfqId]: false }));
    }
  };

  useEffect(() => {
    if (authToken) {
      fetchRFQs();
    }
  }, [authToken]);

  // Auto-fetch comparison data for each RFQ when loaded if it has comparison data potential
  useEffect(() => {
    rfqs.forEach((rfq) => {
      // Only auto-fetch if we know there are already quotations to save bandwidth
      if (rfq.hasQuotations && !rfq.comparisonData && !fetchingComparison[rfq.id]) {
        fetchComparisonData(rfq.id);
      }
    });
  }, [rfqs.length]); // Trigged when RFQs list is populated

  const handleSelectVendor = (rfqId: number, vendorId: number) => {
    setSelectedVendors((prev) => ({ ...prev, [rfqId]: vendorId }));
  };

  const handleApproveQuotation = async (rfqId: number, vendorId: number) => {
    if (!authToken) {
      toast.error('Authentication required');
      return;
    }

    setApprovingRFQ((prev) => ({ ...prev, [rfqId]: true }));

    try {
      await selectRFQVendor(authToken, rfqId, vendorId);

      toast.success('Vendor selected successfully!', {
        description: 'Vendor has been approved for this RFQ.',
      });

      // Refresh the RFQs list to get updated status
      await fetchRFQs();

    } catch (error: any) {
      toast.error('Failed to select vendor', {
        description: error.message,
      });
    } finally {
      setApprovingRFQ((prev) => ({ ...prev, [rfqId]: false }));
    }
  };

  const handleGeneratePO = async (rfq: RFQWithComparison) => {
    if (!authToken) {
      toast.error('Authentication required');
      return;
    }

    if (!rfq.comparisonData || !rfq.selectedVendor) {
      toast.error('Cannot generate PO', { description: 'Missing vendor selection data' });
      return;
    }

    setGeneratingPO(prev => ({ ...prev, [rfq.id]: true }));

    try {
      const selectedVendor = rfq.comparisonData.vendors.find(v => v.vendorId === rfq.selectedVendor);

      if (!selectedVendor) {
        throw new Error('Selected vendor details not found in comparison');
      }

      const newPO = await generatePOFromQuotation(
        authToken,
        rfq.comparisonData.rfqId,
        rfq.selectedVendor,
        selectedVendor.total,
        selectedVendor.gst
      );

      setGeneratedPOs(prev => ({ ...prev, [rfq.id]: newPO }));

      toast.success('Purchase Order Generated', {
        description: `PO created for ${selectedVendor.vendorName}`
      });

    } catch (error: any) {
      toast.error('Failed to generate PO', { description: error.message });
    } finally {
      setGeneratingPO(prev => ({ ...prev, [rfq.id]: false }));
    }
  };

  const handleReceiveInvoice = async (rfqId: number) => {
    if (!authToken) return;

    const po = generatedPOs[rfqId];
    if (!po) return;

    // Auto-generate invoice details for simplicity (Shortcut Workflow)
    const invoiceNumber = `INV-${po.poNumber?.split('-')?.[1] || po.id}-${Math.floor(1000 + Math.random() * 9000)}`;
    const today = new Date().toISOString().split('T')[0];
    const amount = po.totalAmount;
    const gst = po.gst;
    const poVendorId = po.vendor?.id || po.vendorId;

    if (!poVendorId) {
      toast.error("Vendor information missing from PO");
      return;
    }

    setProcessingInvoice(prev => ({ ...prev, [rfqId]: true }));

    try {
      await submitInvoice(authToken, po.id, poVendorId, invoiceNumber, today, amount, gst);
      toast.success("Invoice Received Successfully", {
        description: `Generated Invoice #${invoiceNumber}. Payment tracking initiated.`
      });
      setGeneratedPOs(prev => ({ ...prev, [rfqId]: { ...po, invoiceReceived: true } }));

    } catch (error: any) {
      toast.error("Failed to receive invoice", { description: error.message });
    } finally {
      setProcessingInvoice(prev => ({ ...prev, [rfqId]: false }));
    }
  };

  const getItemsSummary = (items: ComparisonItem[]) => {
    if (!items || items.length === 0) return 'No items';
    if (items.length === 1) {
      return `${items[0].itemDescription} (${items[0].quantity} ${items[0].unit})`;
    }
    const totalQty = items.reduce((sum, item) => sum + item.quantity, 0);
    return `${items.length} items (Total qty: ${totalQty})`;
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <FileQuestion className="size-5 text-blue-600" />
                Quotation Comparison
              </CardTitle>
              <CardDescription>
                Compare vendor quotations and select the best option
              </CardDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={fetchRFQs}
              disabled={loading}
            >
              <RefreshCw className={`size-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </CardHeader>
      </Card>

      {loading ? (
        <Card>
          <CardContent className="flex items-center justify-center py-12">
            <div className="flex flex-col items-center gap-3">
              <Loader2 className="size-8 animate-spin text-blue-600" />
              <p className="text-sm text-slate-600">Loading RFQs...</p>
            </div>
          </CardContent>
        </Card>
      ) : rfqs.length === 0 ? (
        <Card>
          <CardContent className="flex items-center justify-center py-12">
            <div className="flex flex-col items-center gap-3 text-center">
              <FileQuestion className="size-12 text-slate-300" />
              <p className="text-slate-600">No RFQs found</p>
              <p className="text-sm text-slate-500">
                Create RFQs from the RFQ Management tab to get started
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        rfqs.map((rfq) => {
          const comparisonData = rfq.comparisonData;
          const isLoadingComparison = fetchingComparison[rfq.id];
          const selectedVendorId = selectedVendors[rfq.id];
          const isApproving = approvingRFQ[rfq.id];
          const isGeneratingPO = generatingPO[rfq.id];
          const isVendorSelected = rfq.status === 'VENDOR_SELECTED';

          return (
            <Card key={rfq.id} className={isVendorSelected ? 'border-green-200 bg-green-50/30' : ''}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <CardTitle className="text-lg">{rfq.rfqNumber}</CardTitle>
                      {comparisonData && (
                        <Badge variant="outline">{comparisonData.prNumber}</Badge>
                      )}
                      {isVendorSelected ? (
                        <Badge className="bg-green-600 hover:bg-green-700">
                          <CheckCircle2 className="size-3 mr-1" />
                          Vendor Selected
                        </Badge>
                      ) : (
                        <Badge variant="default">{rfq.status}</Badge>
                      )}

                      {/* Generate PO or Receive Invoice Button */}
                      {isVendorSelected && (
                        generatedPOs[rfq.id] ? (
                          <Button
                            size="sm"
                            className="bg-green-600 hover:bg-green-700 ml-2"
                            onClick={() => handleReceiveInvoice(rfq.id)}
                            disabled={processingInvoice[rfq.id] || generatedPOs[rfq.id].invoiceReceived}
                          >
                            {processingInvoice[rfq.id] ? (
                              <Loader2 className="size-3 mr-1 animate-spin" />
                            ) : (
                              <ArrowDownToLine className="size-3 mr-1" />
                            )}
                            {generatedPOs[rfq.id].invoiceReceived ? 'Invoice Received' : 'Receive Invoice'}
                          </Button>
                        ) : (
                          <Button
                            size="sm"
                            className="bg-purple-600 hover:bg-purple-700 ml-2"
                            onClick={() => handleGeneratePO(rfq)}
                            disabled={isGeneratingPO}
                          >
                            {isGeneratingPO ? (
                              <Loader2 className="size-3 mr-1 animate-spin" />
                            ) : (
                              <ShoppingCart className="size-3 mr-1" />
                            )}
                            Generate PO
                          </Button>
                        )
                      )}
                    </div>
                    {comparisonData && (
                      <CardDescription className="mt-2">
                        {getItemsSummary(comparisonData.items)}
                      </CardDescription>
                    )}
                  </div>
                  {comparisonData && comparisonData.vendors.length > 0 && (
                    <Badge variant="secondary" className="ml-2">
                      {comparisonData.vendors.length} Quotation{comparisonData.vendors.length !== 1 ? 's' : ''}
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {isLoadingComparison ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="flex flex-col items-center gap-3">
                      <Loader2 className="size-6 animate-spin text-blue-600" />
                      <p className="text-sm text-slate-600">Loading comparison data...</p>
                    </div>
                  </div>
                ) : !comparisonData ? (
                  <div className="text-center py-8 text-slate-500">
                    <AlertCircle className="size-12 mx-auto text-slate-300 mb-3" />
                    <p>Unable to load comparison data or no data available</p>
                    {rfq.hasQuotations && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="mt-3"
                        onClick={() => fetchComparisonData(rfq.id)}
                      >
                        <RefreshCw className="size-4 mr-2" />
                        Load Data
                      </Button>
                    )}
                  </div>
                ) : comparisonData.vendors.length === 0 ? (
                  <div className="text-center py-8 text-slate-500">
                    <FileQuestion className="size-12 mx-auto text-slate-300 mb-3" />
                    <p>No quotations received yet</p>
                    <p className="text-sm mt-1">Awaiting responses from vendors</p>
                  </div>
                ) : (
                  <>
                    {/* Vendor Selected Confirmation */}
                    {isVendorSelected && rfq.selectedVendor && (
                      <div className="mb-6 p-4 bg-green-50 border border-green-300 rounded-lg">
                        <div className="flex items-start gap-3">
                          <CheckCircle2 className="size-5 text-green-600 flex-shrink-0 mt-0.5" />
                          <div className="flex-1">
                            <p className="text-green-900">RFQ Process Complete</p>
                            <p className="text-sm text-green-700 mt-1">
                              Vendor (ID: {rfq.selectedVendor}) has been selected for this RFQ.
                              {rfq.selectedOn && ` Selected on ${new Date(rfq.selectedOn).toLocaleString()}.`}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Items List */}
                    {comparisonData.items.length > 1 && (
                      <div className="mb-6 p-4 bg-slate-50 border border-slate-200 rounded-lg">
                        <p className="text-sm text-slate-900 mb-3">Items in this RFQ:</p>
                        <div className="grid gap-2">
                          {comparisonData.items.map((item, index) => (
                            <div key={item.itemId} className="flex items-center justify-between text-sm">
                              <span className="text-slate-900">
                                {index + 1}. {item.itemDescription}
                              </span>
                              <span className="text-slate-600">
                                {item.quantity} {item.unit}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Comparison Table */}
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Vendor</TableHead>
                            <TableHead className="text-right">Base Price</TableHead>
                            <TableHead className="text-right">GST</TableHead>
                            <TableHead className="text-right">Total</TableHead>
                            <TableHead>Delivery</TableHead>
                            <TableHead>Warranty</TableHead>
                            <TableHead>Payment</TableHead>
                            <TableHead>Rating</TableHead>
                            <TableHead></TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {comparisonData.vendors.map((vendor) => {
                            const isSelected = selectedVendorId === vendor.vendorId;
                            const isFinallySelected = isVendorSelected && rfq.selectedVendor === vendor.vendorId;

                            return (
                              <TableRow
                                key={vendor.vendorId}
                                className={isFinallySelected ? 'bg-green-50' : isSelected ? 'bg-blue-50' : ''}
                              >
                                <TableCell>
                                  <div>
                                    <div className="flex items-center gap-2">
                                      <div>
                                        <p className="text-slate-900">{vendor.vendorName}</p>
                                        <p className="text-xs text-slate-500">{vendor.vendorCode}</p>
                                      </div>
                                      {isFinallySelected && (
                                        <Badge className="bg-green-600 hover:bg-green-700 text-xs">
                                          <CheckCircle2 className="size-3 mr-1" />
                                          Selected
                                        </Badge>
                                      )}
                                    </div>
                                    <div className="flex gap-1 mt-1">
                                      {vendor.isLowest && (
                                        <Badge variant="outline" className="text-xs bg-green-50 border-green-300 text-green-700">
                                          <TrendingDown className="size-3 mr-1" />
                                          Lowest
                                        </Badge>
                                      )}
                                      {vendor.isBestValue && (
                                        <Badge variant="outline" className="text-xs bg-blue-50 border-blue-300 text-blue-700">
                                          <Award className="size-3 mr-1" />
                                          Best Value
                                        </Badge>
                                      )}
                                    </div>
                                  </div>
                                </TableCell>
                                <TableCell className="text-right">
                                  ₹{(vendor.basePrice || 0).toLocaleString()}
                                </TableCell>
                                <TableCell className="text-right">
                                  ₹{(vendor.gst || 0).toLocaleString()}
                                </TableCell>
                                <TableCell className="text-right">
                                  <span className={vendor.isLowest ? 'text-green-700' : ''}>
                                    ₹{(vendor.total || 0).toLocaleString()}
                                  </span>
                                </TableCell>
                                <TableCell>{vendor.delivery || 'N/A'}</TableCell>
                                <TableCell>{vendor.warranty || 'N/A'}</TableCell>
                                <TableCell>{vendor.paymentTerms || 'N/A'}</TableCell>
                                <TableCell>⭐ {vendor.rating || 0}</TableCell>
                                <TableCell>
                                  {isFinallySelected ? (
                                    <Badge className="bg-green-600 hover:bg-green-700">
                                      <CheckCircle2 className="size-3 mr-1" />
                                      Approved
                                    </Badge>
                                  ) : isVendorSelected ? (
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      disabled
                                    >
                                      -
                                    </Button>
                                  ) : (
                                    <Button
                                      size="sm"
                                      variant={isSelected ? 'default' : 'outline'}
                                      onClick={() => handleSelectVendor(rfq.id, vendor.vendorId)}
                                    >
                                      {isSelected ? 'Selected' : 'Select'}
                                    </Button>
                                  )}
                                </TableCell>
                              </TableRow>
                            );
                          })}
                        </TableBody>
                      </Table>
                    </div>

                    {/* Recommendation Summary */}
                    {comparisonData.recommendation && (
                      <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                        <div className="flex items-start gap-3">
                          <AlertCircle className="size-5 text-blue-600 flex-shrink-0 mt-0.5" />
                          <div className="flex-1">
                            <p className="text-sm text-slate-900">Recommendation</p>
                            <p className="text-sm text-slate-600 mt-1">
                              {comparisonData.recommendation}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Action Buttons */}
                    {!isVendorSelected && (
                      <div className="flex gap-3 mt-6">
                        <Button
                          onClick={() => selectedVendorId && handleApproveQuotation(rfq.id, selectedVendorId)}
                          disabled={!selectedVendorId || isApproving}
                        >
                          {isApproving ? (
                            <>
                              <Loader2 className="size-4 mr-2 animate-spin" />
                              Selecting Vendor...
                            </>
                          ) : (
                            'Select Vendor & Approve'
                          )}
                        </Button>
                        <Button variant="outline">Request More Details</Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => fetchComparisonData(rfq.id)}
                          disabled={isLoadingComparison}
                        >
                          <RefreshCw className={`size-4 mr-2 ${isLoadingComparison ? 'animate-spin' : ''}`} />
                          Refresh Data
                        </Button>
                      </div>
                    )}
                  </>
                )}
              </CardContent>
            </Card>
          );
        })
      )}
    </div>
  );
}