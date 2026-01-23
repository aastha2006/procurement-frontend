import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { ShoppingCart, Search, Download, Eye } from 'lucide-react';
import { useState } from 'react';

export function PurchaseOrders() {
  const [searchTerm, setSearchTerm] = useState('');

  const purchaseOrders = [
    {
      id: 'PO-2024-089',
      prId: 'PR-2024-043',
      vendor: 'Aqua Solutions Pvt Ltd',
      item: 'STP Chemicals',
      amount: 17700,
      date: '22-Nov-2024',
      deliveryDate: '25-Nov-2024',
      status: 'In Transit',
      paymentStatus: 'Pending'
    },
    {
      id: 'PO-2024-088',
      prId: 'PR-2024-042',
      vendor: 'Electrical Solutions Inc',
      item: 'Electrical Supplies',
      amount: 12300,
      date: '21-Nov-2024',
      deliveryDate: '23-Nov-2024',
      status: 'Delivered',
      paymentStatus: 'Pending Invoice'
    },
    {
      id: 'PO-2024-087',
      prId: 'PR-2024-041',
      vendor: 'CleanPro Services',
      item: 'Housekeeping Materials',
      amount: 8500,
      date: '20-Nov-2024',
      deliveryDate: '22-Nov-2024',
      status: 'Delivered',
      paymentStatus: 'Paid'
    },
    {
      id: 'PO-2024-086',
      prId: 'PR-2024-040',
      vendor: 'PlumbFix Traders',
      item: 'Plumbing Fixtures',
      amount: 32000,
      date: '19-Nov-2024',
      deliveryDate: '21-Nov-2024',
      status: 'Delivered',
      paymentStatus: 'Payment Approved'
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'In Transit':
        return 'bg-blue-100 text-blue-700';
      case 'Delivered':
        return 'bg-green-100 text-green-700';
      case 'Pending':
        return 'bg-orange-100 text-orange-700';
      default:
        return 'bg-slate-100 text-slate-700';
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'Paid':
        return 'bg-green-100 text-green-700';
      case 'Payment Approved':
        return 'bg-blue-100 text-blue-700';
      case 'Pending Invoice':
        return 'bg-orange-100 text-orange-700';
      case 'Pending':
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
                Purchase Orders
              </CardTitle>
              <CardDescription>Track and manage all purchase orders</CardDescription>
            </div>
            <Button>
              Create Manual PO
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
              <Input
                placeholder="Search by PO ID, vendor, or item..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-4">
            {purchaseOrders.map((po) => (
              <div
                key={po.id}
                className="p-4 border border-slate-200 rounded-lg hover:border-slate-300 hover:shadow-sm transition-all"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-slate-900">{po.id}</h3>
                      <Badge variant="outline">{po.prId}</Badge>
                      <Badge className={getStatusColor(po.status)}>
                        {po.status}
                      </Badge>
                      <Badge className={getPaymentStatusColor(po.paymentStatus)}>
                        {po.paymentStatus}
                      </Badge>
                    </div>

                    <div className="mt-3 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      <div>
                        <p className="text-xs text-slate-500">Vendor</p>
                        <p className="text-sm text-slate-900 mt-1">{po.vendor}</p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-500">Item</p>
                        <p className="text-sm text-slate-900 mt-1">{po.item}</p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-500">Amount</p>
                        <p className="text-sm text-slate-900 mt-1">₹{po.amount.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-500">Delivery Date</p>
                        <p className="text-sm text-slate-900 mt-1">{po.deliveryDate}</p>
                      </div>
                    </div>

                    <div className="mt-3 text-xs text-slate-500">
                      PO Date: {po.date}
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    <Button variant="outline" size="sm">
                      <Eye className="size-4 mr-1" />
                      View
                    </Button>
                    <Button variant="outline" size="sm">
                      <Download className="size-4 mr-1" />
                      Download
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-slate-600">Active POs</p>
            <p className="text-slate-900 mt-1">12</p>
            <p className="text-xs text-slate-500 mt-1">₹4.2L total value</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-slate-600">Pending Delivery</p>
            <p className="text-slate-900 mt-1">5</p>
            <p className="text-xs text-slate-500 mt-1">₹1.8L value</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-slate-600">This Month</p>
            <p className="text-slate-900 mt-1">28 POs</p>
            <p className="text-xs text-slate-500 mt-1">₹9.6L total</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
