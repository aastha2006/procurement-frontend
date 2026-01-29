import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Wallet, Search, CheckCircle2, Clock, AlertCircle, Loader2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { fetchInvoices, fetchPayments, recordPayment } from '../services/procurementService';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from './ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Label } from './ui/label';

interface PaymentTrackingProps {
  authToken?: string;
}

export function PaymentTracking({ authToken }: PaymentTrackingProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [invoices, setInvoices] = useState<any[]>([]);
  const [payments, setPayments] = useState<any[]>([]); // Completed payments
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    console.log("PAYMENT_TRACKING_VERSION: v3-Debug-Click"); // VERIFICATION LOG
    if (authToken) {
      loadData();
    }
  }, [authToken]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [invoiceData, paymentData] = await Promise.all([
        fetchInvoices(authToken!),
        fetchPayments(authToken!)
      ]);
      setInvoices(invoiceData);
      setPayments(paymentData);
    } catch (error: any) {
      console.error('Failed to load payment data', error);
      toast.error('Failed to load payment data');
    } finally {
      setLoading(false);
    }
  };

  const pendingInvoices = invoices.filter(inv => inv.status !== 'PAID');

  // Completed payments list (can come from 'payments' API or paid invoices)
  // Let's use the 'payments' API for detailed transaction info if available, 
  // falling back to Paid invoices if needed. 
  // For now, let's assuming payments API works and list that.

  const [selectedInvoice, setSelectedInvoice] = useState<any | null>(null);
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);
  const [paymentMode, setPaymentMode] = useState('BANK_TRANSFER');
  const [paymentReference, setPaymentReference] = useState('');
  const [processingPayment, setProcessingPayment] = useState(false);

  const [viewInvoice, setViewInvoice] = useState<any | null>(null);
  const [isViewInvoiceOpen, setIsViewInvoiceOpen] = useState(false);

  const handleApprovePayment = (invoice: any) => {
    setSelectedInvoice(invoice);
    setPaymentMode('BANK_TRANSFER');
    setPaymentReference('');
    setIsPaymentDialogOpen(true);
  };

  const handleConfirmPayment = async () => {
    if (!selectedInvoice || !authToken) {
      return;
    }

    setProcessingPayment(true);
    try {
      await recordPayment(
        authToken,
        selectedInvoice.id,
        selectedInvoice.amount, // Full payment for now
        paymentMode,
        paymentReference
      );
      toast.success('Payment Recorded Successfully');
      setIsPaymentDialogOpen(false);
      loadData(); // Refresh list
    } catch (error: any) {
      toast.error('Failed to record payment', { description: error.message });
    } finally {
      setProcessingPayment(false);
    }
  };

  const handleViewInvoice = (invoice: any) => {
    setViewInvoice(invoice);
    setIsViewInvoiceOpen(true);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wallet className="size-5 text-blue-600" />
            Payment Tracking
          </CardTitle>
          <CardDescription>Manage invoice approvals and payment releases</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="relative flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
              <Input
                placeholder="Search by invoice ID, vendor, or PO..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Button variant="outline" size="icon" onClick={loadData} disabled={loading}>
              <Loader2 className={`size-4 ${loading ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Pending Payments (Unpaid Invoices) */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="size-5 text-orange-600" />
            Pending Payments ({pendingInvoices.length})
          </CardTitle>
          <CardDescription>Invoices requiring approval or payment</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {loading ? (
              <div className="text-center py-6 text-slate-500">Loading pending payments...</div>
            ) : pendingInvoices.length === 0 ? (
              <div className="text-center py-6 text-slate-500">No pending payments found.</div>
            ) : (
              pendingInvoices.map((inv) => (
                <div
                  key={inv.id}
                  className="p-4 border-2 border-orange-200 bg-orange-50 rounded-lg"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-slate-900">{inv.invoiceNumber || `INV-${inv.id}`}</h3>
                        <Badge variant="outline">PO: {inv.po?.poNumber || inv.po?.id}</Badge>
                        <Badge className="bg-orange-100 text-orange-700">
                          {inv.status || 'Received'}
                        </Badge>
                      </div>

                      <div className="mt-3 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div>
                          <p className="text-xs text-slate-500">Vendor</p>
                          <p className="text-sm text-slate-900 mt-1">{inv.vendor?.vendorName || inv.vendorName}</p>
                        </div>
                        <div>
                          <p className="text-xs text-slate-500">Amount</p>
                          <p className="text-sm text-slate-900 mt-1">₹{inv.amount?.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-xs text-slate-500">Invoice Date</p>
                          <p className="text-sm text-slate-900 mt-1">{inv.invoiceDate ? new Date(inv.invoiceDate).toLocaleDateString() : 'N/A'}</p>
                        </div>
                        <div>
                          <p className="text-xs text-slate-500">GST</p>
                          <p className="text-sm text-slate-900 mt-1">₹{inv.gst?.toLocaleString()}</p>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col gap-2">
                      {inv.status === 'SUBMITTED' && (
                        <Button size="sm" onClick={() => handleApprovePayment(inv)}>
                          Approve Payment
                        </Button>
                      )}
                      <Button variant="outline" size="sm" onClick={() => handleViewInvoice(inv)}>
                        View Invoice
                      </Button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Completed Payments */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle2 className="size-5 text-green-600" />
            Completed Payments ({payments.length})
          </CardTitle>
          <CardDescription>Recently processed payments</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {loading ? (
              <div className="text-center py-6 text-slate-500">Loading history...</div>
            ) : payments.length === 0 ? (
              <div className="text-center py-6 text-slate-500">No payment history found.</div>
            ) : (
              payments.map((payment) => (
                <div
                  key={payment.id}
                  className="p-4 border border-slate-200 rounded-lg hover:border-slate-300 transition-all"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-slate-900">REF: {payment.reference || payment.id}</h3>
                        <Badge className="bg-green-100 text-green-700">
                          <CheckCircle2 className="size-3 mr-1" />
                          PAID
                        </Badge>
                      </div>

                      <div className="mt-3 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                        <div>
                          <p className="text-xs text-slate-500">For Invoice</p>
                          <p className="text-sm text-slate-900 mt-1">{payment.invoice?.invoiceNumber}</p>
                        </div>
                        <div>
                          <p className="text-xs text-slate-500">Amount</p>
                          <p className="text-sm text-slate-900 mt-1">₹{payment.amount?.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-xs text-slate-500">Paid Date</p>
                          <p className="text-sm text-slate-900 mt-1">{new Date(payment.paidOn).toLocaleDateString()}</p>
                        </div>
                        <div>
                          <p className="text-xs text-slate-500">Method</p>
                          <p className="text-sm text-slate-900 mt-1">{payment.paymentMode}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>


      {/* Payment Dialog */}
      <Dialog open={isPaymentDialogOpen} onOpenChange={setIsPaymentDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Approve Payment</DialogTitle>
            <DialogDescription>
              Record payment for Invoice {selectedInvoice?.invoiceNumber}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>Amount</Label>
              <Input disabled value={selectedInvoice?.amount || ''} />
            </div>
            <div className="grid gap-2">
              <Label>Payment Mode</Label>
              <Select value={paymentMode} onValueChange={setPaymentMode}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="BANK_TRANSFER">Bank Transfer</SelectItem>
                  <SelectItem value="CHEQUE">Cheque</SelectItem>
                  <SelectItem value="UPI">UPI</SelectItem>
                  <SelectItem value="CASH">Cash</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label>Reference / Transaction ID</Label>
              <Input
                value={paymentReference}
                onChange={(e) => setPaymentReference(e.target.value)}
                placeholder="e.g. UTR-12345678"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsPaymentDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleConfirmPayment} disabled={processingPayment}>
              {processingPayment && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Confirm Payment
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Invoice Dialog */}
      <Dialog open={isViewInvoiceOpen} onOpenChange={setIsViewInvoiceOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Invoice Details</DialogTitle>
            <DialogDescription>{viewInvoice?.invoiceNumber}</DialogDescription>
          </DialogHeader>

          {viewInvoice && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4 border p-4 rounded-md bg-slate-50">
                <div>
                  <Label className="text-slate-500">Vendor</Label>
                  <p className="font-medium">{viewInvoice.vendor?.vendorName || viewInvoice.vendorName}</p>
                  <p className="text-sm text-slate-500">{viewInvoice.vendor?.email}</p>
                </div>
                <div className="text-right">
                  <Label className="text-slate-500">Date</Label>
                  <p className="font-medium">{new Date(viewInvoice.invoiceDate).toLocaleDateString()}</p>
                </div>
              </div>

              <div className="border rounded-md p-4">
                <div className="flex justify-between items-center mb-2 border-b pb-2">
                  <span className="font-semibold">Description</span>
                  <span className="font-semibold">Amount</span>
                </div>
                <div className="flex justify-between items-center py-1">
                  <span>PO #{viewInvoice.po?.poNumber} Charges</span>
                  <span>₹{viewInvoice.amount?.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center py-1 text-slate-500 text-sm">
                  <span>GST Component (Included)</span>
                  <span>₹{viewInvoice.gst?.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center border-t pt-2 mt-2 font-bold text-lg">
                  <span>Total Payable</span>
                  <span>₹{viewInvoice.amount?.toLocaleString()}</span>
                </div>
              </div>

              {viewInvoice.status === 'PAID' && (
                <div className="bg-green-100 p-3 rounded-md text-green-800 text-center font-medium">
                  Paid Successfully
                </div>
              )}
            </div>
          )}

          <DialogFooter>
            <Button onClick={() => setIsViewInvoiceOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div >
  );
}
