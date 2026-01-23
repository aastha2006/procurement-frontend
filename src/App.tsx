import { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './components/ui/tabs';
import { Dashboard } from './components/Dashboard';
import { WorkflowVisualization } from './components/WorkflowVisualization';
import { PurchaseRequisition } from './components/PurchaseRequisition';
import { VendorManagement } from './components/VendorManagement';
import { QuotationComparison } from './components/QuotationComparison';
import { PurchaseOrders } from './components/PurchaseOrders';
import { PaymentTracking } from './components/PaymentTracking';
import { Reports } from './components/Reports';
import { Login } from './components/Login';
import { MasterData } from './components/MasterData';
import { PRList } from './components/PRList';
import { RFQManagement } from './components/RFQManagement';
import { SupplierQuotations } from './components/SupplierQuotations';
import { MemberOnboarding } from './components/MemberOnboarding';
import { SupplierOnboarding } from './components/SupplierOnboarding';
import { PublicMemberRegistration } from './components/PublicMemberRegistration';
import { PublicSupplierRegistration } from './components/PublicSupplierRegistration';
import { ClipboardList, LogOut, Users, UserPlus } from 'lucide-react';
import { Button } from './components/ui/button';
import { Badge } from './components/ui/badge';
import { toast } from 'sonner';
import { Toaster } from './components/ui/sonner';

interface AuthUser {
  userId: number; // User ID from token (numeric)
  email: string;
  roles: string[];
  group: number;
  groupName: string;
  loginType: string;
  vendorId?: number; // Vendor ID from token claims (for Supplier users)
  accessToken: string;
  refreshToken: string;
  permissions?: string[]; // Array of permission strings like "PURCHASE_REQUISITION:VIEW"
}

export default function App() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [showMemberOnboarding, setShowMemberOnboarding] = useState(false);
  const [showSupplierOnboarding, setShowSupplierOnboarding] = useState(false);
  const [showPublicRegistration, setShowPublicRegistration] = useState(false);
  const [showPublicSupplierRegistration, setShowPublicSupplierRegistration] = useState(false);

  // Permission checking utility
  const hasPermission = (module: string, action: 'VIEW' | 'CREATE' | 'EDIT' | 'DELETE' | 'APPROVE' = 'VIEW') => {
    if (!user || !user.permissions || user.permissions.length === 0) return true; // Default to true if no permissions loaded (backward compatibility)
    
    // Convert UI module name to token module name
    // "Purchase Requisition" -> "PURCHASE_REQUISITION"
    // "Vendor Management" -> "VENDOR_MANAGEMENT"
    // "Purchase Orders" -> "PURCHASE_ORDERS"
    // "Master Data" -> "MASTER_DATA"
    const tokenModule = module.toUpperCase().replace(/ /g, '_');
    
    // Build the permission string to look for
    const permissionString = `${tokenModule}:${action}`;
    
    // Check if user has this permission
    return user.permissions.some(p => p === permissionString);
  };

  // Define module mapping for tabs
  const tabModuleMap = {
    'dashboard': 'Dashboard',
    'workflow': 'Dashboard', // Workflow is part of Dashboard
    'requisition': 'Purchase Requisition',
    'pr-list': 'Purchase Requisition',
    'rfq': 'Purchase Requisition', // RFQ is part of PR workflow
    'vendors': 'Vendor Management',
    'quotations': 'Quotations',
    'purchase-orders': 'Purchase Orders',
    'payments': 'Payments',
    'reports': 'Reports',
    'master-data': 'Master Data'
  };

  useEffect(() => {
    // Check if user is already logged in
    const storedUser = localStorage.getItem('authUser');
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        // Check if token is expired
        const tokenPayload = JSON.parse(atob(parsedUser.accessToken.split('.')[1]));
        if (tokenPayload.exp * 1000 > Date.now()) {
          // Ensure vendorId is extracted from token if not present in stored data
          if (!parsedUser.vendorId && tokenPayload.id) {
            parsedUser.vendorId = tokenPayload.id; // Extract from "id" field (e.g., id: 3)
            localStorage.setItem('authUser', JSON.stringify(parsedUser));
          }
          setUser(parsedUser);
        } else {
          localStorage.removeItem('authUser');
        }
      } catch (error) {
        localStorage.removeItem('authUser');
      }
    }
  }, []);

  const handleLogin = (authData: AuthUser) => {
    setUser(authData);
    localStorage.setItem('authUser', JSON.stringify(authData));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('authUser');
  };

  if (!user) {
    if (showPublicRegistration) {
      return (
        <PublicMemberRegistration
          onClose={() => setShowPublicRegistration(false)}
          onSuccess={() => {
            setShowPublicRegistration(false);
            toast.success('Registration submitted!', {
              description: 'Your application is under review. You will receive login credentials via email once approved.'
            });
          }}
        />
      );
    }
    if (showPublicSupplierRegistration) {
      return (
        <PublicSupplierRegistration
          onClose={() => setShowPublicSupplierRegistration(false)}
          onSuccess={() => {
            setShowPublicSupplierRegistration(false);
            toast.success('Supplier application submitted successfully!', {
              description: 'Your application will be reviewed by our procurement team. You will be notified via email within 5-7 business days.'
            });
          }}
        />
      );
    }
    return (
      <Login
        onLogin={handleLogin}
        onRegisterMember={() => setShowPublicRegistration(true)}
        onRegisterSupplier={() => setShowPublicSupplierRegistration(true)}
      />
    );
  }

  if (showMemberOnboarding) {
    return (
      <MemberOnboarding
        onClose={() => setShowMemberOnboarding(false)}
        authToken={user.accessToken}
      />
    );
  }

  if (showSupplierOnboarding) {
    return (
      <SupplierOnboarding
        onClose={() => setShowSupplierOnboarding(false)}
        authToken={user.accessToken}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-blue-50 to-cyan-50">
      <header className="bg-white border-b border-sky-200 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-sky-400 to-blue-500 rounded-lg shadow-md">
                <ClipboardList className="size-6 text-white" />
              </div>
              <div>
                <h1 className="text-slate-900">Procurement Management System</h1>
                <p className="text-slate-600 text-sm">650-Flat Residential Society</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm text-slate-900">{user.email}</p>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="outline" className="text-xs">
                    {user.groupName}
                  </Badge>
                  <Badge variant="secondary" className="text-xs">
                    {user.loginType}
                  </Badge>
                </div>
              </div>

              {user.loginType === 'Society' && (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowMemberOnboarding(true)}
                  >
                    <Users className="size-4 mr-2" />
                    Onboard Member
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowSupplierOnboarding(true)}
                  >
                    <UserPlus className="size-4 mr-2" />
                    Onboard Supplier
                  </Button>
                </>
              )}

              <Button variant="outline" size="sm" onClick={handleLogout}>
                <LogOut className="size-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        <Tabs defaultValue={user.loginType === 'Society' ? 'dashboard' : 'my-rfqs'} className="space-y-6">
          <TabsList className={`grid w-full ${user.loginType === 'Society' ? 'grid-cols-5 lg:grid-cols-10' : 'grid-cols-3'} bg-white shadow-sm`}>
            {user.loginType === 'Society' && (
              <>
                {hasPermission('Dashboard') && <TabsTrigger value="dashboard">Dashboard</TabsTrigger>}
                {hasPermission('Dashboard') && <TabsTrigger value="workflow">Workflow</TabsTrigger>}
                {hasPermission('Purchase Requisition') && <TabsTrigger value="requisition">New PR</TabsTrigger>}
                {hasPermission('Purchase Requisition') && <TabsTrigger value="pr-list">All PRs</TabsTrigger>}
                {hasPermission('Purchase Requisition') && <TabsTrigger value="rfq">RFQ</TabsTrigger>}
                {hasPermission('Vendor Management') && <TabsTrigger value="vendors">Vendors</TabsTrigger>}
                {hasPermission('Quotations') && <TabsTrigger value="quotations">Quotations</TabsTrigger>}
                {hasPermission('Purchase Orders') && <TabsTrigger value="purchase-orders">Purchase Orders</TabsTrigger>}
                {hasPermission('Payments') && <TabsTrigger value="payments">Payments</TabsTrigger>}
                {hasPermission('Reports') && <TabsTrigger value="reports">Reports</TabsTrigger>}
                {hasPermission('Master Data') && <TabsTrigger value="master-data">Master Data</TabsTrigger>}
              </>
            )}
            {user.loginType === 'Supplier' && (
              <>
                <TabsTrigger value="my-rfqs">My RFQs</TabsTrigger>
                <TabsTrigger value="my-pos">My POs</TabsTrigger>
                <TabsTrigger value="profile">Profile</TabsTrigger>
              </>
            )}
          </TabsList>

          {user.loginType === 'Society' && (
            <>
              {hasPermission('Dashboard') && (
                <TabsContent value="dashboard">
                  <Dashboard authToken={user.accessToken} />
                </TabsContent>
              )}

              {hasPermission('Dashboard') && (
                <TabsContent value="workflow">
                  <WorkflowVisualization />
                </TabsContent>
              )}

              {hasPermission('Purchase Requisition') && (
                <TabsContent value="requisition">
                  <PurchaseRequisition authToken={user.accessToken} userId={user.userId} userEmail={user.email} />
                </TabsContent>
              )}

              {hasPermission('Purchase Requisition') && (
                <TabsContent value="pr-list">
                  <PRList authToken={user.accessToken} userId={user.userId} userEmail={user.email} />
                </TabsContent>
              )}

              {hasPermission('Purchase Requisition') && (
                <TabsContent value="rfq">
                  <RFQManagement authToken={user.accessToken} />
                </TabsContent>
              )}

              {hasPermission('Vendor Management') && (
                <TabsContent value="vendors">
                  <VendorManagement authToken={user.accessToken} userGroupName={user.groupName} />
                </TabsContent>
              )}

              {hasPermission('Quotations') && (
                <TabsContent value="quotations">
                  <QuotationComparison authToken={user.accessToken} />
                </TabsContent>
              )}

              {hasPermission('Purchase Orders') && (
                <TabsContent value="purchase-orders">
                  <PurchaseOrders />
                </TabsContent>
              )}

              {hasPermission('Payments') && (
                <TabsContent value="payments">
                  <PaymentTracking />
                </TabsContent>
              )}

              {hasPermission('Reports') && (
                <TabsContent value="reports">
                  <Reports />
                </TabsContent>
              )}

              {hasPermission('Master Data') && (
                <TabsContent value="master-data">
                  <MasterData authToken={user.accessToken} />
                </TabsContent>
              )}
            </>
          )}

          {user.loginType === 'Supplier' && (
            <>
              <TabsContent value="my-rfqs">
                <SupplierQuotations authToken={user.accessToken} vendorId={user.vendorId} />
              </TabsContent>

              <TabsContent value="my-pos">
                <PurchaseOrders authToken={user.accessToken} vendorId={user.vendorId} isSupplierView={true} />
              </TabsContent>

              <TabsContent value="profile">
                <VendorManagement authToken={user.accessToken} userGroupName={user.groupName} vendorId={user.vendorId} isSupplierProfile={true} />
              </TabsContent>
            </>
          )}
        </Tabs>
      </main>
      <Toaster />
    </div>
  );
}