import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Wallet, Search, CheckCircle2, Clock, AlertCircle } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

export function PaymentTracking() {
  const [searchTerm, setSearchTerm] = useState('');

  const pendingPayments = [
    {
      id: 'INV-2024-156',
      poId: 'PO-2024-089',
      vendor: 'Aqua Solutions Pvt Ltd',
      amount: 17700,
      invoiceDate: '23-Nov-2024',
      dueDate: '23-Dec-2024',
      status: 'Pending Approval',
      approver: 'Treasurer'
    },
    {
      id: 'INV-2024-155',
      poId: 'PO-2024-088',
      vendor: 'Electrical Solutions Inc',
      amount: 12300,
      invoiceDate: '22-Nov-2024',
      dueDate: '22-Dec-2024',
      status: 'Approved - Pending Payment',
      approver: 'Treasurer + Secretary'
    },
  ];

  const completedPayments = [
    {
      id: 'INV-2024-154',
      poId: 'PO-2024-087',
      vendor: 'CleanPro Services',
      amount: 8500,
      invoiceDate: '21-Nov-2024',
      paidDate: '24-Nov-2024',
      paymentMethod: 'NEFT',
      transactionId: 'TXN123456789',
      status: 'Paid'
    },
    {
      id: 'INV-2024-153',
      poId: 'PO-2024-086',
      vendor: 'PlumbFix Traders',
      amount: 32000,
      invoiceDate: '20-Nov-2024',
      paidDate: '23-Nov-2024',
      paymentMethod: 'RTGS',
      transactionId: 'TXN987654321',
      status: 'Paid'
    },
  ];

  const handleApprovePayment = (invoiceId: string) => {
    toast.success('Payment approved!', {
      description: `${invoiceId} has been approved and queued for payment.`
    });
  };

  const handleReleasePayment = (invoiceId: string) => {
    toast.success('Payment released!', {
      description: `Payment for ${invoiceId} has been processed successfully.`
    });
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
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
            <Input
              placeholder="Search by invoice ID, vendor, or PO..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Pending Payments */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="size-5 text-orange-600" />
            Pending Payments ({pendingPayments.length})
          </CardTitle>
          <CardDescription>Invoices requiring approval or payment</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {pendingPayments.map((payment) => (
              <div
                key={payment.id}
                className="p-4 border-2 border-orange-200 bg-orange-50 rounded-lg"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-slate-900">{payment.id}</h3>
                      <Badge variant="outline">{payment.poId}</Badge>
                      <Badge className="bg-orange-100 text-orange-700">
                        {payment.status}
                      </Badge>
                    </div>

                    <div className="mt-3 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      <div>
                        <p className="text-xs text-slate-500">Vendor</p>
                        <p className="text-sm text-slate-900 mt-1">{payment.vendor}</p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-500">Amount</p>
                        <p className="text-sm text-slate-900 mt-1">₹{payment.amount.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-500">Invoice Date</p>
                        <p className="text-sm text-slate-900 mt-1">{payment.invoiceDate}</p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-500">Due Date</p>
                        <p className="text-sm text-slate-900 mt-1">{payment.dueDate}</p>
                      </div>
                    </div>

                    <div className="mt-3 flex items-center gap-2">
                      <AlertCircle className="size-4 text-orange-600" />
                      <p className="text-xs text-slate-600">
                        Requires approval from: {payment.approver}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    {payment.status === 'Pending Approval' && (
                      <Button size="sm" onClick={() => handleApprovePayment(payment.id)}>
                        Approve Payment
                      </Button>
                    )}
                    {payment.status === 'Approved - Pending Payment' && (
                      <Button size="sm" onClick={() => handleReleasePayment(payment.id)}>
                        Release Payment
                      </Button>
                    )}
                    <Button variant="outline" size="sm">
                      View Invoice
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Completed Payments */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle2 className="size-5 text-green-600" />
            Completed Payments ({completedPayments.length})
          </CardTitle>
          <CardDescription>Recently processed payments</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {completedPayments.map((payment) => (
              <div
                key={payment.id}
                className="p-4 border border-slate-200 rounded-lg hover:border-slate-300 transition-all"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-slate-900">{payment.id}</h3>
                      <Badge variant="outline">{payment.poId}</Badge>
                      <Badge className="bg-green-100 text-green-700">
                        <CheckCircle2 className="size-3 mr-1" />
                        {payment.status}
                      </Badge>
                    </div>

                    <div className="mt-3 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                      <div>
                        <p className="text-xs text-slate-500">Vendor</p>
                        <p className="text-sm text-slate-900 mt-1">{payment.vendor}</p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-500">Amount</p>
                        <p className="text-sm text-slate-900 mt-1">₹{payment.amount.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-500">Paid Date</p>
                        <p className="text-sm text-slate-900 mt-1">{payment.paidDate}</p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-500">Method</p>
                        <p className="text-sm text-slate-900 mt-1">{payment.paymentMethod}</p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-500">Transaction ID</p>
                        <p className="text-sm text-slate-900 mt-1">{payment.transactionId}</p>
                      </div>
                    </div>
                  </div>

                  <Button variant="outline" size="sm">
                    View Details
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-slate-600">Pending Approval</p>
            <p className="text-slate-900 mt-1">₹1.2L</p>
            <p className="text-xs text-slate-500 mt-1">3 invoices</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-slate-600">Approved - Pending</p>
            <p className="text-slate-900 mt-1">₹1.6L</p>
            <p className="text-xs text-slate-500 mt-1">2 invoices</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-slate-600">Paid This Month</p>
            <p className="text-slate-900 mt-1">₹7.8L</p>
            <p className="text-xs text-slate-500 mt-1">18 payments</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-slate-600">Total Outstanding</p>
            <p className="text-slate-900 mt-1">₹2.8L</p>
            <p className="text-xs text-slate-500 mt-1">5 invoices</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
