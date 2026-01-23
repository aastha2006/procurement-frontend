import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { BarChart3, Download, Calendar, TrendingUp, Package, Users, CreditCard } from 'lucide-react';

export function Reports() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="size-5 text-blue-600" />
                Monthly Procurement Report
              </CardTitle>
              <CardDescription>November 2024 - Summary for MC Review</CardDescription>
            </div>
            <div className="flex items-center gap-3">
              <Select defaultValue="november">
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="november">November 2024</SelectItem>
                  <SelectItem value="october">October 2024</SelectItem>
                  <SelectItem value="september">September 2024</SelectItem>
                </SelectContent>
              </Select>
              <Button>
                <Download className="size-4 mr-2" />
                Export PDF
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-100 rounded-lg">
                <Package className="size-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-slate-600">Total POs Raised</p>
                <p className="text-slate-900 mt-1">28</p>
                <p className="text-xs text-slate-500 mt-1">₹9.6L value</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-green-100 rounded-lg">
                <CreditCard className="size-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-slate-600">Payments Made</p>
                <p className="text-slate-900 mt-1">18</p>
                <p className="text-xs text-slate-500 mt-1">₹7.8L paid</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-orange-100 rounded-lg">
                <Calendar className="size-6 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-slate-600">Pending Payments</p>
                <p className="text-slate-900 mt-1">5</p>
                <p className="text-xs text-slate-500 mt-1">₹2.8L pending</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-purple-100 rounded-lg">
                <Users className="size-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-slate-600">New Vendors</p>
                <p className="text-slate-900 mt-1">3</p>
                <p className="text-xs text-slate-500 mt-1">This month</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Budget Utilization */}
      <Card>
        <CardHeader>
          <CardTitle>Budget Utilization - November 2024</CardTitle>
          <CardDescription>Spending across different budget heads</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div>
              <div className="flex items-center justify-between mb-2">
                <div>
                  <p className="text-sm text-slate-900">Maintenance</p>
                  <p className="text-xs text-slate-500">Regular upkeep and repairs</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-slate-900">₹3.2L / ₹5L</p>
                  <p className="text-xs text-slate-500">64% utilized</p>
                </div>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-3">
                <div className="bg-blue-600 h-3 rounded-full" style={{ width: '64%' }}></div>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <div>
                  <p className="text-sm text-slate-900">Corpus Fund</p>
                  <p className="text-xs text-slate-500">Long-term reserves</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-slate-900">₹1.8L / ₹3L</p>
                  <p className="text-xs text-slate-500">60% utilized</p>
                </div>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-3">
                <div className="bg-green-600 h-3 rounded-full" style={{ width: '60%' }}></div>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <div>
                  <p className="text-sm text-slate-900">Capital Expenditure</p>
                  <p className="text-xs text-slate-500">Major improvements and equipment</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-slate-900">₹4.5L / ₹10L</p>
                  <p className="text-xs text-slate-500">45% utilized</p>
                </div>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-3">
                <div className="bg-purple-600 h-3 rounded-full" style={{ width: '45%' }}></div>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <div>
                  <p className="text-sm text-slate-900">Miscellaneous</p>
                  <p className="text-xs text-slate-500">Other expenses</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-slate-900">₹0.8L / ₹1L</p>
                  <p className="text-xs text-slate-500">80% utilized</p>
                </div>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-3">
                <div className="bg-orange-600 h-3 rounded-full" style={{ width: '80%' }}></div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Top Vendors */}
      <Card>
        <CardHeader>
          <CardTitle>Top Vendors by Transaction Volume</CardTitle>
          <CardDescription>Most frequently engaged vendors this month</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              { name: 'Aqua Solutions Pvt Ltd', orders: 8, amount: 142000, category: 'STP & Water Treatment' },
              { name: 'Electrical Solutions Inc', orders: 6, amount: 98500, category: 'Electrical Supplies' },
              { name: 'CleanPro Services', orders: 5, amount: 76000, category: 'Housekeeping' },
              { name: 'PlumbFix Traders', orders: 4, amount: 125000, category: 'Plumbing' },
            ].map((vendor, index) => (
              <div key={index} className="flex items-center justify-between p-4 border border-slate-200 rounded-lg">
                <div className="flex items-center gap-4">
                  <div className="flex items-center justify-center w-8 h-8 bg-blue-100 rounded-full">
                    <span className="text-sm text-blue-700">#{index + 1}</span>
                  </div>
                  <div>
                    <p className="text-slate-900">{vendor.name}</p>
                    <p className="text-sm text-slate-600">{vendor.category}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-slate-900">₹{(vendor.amount / 1000).toFixed(1)}K</p>
                  <p className="text-sm text-slate-600">{vendor.orders} orders</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Category-wise Spending */}
      <Card>
        <CardHeader>
          <CardTitle>Category-wise Spending</CardTitle>
          <CardDescription>Breakdown by procurement category</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[
              { category: 'STP & Water Treatment', amount: 142000, percentage: 15 },
              { category: 'Electrical Supplies', amount: 98500, percentage: 10 },
              { category: 'Plumbing', amount: 125000, percentage: 13 },
              { category: 'Housekeeping', amount: 76000, percentage: 8 },
              { category: 'Security Systems', amount: 215000, percentage: 22 },
              { category: 'Garden & Landscaping', amount: 89000, percentage: 9 },
              { category: 'Civil Works', amount: 185000, percentage: 19 },
              { category: 'Others', amount: 29500, percentage: 4 },
            ].map((item, index) => (
              <div key={index} className="flex items-center gap-4">
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-sm text-slate-900">{item.category}</p>
                    <p className="text-sm text-slate-600">₹{(item.amount / 1000).toFixed(1)}K ({item.percentage}%)</p>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-2">
                    <div className="bg-gradient-to-r from-blue-600 to-purple-600 h-2 rounded-full" style={{ width: `${item.percentage * 4}%` }}></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="size-5 text-blue-600" />
            Insights & Recommendations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-sm text-green-900">
                ✓ All procurement processes followed proper 3-quote comparison this month
              </p>
            </div>
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-900">
                ℹ️ Average procurement cycle time: 7 days (within target)
              </p>
            </div>
            <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
              <p className="text-sm text-orange-900">
                ⚠️ Miscellaneous budget at 80% - consider reviewing allocations for next month
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
