import { useState } from 'react';
import { api } from '../api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { ClipboardList, Building2, Truck, AlertCircle, UserPlus, Mail, Lock, Loader2, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '../context/AuthContext';

interface LoginProps {
  onRegisterMember?: () => void;
  onRegisterSupplier?: () => void;
}

export function Login({ onRegisterMember, onRegisterSupplier }: LoginProps) {
  const { login } = useAuth();
  const [loginType, setLoginType] = useState<'Society' | 'Supplier'>('Society');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [showResetPassword, setShowResetPassword] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isForgotLoading, setIsForgotLoading] = useState(false);
  const [isResetLoading, setIsResetLoading] = useState(false);
  const [showSupplierOnboarding, setShowSupplierOnboarding] = useState(false);
  const [isSubmittingSupplier, setIsSubmittingSupplier] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Encode email and password for URL parameters
      const encodedEmail = encodeURIComponent(email);
      const encodedPassword = encodeURIComponent(password);
      const encodedLoginType = encodeURIComponent(loginType);

      const response = await api.post(
        `/auth/login?nmLogin=${encodedEmail}&pwd=${encodedPassword}&loginType=${encodedLoginType}`,
        undefined,
        {
          headers: {
            'accept': '*/*',
          },
          skipAuth: true
        }
      );

      if (!response.ok) {
        throw new Error('Login failed');
      }

      const data = await response.json();

      if (data.accesstoken && data.refreshtoken) {
        // Decode JWT to get user info
        const tokenPayload = JSON.parse(atob(data.accesstoken.split('.')[1]));

        // Debug: Log token payload to verify vendor ID claim
        console.log('Token Payload:', tokenPayload);

        // Parse permissions from roles array in token
        // Roles format: ["PURCHASE_REQUISITION:VIEW", "QUOTATIONS:CREATE", "ROLE_Admin", ...]
        const permissions = parsePermissionsFromRoles(tokenPayload.roles || []);
        console.log('Parsed Permissions:', permissions);

        const authData = {
          userId: tokenPayload.id || 0, // Extract numeric user ID from token (e.g., id: 2)
          email: tokenPayload.email || email,
          roles: tokenPayload.roles || [],
          group: tokenPayload.group || 0,
          groupName: tokenPayload.groupName || '',
          loginType: tokenPayload.loginType || loginType,
          vendorId: tokenPayload.id || null, // Extract vendor ID from token claims (e.g., id: 3)
          accessToken: data.accesstoken,
          refreshToken: data.refreshtoken,
          permissions: permissions, // Add parsed permissions to authData
        };

        console.log('Auth Data (with vendorId and permissions):', authData);

        toast.success('Login successful!', {
          description: data.message || 'Welcome to Procurement Management System'
        });

        login(authData);
      } else {
        throw new Error('Invalid response from server');
      }
    } catch (error) {
      console.error('Login error:', error);
      toast.error('Login failed', {
        description: 'Please check your credentials and try again.'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsForgotLoading(true);

    try {
      const encodedEmail = encodeURIComponent(forgotEmail);

      const response = await api.post(
        `/auth/forgot-password?email=${encodedEmail}`,
        undefined,
        {
          headers: {
            'accept': '*/*',
          },
          skipAuth: true
        }
      );

      if (response.ok) {
        const data = await response.text(); // Token is returned as text
        setResetToken(data);
        setShowForgotPassword(false);
        setShowResetPassword(true);
        toast.success('Password reset initiated!', {
          description: 'Please enter your new password to complete the reset.'
        });
      } else {
        toast.error('Failed to process request', {
          description: 'Please check your email address and try again.'
        });
      }
    } catch (error) {
      console.error('Forgot password error:', error);
      toast.error('Error processing request', {
        description: 'Network error. Please try again later.'
      });
    } finally {
      setIsForgotLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match', {
        description: 'Please ensure both passwords are identical.'
      });
      return;
    }

    if (newPassword.length < 6) {
      toast.error('Password too short', {
        description: 'Password must be at least 6 characters long.'
      });
      return;
    }

    setIsResetLoading(true);

    try {
      const encodedToken = encodeURIComponent(resetToken);
      const encodedPassword = encodeURIComponent(newPassword);

      const response = await api.post(
        `/common/resetpassword?token=${encodedToken}&newPassword=${encodedPassword}`,
        undefined,
        {
          headers: {
            'accept': '*/*',
          },
          skipAuth: true
        }
      );

      if (response.ok) {
        setShowResetPassword(false);
        setResetToken('');
        setNewPassword('');
        setConfirmPassword('');
        setForgotEmail('');
        toast.success('Password reset successful!', {
          description: 'You can now login with your new password.'
        });
      } else {
        const errorText = await response.text();
        toast.error('Failed to reset password', {
          description: errorText || 'Invalid or expired token. Please try again.'
        });
      }
    } catch (error) {
      console.error('Reset password error:', error);
      toast.error('Error resetting password', {
        description: 'Network error. Please try again later.'
      });
    } finally {
      setIsResetLoading(false);
    }
  };

  const handleSupplierOnboarding = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setIsSubmittingSupplier(true);
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
        },
        skipAuth: true
      });

      if (response.ok) {
        const data = await response.json();
        toast.success('Supplier registered successfully!', {
          description: `${vendorData.name} has been submitted for approval. You will receive login credentials once approved.`
        });

        // Close dialog
        setShowSupplierOnboarding(false);

        // Reset form
        (e.target as HTMLFormElement).reset();
      } else {
        const errorText = await response.text();
        toast.error('Failed to register supplier', {
          description: errorText || 'Please check the form and try again'
        });
      }
    } catch (error) {
      console.error('Error registering supplier:', error);
      toast.error('Error registering supplier', {
        description: 'Network error. Please check your connection.'
      });
    } finally {
      setIsSubmittingSupplier(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-blue-50 to-cyan-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center p-4 bg-gradient-to-br from-sky-400 to-blue-500 rounded-2xl mb-4 shadow-lg">
            <ClipboardList className="size-12 text-white" />
          </div>
          <h1 className="text-slate-900 mb-2">Procurement Management</h1>
          <p className="text-slate-600">650-Flat Residential Society</p>
        </div>

        <Card className="shadow-xl">
          <CardHeader>
            <CardTitle>Welcome Back</CardTitle>
            <CardDescription>Sign in to access the procurement system</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={loginType} onValueChange={(value) => setLoginType(value as 'Society' | 'Supplier')}>
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="Society" className="flex items-center gap-2">
                  <Building2 className="size-4" />
                  Society
                </TabsTrigger>
                <TabsTrigger value="Supplier" className="flex items-center gap-2">
                  <Truck className="size-4" />
                  Supplier
                </TabsTrigger>
              </TabsList>

              <TabsContent value="Society">
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="society-email">Email Address</Label>
                    <Input
                      id="society-email"
                      type="email"
                      placeholder="your.email@society.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      disabled={isLoading}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="society-password">Password</Label>
                    <Input
                      id="society-password"
                      type="password"
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      disabled={isLoading}
                    />
                  </div>

                  <div className="flex items-center justify-end">
                    <button
                      type="button"
                      onClick={() => {
                        setForgotEmail('');
                        setShowForgotPassword(true);
                      }}
                      className="text-sm text-blue-600 hover:text-blue-700 underline"
                    >
                      Forgot Password?
                    </button>
                  </div>

                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg flex items-start gap-2">
                    <AlertCircle className="size-4 text-blue-600 flex-shrink-0 mt-0.5" />
                    <p className="text-xs text-blue-900">
                      Society members can access procurement, vendor management, and approval workflows.
                    </p>
                  </div>

                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? 'Signing in...' : 'Sign In as Society Member'}
                  </Button>

                  {/* New Member Registration Option */}
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t border-slate-200" />
                    </div>
                    <div className="relative flex justify-center text-xs">
                      <span className="bg-white px-2 text-slate-500">New to the society?</span>
                    </div>
                  </div>

                  {onRegisterMember && (
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full"
                      onClick={onRegisterMember}
                    >
                      <UserPlus className="size-4 mr-2" />
                      Register as Society Member
                    </Button>
                  )}
                </form>
              </TabsContent>

              <TabsContent value="Supplier">
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="supplier-email">Email Address</Label>
                    <Input
                      id="supplier-email"
                      type="email"
                      placeholder="your.email@supplier.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      disabled={isLoading}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="supplier-password">Password</Label>
                    <Input
                      id="supplier-password"
                      type="password"
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      disabled={isLoading}
                    />
                  </div>

                  <div className="p-3 bg-purple-50 border border-purple-200 rounded-lg flex items-start gap-2">
                    <AlertCircle className="size-4 text-purple-600 flex-shrink-0 mt-0.5" />
                    <p className="text-xs text-purple-900">
                      Suppliers can submit quotations, view purchase orders, and manage invoices.
                    </p>
                  </div>

                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? 'Signing in...' : 'Sign In as Supplier'}
                  </Button>

                  {/* Supplier Registration Option */}
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t border-slate-200" />
                    </div>
                    <div className="relative flex justify-center text-xs">
                      <span className="bg-white px-2 text-slate-500">New supplier?</span>
                    </div>
                  </div>

                  <Dialog open={showSupplierOnboarding} onOpenChange={setShowSupplierOnboarding}>
                    <DialogTrigger asChild>
                      <Button
                        type="button"
                        variant="outline"
                        className="w-full"
                      >
                        <UserPlus className="size-4 mr-2" />
                        Register as New Supplier
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle>Onboard as Supplier</DialogTitle>
                        <DialogDescription>
                          Fill in your details to register as a supplier. You will receive login credentials once approved.
                        </DialogDescription>
                      </DialogHeader>
                      <form onSubmit={handleSupplierOnboarding} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="name">Vendor Name</Label>
                            <Input id="name" name="name" placeholder="e.g., Ace Traders" required />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="fullName">Full Name</Label>
                            <Input id="fullName" name="fullName" placeholder="e.g., Rajesh Kumar" required />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="companyName">Company Name</Label>
                          <Input id="companyName" name="companyName" placeholder="e.g., Ace Trading Pvt Ltd" required />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="gst">GST Number</Label>
                            <Input id="gst" name="gst" placeholder="27ABCDE1234F1Z5" required />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="pan">PAN Number</Label>
                            <Input id="pan" name="pan" placeholder="ABCDE1234F" required />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="bankAccount">Bank Account Number</Label>
                            <Input id="bankAccount" name="bankAccount" placeholder="123456789012" required />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="bankIfsc">IFSC Code</Label>
                            <Input id="bankIfsc" name="bankIfsc" placeholder="HDFC0001234" required />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="contactPerson">Contact Person</Label>
                          <Input id="contactPerson" name="contactPerson" placeholder="e.g., Rajesh Kumar" required />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="phone">Contact Phone</Label>
                            <Input id="phone" name="phone" type="tel" placeholder="+91 9876543210" required />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="supplierEmail">Email Address</Label>
                            <Input id="supplierEmail" name="email" type="email" placeholder="rajesh@acetraders.com" required />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="address">Registered Address</Label>
                          <Input id="address" name="address" placeholder="Plot 22, Industrial Area, Mumbai" required />
                        </div>

                        <div className="space-y-2">
                          <Label>Documents Required</Label>
                          <div className="grid grid-cols-1 gap-2">
                            <div className="flex items-center gap-2 text-sm text-slate-600">
                              <CheckCircle2 className="size-4" />
                              <span>GST Registration Certificate</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-slate-600">
                              <CheckCircle2 className="size-4" />
                              <span>PAN Card Copy</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-slate-600">
                              <CheckCircle2 className="size-4" />
                              <span>Cancelled Cheque / Bank Statement</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-slate-600">
                              <CheckCircle2 className="size-4" />
                              <span>Vendor Declaration (No Conflict of Interest)</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex gap-3 pt-4">
                          <Button type="submit" className="flex-1" disabled={isSubmittingSupplier}>
                            {isSubmittingSupplier ? (
                              <>
                                <Loader2 className="size-4 mr-2 animate-spin" />
                                Submitting...
                              </>
                            ) : (
                              'Submit for Approval'
                            )}
                          </Button>
                        </div>
                      </form>
                    </DialogContent>
                  </Dialog>

                  <div className="p-3 bg-purple-50 border border-purple-200 rounded-lg">
                    <p className="text-xs text-purple-900 text-center">
                      Register to become an approved supplier and start receiving RFQs from the society.
                    </p>
                  </div>
                </form>
              </TabsContent>
            </Tabs>

            <div className="mt-6 pt-6 border-t border-slate-200">
              <p className="text-xs text-center text-slate-500">
                Demo Credentials: Aastha@yopmail.com / kKN+%56O
              </p>
            </div>
          </CardContent>
        </Card>

        <p className="text-center text-sm text-slate-500 mt-6">
          Secure authentication powered by JWT
        </p>
      </div>

      {/* Forgot Password Dialog */}
      <Dialog open={showForgotPassword} onOpenChange={setShowForgotPassword}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Mail className="size-5 text-blue-600" />
              Forgot Password
            </DialogTitle>
            <DialogDescription>
              Enter your email address and we'll send you a password reset link.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleForgotPassword} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="forgot-email">Email Address</Label>
              <Input
                id="forgot-email"
                type="email"
                placeholder="your.email@example.com"
                value={forgotEmail}
                onChange={(e) => setForgotEmail(e.target.value)}
                required
                disabled={isForgotLoading}
              />
            </div>

            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-start gap-2">
                <AlertCircle className="size-4 text-blue-600 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-blue-900">
                  A password reset link will be sent to your email address. Please check your inbox.
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <Button type="submit" disabled={isForgotLoading} className="flex-1">
                {isForgotLoading ? 'Processing...' : 'Send Reset Link'}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowForgotPassword(false)}
                disabled={isForgotLoading}
              >
                Cancel
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Reset Password Dialog */}
      <Dialog open={showResetPassword} onOpenChange={setShowResetPassword}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Lock className="size-5 text-green-600" />
              Reset Password
            </DialogTitle>
            <DialogDescription>
              Enter your new password to complete the reset process.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleResetPassword} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="new-password">New Password</Label>
              <Input
                id="new-password"
                type="password"
                placeholder="Enter new password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                disabled={isResetLoading}
                minLength={6}
              />
              <p className="text-xs text-slate-500">Password must be at least 6 characters long</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirm-password">Confirm New Password</Label>
              <Input
                id="confirm-password"
                type="password"
                placeholder="Confirm new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                disabled={isResetLoading}
                minLength={6}
              />
            </div>

            {newPassword && confirmPassword && newPassword !== confirmPassword && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-start gap-2">
                  <AlertCircle className="size-4 text-red-600 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-red-900">
                    Passwords do not match. Please make sure both passwords are identical.
                  </p>
                </div>
              </div>
            )}

            {newPassword && confirmPassword && newPassword === confirmPassword && (
              <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-start gap-2">
                  <AlertCircle className="size-4 text-green-600 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-green-900">
                    Passwords match! You can now reset your password.
                  </p>
                </div>
              </div>
            )}

            <div className="flex gap-3">
              <Button
                type="submit"
                disabled={isResetLoading || newPassword !== confirmPassword || !newPassword}
                className="flex-1"
              >
                {isResetLoading ? 'Resetting Password...' : 'Reset Password'}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowResetPassword(false);
                  setResetToken('');
                  setNewPassword('');
                  setConfirmPassword('');
                }}
                disabled={isResetLoading}
              >
                Cancel
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Helper function to parse permissions from roles array
function parsePermissionsFromRoles(roles: string[]): string[] {
  const permissions: string[] = [];

  roles.forEach(role => {
    if (role.includes(':')) {
      permissions.push(role);
    }
  });

  return permissions;
}