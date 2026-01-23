import { useState } from 'react';
import { api } from '../api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Badge } from './ui/badge';
import { ArrowLeft, UserPlus, Truck, CheckCircle2, Mail, Phone, Building2, FileText, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface SupplierOnboardingProps {
  onClose: () => void;
  authToken: string;
}

export function SupplierOnboarding({ onClose, authToken }: SupplierOnboardingProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [recentSuppliers, setRecentSuppliers] = useState([
    {
      id: 1,
      name: 'Aqua Solutions Pvt Ltd',
      email: 'contact@aquasolutions.com',
      phone: '+91 98765 43210',
      category: 'STP & Water Treatment',
      status: 'Active'
    },
    {
      id: 2,
      name: 'CleanPro Services',
      email: 'sales@cleanpro.com',
      phone: '+91 98765 43211',
      category: 'Housekeeping Supplies',
      status: 'Active'
    },
    {
      id: 3,
      name: 'Electrical Solutions Inc',
      email: 'info@electricalsolutions.com',
      phone: '+91 98765 43212',
      category: 'Electrical Supplies',
      status: 'Pending Approval'
    },
  ]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);

    const vendorData = {
      name: formData.get('name') as string,
      fullName: formData.get('fullName') as string,
      companyName: formData.get('companyName') as string,
      gst: formData.get('gst') as string,
      pan: formData.get('pan') as string,
      bankAccount: formData.get('bankAccount') as string,
      bankIfsc: formData.get('bankIfsc') as string,
      contactPerson: formData.get('contactPerson') as string,
      phone: formData.get('phone') as string,
      email: formData.get('email') as string,
      address: formData.get('address') as string
    };

    try {
      const response = await api.post('/vendors', vendorData, {
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        toast.success('Supplier onboarded successfully!', {
          description: 'Login credentials have been sent to the supplier\'s email for portal access.'
        });

        // Reset form
        e.currentTarget.reset();
      } else {
        const errorText = await response.text();
        toast.error('Failed to onboard supplier', {
          description: errorText || 'Please check the form and try again'
        });
      }
    } catch (error) {
      console.error('Error onboarding supplier:', error);
      toast.error('Error onboarding supplier', {
        description: 'Network error. Please check your connection.'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-blue-50 to-cyan-50">
      <header className="bg-white border-b border-sky-200 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={onClose}>
              <ArrowLeft className="size-4 mr-2" />
              Back
            </Button>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-purple-400 to-indigo-500 rounded-lg shadow-md">
                <Truck className="size-6 text-white" />
              </div>
              <div>
                <h1 className="text-slate-900">Supplier Onboarding</h1>
                <p className="text-slate-600 text-sm">Add new suppliers/vendors to the approved list</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 max-w-6xl">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Onboarding Form */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Add New Supplier</CardTitle>
                <CardDescription>
                  Complete vendor KYC and onboarding process
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Basic Information */}
                  <div className="space-y-4">
                    <h3 className="text-slate-900">Basic Information</h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">
                          <Building2 className="size-4 inline mr-1" />
                          Vendor Name
                        </Label>
                        <Input
                          id="name"
                          name="name"
                          placeholder="e.g., ABC Traders"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="fullName">Full Name</Label>
                        <Input
                          id="fullName"
                          name="fullName"
                          placeholder="e.g., ABC Trading and Suppliers Pvt Ltd"
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="companyName">
                        <Building2 className="size-4 inline mr-1" />
                        Company Name
                      </Label>
                      <Input
                        id="companyName"
                        name="companyName"
                        placeholder="e.g., ABC Traders Pvt Ltd"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="address">Registered Address</Label>
                      <Textarea
                        id="address"
                        name="address"
                        placeholder="Enter complete business address"
                        rows={2}
                        required
                      />
                    </div>
                  </div>

                  {/* Contact Information */}
                  <div className="space-y-4">
                    <h3 className="text-slate-900">Contact Information</h3>

                    <div className="space-y-2">
                      <Label htmlFor="contactPerson">Contact Person Name</Label>
                      <Input
                        id="contactPerson"
                        name="contactPerson"
                        placeholder="e.g., Rahul Sharma"
                        required
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="email">
                          <Mail className="size-4 inline mr-1" />
                          Email Address
                        </Label>
                        <Input
                          id="email"
                          name="email"
                          type="email"
                          placeholder="contact@abctraders.com"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="phone">
                          <Phone className="size-4 inline mr-1" />
                          Phone Number
                        </Label>
                        <Input
                          id="phone"
                          name="phone"
                          type="tel"
                          placeholder="9876543210"
                          required
                        />
                      </div>
                    </div>
                  </div>

                  {/* Legal & Tax Information */}
                  <div className="space-y-4">
                    <h3 className="text-slate-900">Legal & Tax Information</h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="gst">
                          <FileText className="size-4 inline mr-1" />
                          GST Number
                        </Label>
                        <Input
                          id="gst"
                          name="gst"
                          placeholder="27ABCDE1234F1Z5"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="pan">PAN Number</Label>
                        <Input
                          id="pan"
                          name="pan"
                          placeholder="ABCDE1234F"
                          required
                        />
                      </div>
                    </div>
                  </div>

                  {/* Banking Details */}
                  <div className="space-y-4">
                    <h3 className="text-slate-900">Banking Details</h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="bankAccount">Bank Account Number</Label>
                        <Input
                          id="bankAccount"
                          name="bankAccount"
                          placeholder="123456789012"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="bankIfsc">IFSC Code</Label>
                        <Input
                          id="bankIfsc"
                          name="bankIfsc"
                          placeholder="HDFC0001234"
                          required
                        />
                      </div>
                    </div>
                  </div>

                  {/* Document Checklist */}
                  <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
                    <p className="text-sm text-purple-900 mb-3">Required Documents:</p>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm text-purple-700">
                        <CheckCircle2 className="size-4" />
                        <span>GST Registration Certificate</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-purple-700">
                        <CheckCircle2 className="size-4" />
                        <span>PAN Card Copy</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-purple-700">
                        <CheckCircle2 className="size-4" />
                        <span>Cancelled Cheque / Bank Statement</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-purple-700">
                        <CheckCircle2 className="size-4" />
                        <span>Vendor Declaration (No Conflict of Interest)</span>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-start gap-2">
                      <CheckCircle2 className="size-5 text-blue-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm text-blue-900">Portal Access</p>
                        <p className="text-xs text-blue-700 mt-1">
                          Login credentials will be sent to the supplier's email for accessing the vendor portal.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-3 pt-4">
                    <Button type="submit" disabled={isLoading} className="flex-1 md:flex-initial">
                      {isLoading ? (
                        <>
                          <Loader2 className="size-4 mr-2 animate-spin" />
                          Submitting...
                        </>
                      ) : (
                        'Submit for Approval'
                      )}
                    </Button>
                    <Button type="button" variant="outline" onClick={onClose}>
                      Cancel
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Recent Suppliers List */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Truck className="size-5 text-purple-600" />
                  Recent Suppliers
                </CardTitle>
                <CardDescription>Recently onboarded suppliers</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {recentSuppliers.map((supplier) => (
                    <div
                      key={supplier.id}
                      className="p-3 border border-slate-200 rounded-lg hover:border-slate-300 transition-colors"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-slate-900 truncate">{supplier.name}</p>
                          <p className="text-xs text-slate-600 mt-1 truncate">{supplier.email}</p>
                          <div className="mt-2">
                            <Badge variant="outline" className="text-xs">
                              {supplier.category}
                            </Badge>
                          </div>
                        </div>
                        <Badge
                          className={
                            supplier.status === 'Active'
                              ? 'bg-green-100 text-green-700 text-xs'
                              : 'bg-orange-100 text-orange-700 text-xs'
                          }
                        >
                          {supplier.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-4 pt-4 border-t border-slate-200">
                  <p className="text-xs text-center text-slate-500">
                    Total Active Suppliers: {recentSuppliers.filter(s => s.status === 'Active').length}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}