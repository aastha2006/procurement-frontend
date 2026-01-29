import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { ShoppingCart, Search, Download, Eye, FileText, Loader2, ArrowDownToLine } from 'lucide-react';
import { useState, useEffect } from 'react';
import { fetchPurchaseOrders, submitInvoice } from '../services/procurementService';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";

interface PurchaseOrdersProps {
  authToken?: string;
  vendorId?: number;
  isSupplierView?: boolean;
}

export function PurchaseOrders({ authToken, vendorId, isSupplierView = false }: PurchaseOrdersProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [purchaseOrders, setPurchaseOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedPO, setSelectedPO] = useState<any>(null);
  const [processingInvoice, setProcessingInvoice] = useState<{ [key: number]: boolean }>({});

  useEffect(() => {
    if (authToken) {
      loadPOs();
    }
  }, [authToken]);

  const loadPOs = async () => {
    setLoading(true);
    try {
      const data = await fetchPurchaseOrders(authToken!);

      // Filter for supplier view if needed
      let filteredData = data;
      if (isSupplierView && vendorId) {
        filteredData = data.filter((po: any) => po.vendorId === vendorId || po.vendor?.id === vendorId);
      }

      // Simple mapping to ensure fields exist or match API response
      setPurchaseOrders(filteredData);
    } catch (error) {
      console.error('Error fetching POs:', error);
      toast.error('Failed to load Purchase Orders');
    } finally {
      setLoading(false);
    }
  };

  const handleReceiveInvoice = async (po: any) => {
    if (!authToken) return;

    // Auto-generate invoice details for simplicity (Shortcut Workflow)
    const invoiceNumber = `INV-${po.poNumber.split('-')[1]}-${Math.floor(1000 + Math.random() * 9000)}`;
    const today = new Date().toISOString().split('T')[0];
    const amount = po.totalAmount;
    const gst = po.gst;
    const poVendorId = po.vendor?.id || po.vendorId;

    if (!poVendorId) {
      toast.error("Vendor information missing from PO");
      return;
    }

    setProcessingInvoice(prev => ({ ...prev, [po.id]: true }));

    try {
      await submitInvoice(authToken, po.id, poVendorId, invoiceNumber, today, amount, gst);
      toast.success("Invoice Received Successfully", {
        description: `Generated Invoice #${invoiceNumber} for payment processing.`
      });
      // Optionally refresh list or update status locally
    } catch (error: any) {
      toast.error("Failed to receive invoice", { description: error.message });
    } finally {
      setProcessingInvoice(prev => ({ ...prev, [po.id]: false }));
    }
  };


  const filteredPOs = purchaseOrders.filter(po => {
    const searchLower = searchTerm.toLowerCase();
    const poNumber = po.poNumber?.toLowerCase() || '';
    const vendorName = po.vendorName?.toLowerCase() || po.vendor?.vendorName?.toLowerCase() || '';
    return poNumber.includes(searchLower) || vendorName.includes(searchLower);
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ISSUED':
      case 'In Transit':
        return 'bg-blue-100 text-blue-700';
      case 'DELIVERED':
        return 'bg-green-100 text-green-700';
      case 'PENDING':
        return 'bg-orange-100 text-orange-700';
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
                <ShoppingCart className="size-5 text-blue-600" />
                {isSupplierView ? 'My Purchase Orders' : 'Purchase Orders'}
              </CardTitle>
              <CardDescription>Track and manage all purchase orders</CardDescription>
            </div>
            {!isSupplierView && (
              <Button onClick={() => toast.info('To create a PO, please go to "All PRs", select an Approved PR, and complete the process.')}>
                Create Manual PO
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
              <Input
                placeholder="Search by PO Number or Vendor..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Button variant="outline" size="icon" onClick={loadPOs} disabled={loading}>
              <Loader2 className={`size-4 ${loading ? 'animate-spin' : ''}`} />
            </Button>
          </div>

          <div className="space-y-4">
            {loading ? (
              <div className="text-center py-8 text-slate-500">Loading purchase orders...</div>
            ) : filteredPOs.length === 0 ? (
              <div className="text-center py-8 text-slate-500">No purchase orders found.</div>
            ) : (
              filteredPOs.map((po) => (
                <div
                  key={po.id}
                  className="p-4 border border-slate-200 rounded-lg hover:border-slate-300 hover:shadow-sm transition-all"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-slate-900 font-medium">{po.poNumber || `PO #${po.id}`}</h3>
                        {po.pr && <Badge variant="outline">PR: {po.pr.prNumber || po.pr.id}</Badge>}
                        <Badge className={getStatusColor(po.status || 'PENDING')}>
                          {po.status || 'PENDING'}
                        </Badge>
                      </div>

                      <div className="mt-3 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div>
                          <p className="text-xs text-slate-500">Vendor</p>
                          <p className="text-sm text-slate-900 mt-1">{po.vendorName || po.vendor?.vendorName || 'N/A'}</p>
                        </div>
                        <div>
                          <p className="text-xs text-slate-500">Total Amount</p>
                          <p className="text-sm text-slate-900 mt-1">₹{po.totalAmount?.toLocaleString() || 0}</p>
                        </div>
                        <div>
                          <p className="text-xs text-slate-500">Created At</p>
                          <p className="text-sm text-slate-900 mt-1">
                            {po.createdAt ? new Date(po.createdAt).toLocaleDateString() : 'N/A'}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-slate-500">Items</p>
                          <p className="text-sm text-slate-900 mt-1">{po.pr?.items?.length || 0} Items</p>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col gap-2">
                      {/* Manager Shortcut: Receive Invoice directly */}
                      {!isSupplierView && (
                        <Button
                          size="sm"
                          className="bg-green-600 hover:bg-green-700"
                          onClick={() => handleReceiveInvoice(po)}
                          disabled={processingInvoice[po.id]}
                        >
                          {processingInvoice[po.id] ? (
                            <Loader2 className="size-3 mr-1 animate-spin" />
                          ) : (
                            <ArrowDownToLine className="size-3 mr-1" />
                          )}
                          Receive Invoice
                        </Button>
                      )}
                      <Button variant="outline" size="sm" onClick={() => setSelectedPO(po)}>
                        <Eye className="size-4 mr-1" />
                        View
                      </Button>
                      <Button variant="outline" size="sm" disabled>
                        <Download className="size-4 mr-1" />
                        Download
                      </Button>
                    </div>
                  </div>
                </div>
              )))}
          </div>
        </CardContent>
      </Card>

      {/* View PO Details Modal */}
      <Dialog open={!!selectedPO} onOpenChange={(open) => !open && setSelectedPO(null)}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Purchase Order Details</DialogTitle>
            <DialogDescription>
              {selectedPO?.poNumber || `PO #${selectedPO?.id}`}
            </DialogDescription>
          </DialogHeader>

          {selectedPO && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4 border-b pb-4">
                <div>
                  <p className="text-sm font-medium text-slate-500">Vendor</p>
                  <p className="text-base">{selectedPO.vendorName || selectedPO.vendor?.vendorName}</p>
                  <p className="text-sm text-slate-500">{selectedPO.vendor?.email}</p>
                  <p className="text-sm text-slate-500">{selectedPO.vendor?.phone}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-slate-500">Date</p>
                  <p className="text-base">{new Date(selectedPO.createdAt).toLocaleDateString()}</p>
                  <Badge className="mt-1">{selectedPO.status}</Badge>
                </div>
              </div>

              <div>
                <h4 className="font-medium mb-3 flex items-center gap-2">
                  <FileText className="size-4" />
                  Order Items
                </h4>
                <div className="border rounded-lg overflow-hidden">
                  <table className="w-full text-sm text-left">
                    <thead className="bg-slate-50">
                      <tr>
                        <th className="p-3 border-b">Item Description</th>
                        <th className="p-3 border-b">Qty</th>
                        <th className="p-3 border-b">Unit</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {selectedPO.pr?.items?.map((item: any) => (
                        <tr key={item.id}>
                          <td className="p-3">{item.itemDescription}</td>
                          <td className="p-3">{item.quantity}</td>
                          <td className="p-3">{item.unit}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="flex justify-end border-t pt-4">
                <div className="w-48 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-slate-600">Total Amount:</span>
                    <span className="font-medium">₹{selectedPO.totalAmount?.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">GST:</span>
                    <span className="font-medium">₹{selectedPO.gst?.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between border-t border-dashed pt-2">
                    <span className="font-bold">Grand Total:</span>
                    <span className="font-bold">₹{((selectedPO.totalAmount || 0) + (selectedPO.gst || 0)).toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
