import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import {
  FileText,
  Users,
  ShoppingCart,
  CreditCard,
  AlertCircle,
  TrendingUp,
  CheckCircle2,
  Clock,
  Loader2
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { api } from '../api';

interface DashboardProps {
  authToken?: string;
}

interface PurchaseRequisition {
  id: string;
  prNumber?: string;
  description?: string;
  itemDescription?: string;
  totalAmount?: number;
  estimatedAmount?: number;
  status?: string;
  createdAt?: string;
  submittedOn?: string;
  requiredDate?: string;
}

interface DashboardSummary {
  pendingRequisitions: number;
  pendingRequisitionsToday: number;
  activeVendors: number;
  onboardingVendors: number;
}

export function Dashboard({ authToken }: DashboardProps) {
  const [recentPRs, setRecentPRs] = useState<PurchaseRequisition[]>([]);
  const [isLoadingPRs, setIsLoadingPRs] = useState(false);
  const [dashboardSummary, setDashboardSummary] = useState<DashboardSummary>({
    pendingRequisitions: 0,
    pendingRequisitionsToday: 0,
    activeVendors: 0,
    onboardingVendors: 0
  });
  const [isLoadingSummary, setIsLoadingSummary] = useState(false);

  useEffect(() => {
    if (authToken) {
      fetchRecentPRs();
      fetchDashboardSummary();
    }
  }, [authToken]);

  const fetchDashboardSummary = async () => {
    setIsLoadingSummary(true);
    try {
      const response = await api.get('/dashboard/summary', {
        headers: {
          'accept': '*/*'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setDashboardSummary(data);
      } else {
        const errorText = await response.text();
        console.error('Failed to fetch dashboard summary:', errorText);
      }
    } catch (error) {
      console.error('Error fetching dashboard summary:', error);
    } finally {
      setIsLoadingSummary(false);
    }
  };

  const fetchRecentPRs = async () => {
    setIsLoadingPRs(true);
    try {
      const response = await api.get('/procurement/pr/recent?limit=4', {
        headers: {
          'accept': '*/*'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setRecentPRs(data);
      } else {
        const errorText = await response.text();
        console.error('Failed to fetch recent PRs:', errorText);
      }
    } catch (error) {
      console.error('Error fetching recent PRs:', error);
    } finally {
      setIsLoadingPRs(false);
    }
  };

  const pendingApprovals = [
    { type: 'Purchase Requisition', id: 'PR-2024-045', amount: '₹15,000', approver: 'Estate Manager' },
    { type: 'Quotation Comparison', id: 'QC-2024-023', amount: '₹28,500', approver: 'MC Committee' },
    { type: 'Payment Release', id: 'INV-2024-156', amount: '₹42,000', approver: 'Treasurer' },
  ];

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Pending Requisitions</p>
                {isLoadingSummary ? (
                  <Loader2 className="size-5 animate-spin text-blue-600 mt-1" />
                ) : (
                  <>
                    <p className="text-slate-900 mt-1">{dashboardSummary.pendingRequisitions}</p>
                    <p className="text-xs text-slate-500 mt-1">+{dashboardSummary.pendingRequisitionsToday} today</p>
                  </>
                )}
              </div>
              <div className="p-3 rounded-lg bg-orange-100">
                <FileText className="size-6 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Active Vendors</p>
                {isLoadingSummary ? (
                  <Loader2 className="size-5 animate-spin text-blue-600 mt-1" />
                ) : (
                  <>
                    <p className="text-slate-900 mt-1">{dashboardSummary.activeVendors}</p>
                    <p className="text-xs text-slate-500 mt-1">{dashboardSummary.onboardingVendors} onboarding</p>
                  </>
                )}
              </div>
              <div className="p-3 rounded-lg bg-blue-100">
                <Users className="size-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Open POs</p>
                <p className="text-slate-900 mt-1">12</p>
                <p className="text-xs text-slate-500 mt-1">₹4.2L value</p>
              </div>
              <div className="p-3 rounded-lg bg-purple-100">
                <ShoppingCart className="size-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Pending Payments</p>
                <p className="text-slate-900 mt-1">₹2.8L</p>
                <p className="text-xs text-slate-500 mt-1">5 invoices</p>
              </div>
              <div className="p-3 rounded-lg bg-green-100">
                <CreditCard className="size-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Purchase Requisitions */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Recent Purchase Requisitions</CardTitle>
            <CardDescription>Track the latest procurement requests</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {isLoadingPRs ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="size-8 animate-spin text-blue-600" />
                </div>
              ) : recentPRs.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <FileText className="size-12 text-slate-300 mb-3" />
                  <p className="text-slate-600">No purchase requisitions yet</p>
                  <p className="text-sm text-slate-500 mt-1">Create your first PR to get started</p>
                </div>
              ) : (
                recentPRs.map((pr) => {
                  const prId = pr.prNumber || pr.id;
                  const description = pr.description || pr.itemDescription || 'No description';
                  const amount = pr.totalAmount || pr.estimatedAmount || 0;
                  const date = pr.createdAt || pr.submittedOn || pr.requiredDate || '';
                  const status = pr.status || 'Pending';

                  // Format amount
                  const formattedAmount = new Intl.NumberFormat('en-IN', {
                    style: 'currency',
                    currency: 'INR',
                    maximumFractionDigits: 0
                  }).format(amount);

                  // Format date
                  const formattedDate = date ? new Date(date).toLocaleDateString('en-GB', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric'
                  }) : '';

                  return (
                    <div key={pr.id} className="flex items-center justify-between p-4 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="text-slate-900">{prId}</p>
                          <Badge variant={
                            status === 'COMPLETED' || status === 'Completed' ? 'default' :
                              status === 'APPROVED' || status === 'Approved' ? 'secondary' :
                                status === 'PO_ISSUED' || status === 'PO Issued' ? 'secondary' :
                                  'outline'
                          }>
                            {status}
                          </Badge>
                        </div>
                        <p className="text-sm text-slate-600 mt-1 line-clamp-2">{description}</p>
                      </div>
                      <div className="text-right ml-4">
                        <p className="text-slate-900">{formattedAmount}</p>
                        {formattedDate && <p className="text-xs text-slate-500 mt-1">{formattedDate}</p>}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </CardContent>
        </Card>

        {/* Pending Approvals */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="size-5 text-orange-600" />
              Pending Approvals
            </CardTitle>
            <CardDescription>Items requiring your attention</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {pendingApprovals.map((item, index) => (
                <div key={index} className="p-3 bg-orange-50 border border-orange-200 rounded-lg">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-slate-900 truncate">{item.type}</p>
                      <p className="text-xs text-slate-600 mt-1">{item.id}</p>
                    </div>
                    <Clock className="size-4 text-orange-600 flex-shrink-0 mt-1" />
                  </div>
                  <div className="flex items-center justify-between mt-2">
                    <p className="text-sm text-slate-900">{item.amount}</p>
                    <p className="text-xs text-slate-600">{item.approver}</p>
                  </div>
                  <Button size="sm" className="w-full mt-2">
                    Review
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Budget Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="size-5 text-blue-600" />
            Budget Overview - November 2024
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div>
              <p className="text-sm text-slate-600">Maintenance</p>
              <p className="text-slate-900 mt-1">₹3.2L / ₹5L</p>
              <div className="w-full bg-slate-200 rounded-full h-2 mt-2">
                <div className="bg-blue-600 h-2 rounded-full" style={{ width: '64%' }}></div>
              </div>
            </div>
            <div>
              <p className="text-sm text-slate-600">Corpus</p>
              <p className="text-slate-900 mt-1">₹1.8L / ₹3L</p>
              <div className="w-full bg-slate-200 rounded-full h-2 mt-2">
                <div className="bg-green-600 h-2 rounded-full" style={{ width: '60%' }}></div>
              </div>
            </div>
            <div>
              <p className="text-sm text-slate-600">Capex</p>
              <p className="text-slate-900 mt-1">₹4.5L / ₹10L</p>
              <div className="w-full bg-slate-200 rounded-full h-2 mt-2">
                <div className="bg-purple-600 h-2 rounded-full" style={{ width: '45%' }}></div>
              </div>
            </div>
            <div>
              <p className="text-sm text-slate-600">Miscellaneous</p>
              <p className="text-slate-900 mt-1">₹0.8L / ₹1L</p>
              <div className="w-full bg-slate-200 rounded-full h-2 mt-2">
                <div className="bg-orange-600 h-2 rounded-full" style={{ width: '80%' }}></div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}