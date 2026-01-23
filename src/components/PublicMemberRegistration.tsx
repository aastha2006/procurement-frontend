import { useState } from 'react';
import { api } from '../api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Badge } from './ui/badge';
import { ArrowLeft, UserPlus, Mail, Phone, Building2, Home, AlertCircle, Loader2 } from 'lucide-react';
import { toast } from 'sonner@2.0.3';

interface PublicMemberRegistrationProps {
  onClose: () => void;
  onSuccess: () => void;
}

export function PublicMemberRegistration({ onClose, onSuccess }: PublicMemberRegistrationProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    block: '',
    flatNumber: '',
    ownershipType: '',
    moveInDate: '',
    propertyOwnerName: '',
    propertyOwnerContact: '',
    reasonForRegistration: '',
    role: 'MEMBER',
    societyId: 1
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await api.post('/members/onboard', formData, {
        headers: {
          'accept': '*/*',
          'Content-Type': 'application/json'
        },
        skipAuth: true
      });

      if (response.ok) {
        toast.success('Application submitted successfully!', {
          description: 'Your registration is under review. You will receive an email notification once approved.'
        });
        onSuccess();
      } else {
        const errorText = await response.text();
        toast.error('Registration failed', {
          description: errorText || 'Please check your details and try again'
        });
      }
    } catch (error) {
      console.error('Registration error:', error);
      toast.error('Network error', {
        description: 'Unable to submit your application. Please check your internet connection.'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-blue-50 to-cyan-50 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <div className="flex items-center justify-center gap-3 mb-6">
          <Button variant="ghost" size="sm" onClick={onClose} className="absolute left-4 top-4">
            <ArrowLeft className="size-4 mr-2" />
            Back to Login
          </Button>
        </div>

        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center p-4 bg-gradient-to-br from-sky-400 to-blue-500 rounded-2xl mb-4 shadow-lg">
            <UserPlus className="size-12 text-white" />
          </div>
          <h1 className="text-slate-900 mb-2">Society Member Registration</h1>
          <p className="text-slate-600">Apply for access to the procurement system</p>
        </div>

        <Card className="shadow-xl">
          <CardHeader>
            <CardTitle>Member Registration Form</CardTitle>
            <CardDescription>
              Fill in your details to apply for system access. Your application will be reviewed by the society management.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Personal Information */}
              <div className="space-y-4">
                <h3 className="text-slate-900">Personal Information</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name</Label>
                    <Input
                      id="firstName"
                      placeholder="Enter first name"
                      value={formData.firstName}
                      onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input
                      id="lastName"
                      placeholder="Enter last name"
                      value={formData.lastName}
                      onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">
                      <Mail className="size-4 inline mr-1" />
                      Email Address
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="your.email@example.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
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
                      type="tel"
                      placeholder="+91 98765 43210"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Residence Details */}
              <div className="space-y-4">
                <h3 className="text-slate-900">Residence Details</h3>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="block">
                      <Building2 className="size-4 inline mr-1" />
                      Block / Tower
                    </Label>
                    <Select
                      required
                      value={formData.block}
                      onValueChange={(value) => setFormData({ ...formData, block: value })}
                    >
                      <SelectTrigger id="block">
                        <SelectValue placeholder="Select block" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="A">Block A</SelectItem>
                        <SelectItem value="B">Block B</SelectItem>
                        <SelectItem value="C">Block C</SelectItem>
                        <SelectItem value="D">Block D</SelectItem>
                        <SelectItem value="E">Block E</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="flatNo">
                      <Home className="size-4 inline mr-1" />
                      Flat Number
                    </Label>
                    <Input
                      id="flatNo"
                      placeholder="e.g., 101"
                      value={formData.flatNumber}
                      onChange={(e) => setFormData({ ...formData, flatNumber: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="ownershipType">Ownership Type</Label>
                    <Select
                      required
                      value={formData.ownershipType}
                      onValueChange={(value) => setFormData({ ...formData, ownershipType: value })}
                    >
                      <SelectTrigger id="ownershipType">
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="OWNER">Owner</SelectItem>
                        <SelectItem value="TENANT">Tenant</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* Move-in Date */}
              <div className="space-y-2">
                <Label htmlFor="moveInDate">Move-in Date (Approximate)</Label>
                <Input
                  id="moveInDate"
                  type="date"
                  value={formData.moveInDate}
                  onChange={(e) => setFormData({ ...formData, moveInDate: e.target.value })}
                  required
                />
              </div>

              {/* Verification */}
              <div className="space-y-4">
                <h3 className="text-slate-900">Verification</h3>

                <div className="space-y-2">
                  <Label htmlFor="ownerName">Property Owner Name (if tenant)</Label>
                  <Input
                    id="ownerName"
                    placeholder="Enter owner's name if you're a tenant"
                    value={formData.propertyOwnerName}
                    onChange={(e) => setFormData({ ...formData, propertyOwnerName: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="ownerContact">Property Owner Contact (if tenant)</Label>
                  <Input
                    id="ownerContact"
                    type="tel"
                    placeholder="Owner's phone number"
                    value={formData.propertyOwnerContact}
                    onChange={(e) => setFormData({ ...formData, propertyOwnerContact: e.target.value })}
                  />
                </div>
              </div>

              {/* Purpose */}
              <div className="space-y-2">
                <Label htmlFor="purpose">Reason for Registration</Label>
                <Select
                  required
                  value={formData.reasonForRegistration}
                  onValueChange={(value) => setFormData({ ...formData, reasonForRegistration: value })}
                >
                  <SelectTrigger id="purpose">
                    <SelectValue placeholder="Select reason" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Resident - General Access">Resident - General Access</SelectItem>
                    <SelectItem value="Interested in MC Participation">Interested in MC Participation</SelectItem>
                    <SelectItem value="File Complaints/Requests">File Complaints/Requests</SelectItem>
                    <SelectItem value="View Maintenance & Payments">View Maintenance & Payments</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Information Boxes */}
              <div className="space-y-3">
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="size-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm text-blue-900">Application Review Process</p>
                      <p className="text-xs text-blue-700 mt-1">
                        Your application will be reviewed by the Managing Committee. You will receive an email notification once approved with your login credentials.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="size-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm text-green-900">Verification Required</p>
                      <p className="text-xs text-green-700 mt-1">
                        The society management may contact you for identity and residence verification before approving your access.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Terms */}
              <div className="flex items-start gap-2 p-3 bg-slate-50 border border-slate-200 rounded-lg">
                <input
                  type="checkbox"
                  id="terms"
                  className="mt-1"
                  required
                />
                <label htmlFor="terms" className="text-xs text-slate-600 cursor-pointer">
                  I confirm that all the information provided is accurate and I understand that my application is subject to verification and approval by the society management.
                </label>
              </div>

              {/* Submit Actions */}
              <div className="flex gap-3 pt-4">
                <Button type="submit" disabled={isLoading} className="flex-1">
                  {isLoading && <Loader2 className="size-4 mr-2 animate-spin" />}
                  {isLoading ? 'Submitting Application...' : 'Submit Application'}
                </Button>
                <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        <div className="text-center mt-6">
          <p className="text-sm text-slate-600">
            Already have an account?{' '}
            <button
              onClick={onClose}
              className="text-blue-600 hover:text-blue-700 underline"
            >
              Sign in here
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
