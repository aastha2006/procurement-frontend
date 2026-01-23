import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { ArrowLeft, Truck, Mail, Phone, Building2, FileText, AlertCircle, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';

interface PublicSupplierRegistrationProps {
  onClose: () => void;
  onSuccess: () => void;
}

export function PublicSupplierRegistration({ onClose, onSuccess }: PublicSupplierRegistrationProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      onSuccess();
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-indigo-50 to-blue-50 flex items-center justify-center p-4">
      <div className="w-full max-w-3xl">
        <div className="flex items-center justify-center gap-3 mb-6">
          <Button variant="ghost" size="sm" onClick={onClose} className="absolute left-4 top-4">
            <ArrowLeft className="size-4 mr-2" />
            Back to Login
          </Button>
        </div>

        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center p-4 bg-gradient-to-br from-purple-400 to-indigo-500 rounded-2xl mb-4 shadow-lg">
            <Truck className="size-12 text-white" />
          </div>
          <h1 className="text-slate-900 mb-2">Supplier Registration</h1>
          <p className="text-slate-600">Apply to become an approved supplier for our residential society</p>
        </div>

        <Card className="shadow-xl">
          <CardHeader>
            <CardTitle>Supplier Application Form</CardTitle>
            <CardDescription>
              Complete this form to apply as a supplier. Your application will be reviewed by our procurement team.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Company Information */}
              <div className="space-y-4">
                <h3 className="text-slate-900">Company Information</h3>
                
                <div className="space-y-2">
                  <Label htmlFor="companyName">
                    <Building2 className="size-4 inline mr-1" />
                    Company / Business Name
                  </Label>
                  <Input
                    id="companyName"
                    placeholder="Enter registered company name"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="category">Business Category</Label>
                    <Input
                      id="category"
                      placeholder="e.g., Plumbing Supplies, Electrical, STP"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="yearsInBusiness">Years in Business</Label>
                    <Input
                      id="yearsInBusiness"
                      type="number"
                      placeholder="e.g., 5"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address">Registered Business Address</Label>
                  <Textarea
                    id="address"
                    placeholder="Enter complete business address with city and pincode"
                    rows={2}
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="city">City</Label>
                    <Input
                      id="city"
                      placeholder="e.g., Mumbai"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="pincode">Pincode</Label>
                    <Input
                      id="pincode"
                      placeholder="e.g., 400001"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Contact Information */}
              <div className="space-y-4">
                <h3 className="text-slate-900">Primary Contact Information</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="contactPerson">Contact Person Name</Label>
                    <Input
                      id="contactPerson"
                      placeholder="Full name"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="designation">Designation</Label>
                    <Input
                      id="designation"
                      placeholder="e.g., Sales Manager, Owner"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">
                      <Mail className="size-4 inline mr-1" />
                      Business Email Address
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="contact@yourcompany.com"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">
                      <Phone className="size-4 inline mr-1" />
                      Business Phone Number
                    </Label>
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="+91 98765 43210"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="alternatePhone">Alternate Phone (Optional)</Label>
                    <Input
                      id="alternatePhone"
                      type="tel"
                      placeholder="+91 98765 43211"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="website">Website (Optional)</Label>
                    <Input
                      id="website"
                      type="url"
                      placeholder="https://www.yourcompany.com"
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
                      placeholder="29ABCDE1234F1Z5"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="pan">PAN Number</Label>
                    <Input
                      id="pan"
                      placeholder="ABCDE1234F"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="tanNumber">TAN Number (if applicable)</Label>
                    <Input
                      id="tanNumber"
                      placeholder="ABCD12345E"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="cinNumber">CIN / Registration Number</Label>
                    <Input
                      id="cinNumber"
                      placeholder="U12345MH2010PTC123456"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="msmeNumber">MSME Registration Number (if applicable)</Label>
                  <Input
                    id="msmeNumber"
                    placeholder="Enter MSME/Udyam registration number"
                  />
                </div>
              </div>

              {/* Banking Details */}
              <div className="space-y-4">
                <h3 className="text-slate-900">Banking Details</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="bankName">Bank Name</Label>
                    <Input
                      id="bankName"
                      placeholder="e.g., State Bank of India"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="branchName">Branch Name</Label>
                    <Input
                      id="branchName"
                      placeholder="e.g., Mumbai Main Branch"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="accountNumber">Account Number</Label>
                    <Input
                      id="accountNumber"
                      placeholder="Enter account number"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="ifsc">IFSC Code</Label>
                    <Input
                      id="ifsc"
                      placeholder="e.g., SBIN0001234"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="accountType">Account Type</Label>
                  <Input
                    id="accountType"
                    placeholder="Current / Savings"
                    required
                  />
                </div>
              </div>

              {/* Products & Services */}
              <div className="space-y-4">
                <h3 className="text-slate-900">Products & Services</h3>
                
                <div className="space-y-2">
                  <Label htmlFor="productsServices">Products / Services Offered</Label>
                  <Textarea
                    id="productsServices"
                    placeholder="Describe the products or services your company provides (e.g., STP chemicals, electrical supplies, plumbing materials, maintenance services, etc.)"
                    rows={4}
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="serviceArea">Service Area / Coverage</Label>
                    <Input
                      id="serviceArea"
                      placeholder="e.g., Mumbai, Navi Mumbai, Thane"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="deliveryTime">Average Delivery Time</Label>
                    <Input
                      id="deliveryTime"
                      placeholder="e.g., 3-5 days, Same day"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="minOrderValue">Minimum Order Value (if any)</Label>
                    <Input
                      id="minOrderValue"
                      placeholder="e.g., ₹5,000 or No minimum"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="paymentTerms">Preferred Payment Terms</Label>
                    <Input
                      id="paymentTerms"
                      placeholder="e.g., 30 days, 15 days"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* References */}
              <div className="space-y-4">
                <h3 className="text-slate-900">Business References</h3>
                
                <div className="space-y-2">
                  <Label htmlFor="references">Previous / Current Clients (Optional)</Label>
                  <Textarea
                    id="references"
                    placeholder="List any residential societies, companies, or organizations you currently serve or have served in the past..."
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="certifications">Certifications / Awards (Optional)</Label>
                  <Textarea
                    id="certifications"
                    placeholder="List any industry certifications, quality standards, or awards..."
                    rows={2}
                  />
                </div>
              </div>

              {/* Additional Information */}
              <div className="space-y-2">
                <Label htmlFor="additionalInfo">Additional Information (Optional)</Label>
                <Textarea
                  id="additionalInfo"
                  placeholder="Any other relevant information about your business..."
                  rows={3}
                />
              </div>

              {/* Document Requirements */}
              <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
                <p className="text-sm text-purple-900 mb-3">Documents Required (to be submitted after approval):</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  <div className="flex items-center gap-2 text-sm text-purple-700">
                    <CheckCircle2 className="size-4 flex-shrink-0" />
                    <span>GST Registration Certificate</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-purple-700">
                    <CheckCircle2 className="size-4 flex-shrink-0" />
                    <span>PAN Card Copy</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-purple-700">
                    <CheckCircle2 className="size-4 flex-shrink-0" />
                    <span>Cancelled Cheque / Bank Statement</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-purple-700">
                    <CheckCircle2 className="size-4 flex-shrink-0" />
                    <span>Company Registration Certificate</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-purple-700">
                    <CheckCircle2 className="size-4 flex-shrink-0" />
                    <span>Company Profile / Brochure</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-purple-700">
                    <CheckCircle2 className="size-4 flex-shrink-0" />
                    <span>Vendor Declaration Form</span>
                  </div>
                </div>
              </div>

              {/* Information Boxes */}
              <div className="space-y-3">
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="size-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm text-blue-900">Application Review Process</p>
                      <p className="text-xs text-blue-700 mt-1">
                        Your application will be reviewed by the Procurement Committee. We will conduct due diligence including background checks and reference verification.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="size-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm text-green-900">Vendor Portal Access</p>
                      <p className="text-xs text-green-700 mt-1">
                        Once approved, you will receive login credentials via email to access the vendor portal where you can submit quotations, view RFQs, and manage orders.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="size-5 text-orange-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm text-orange-900">Approval Timeline</p>
                      <p className="text-xs text-orange-700 mt-1">
                        Applications are typically reviewed within 5-7 business days. You will be notified via email about the status of your application.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Terms & Conditions */}
              <div className="flex items-start gap-2 p-3 bg-slate-50 border border-slate-200 rounded-lg">
                <input
                  type="checkbox"
                  id="terms"
                  className="mt-1"
                  required
                />
                <label htmlFor="terms" className="text-xs text-slate-600 cursor-pointer">
                  I hereby declare that all the information provided above is true and accurate to the best of my knowledge. I understand that providing false information may result in disqualification from the vendor approval process. I agree to comply with the society's procurement policies and vendor code of conduct.
                </label>
              </div>

              {/* Submit Actions */}
              <div className="flex gap-3 pt-4">
                <Button type="submit" disabled={isLoading} className="flex-1">
                  {isLoading ? 'Submitting Application...' : 'Submit Supplier Application'}
                </Button>
                <Button type="button" variant="outline" onClick={onClose}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        <div className="text-center mt-6">
          <p className="text-sm text-slate-600">
            Already registered?{' '}
            <button
              onClick={onClose}
              className="text-purple-600 hover:text-purple-700 underline"
            >
              Sign in here
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}