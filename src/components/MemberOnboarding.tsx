import { useState, useEffect } from 'react';
import { api } from '../api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Badge } from './ui/badge';
import { ArrowLeft, UserPlus, Users, CheckCircle2, Mail, Phone, Building2, Home, Calendar } from 'lucide-react';
import { toast } from 'sonner';

interface MemberOnboardingProps {
  onClose: () => void;
  authToken: string;
}

interface Society {
  id: number;
  name: string;
}

export function MemberOnboarding({ onClose, authToken }: MemberOnboardingProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [societies, setSocieties] = useState<Society[]>([
    { id: 1, name: 'Green Valley Apartments' },
    { id: 13, name: 'Sunshine Heights' },
    { id: 14, name: 'Royal Residency' },
  ]);

  // Form state
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [block, setBlock] = useState('');
  const [flatNumber, setFlatNumber] = useState('');
  const [ownershipType, setOwnershipType] = useState('');
  const [moveInDate, setMoveInDate] = useState('');
  const [propertyOwnerName, setPropertyOwnerName] = useState('');
  const [propertyOwnerContact, setPropertyOwnerContact] = useState('');
  const [reasonForRegistration, setReasonForRegistration] = useState('');
  const [role, setRole] = useState('RESIDENT');
  const [societyId, setSocietyId] = useState('');

  const [members, setMembers] = useState([
    {
      id: 1,
      name: 'Rajesh Kumar',
      email: 'rajesh.kumar@society.com',
      phone: '+91 98765 43210',
      flatNo: 'A-101',
      role: 'MC Member',
      status: 'Active'
    },
    {
      id: 2,
      name: 'Priya Sharma',
      email: 'priya.sharma@society.com',
      phone: '+91 98765 43211',
      flatNo: 'B-205',
      role: 'Treasurer',
      status: 'Active'
    },
    {
      id: 3,
      name: 'Amit Patel',
      email: 'amit.patel@society.com',
      phone: '+91 98765 43212',
      flatNo: 'C-310',
      role: 'Secretary',
      status: 'Active'
    },
  ]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const payload = {
        firstName,
        lastName,
        email,
        phone,
        block,
        flatNumber,
        ownershipType,
        moveInDate,
        propertyOwnerName: ownershipType === 'TENANT' ? propertyOwnerName : null,
        propertyOwnerContact: ownershipType === 'TENANT' ? propertyOwnerContact : null,
        reasonForRegistration,
        role,
        societyId: parseInt(societyId),
      };

      const response = await api.post('/members/onboard', payload, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to onboard member');
      }

      const data = await response.json();

      toast.success('Member onboarded successfully!', {
        description: 'Login credentials have been sent to the member\'s email.'
      });

      // Reset form
      setFirstName('');
      setLastName('');
      setEmail('');
      setPhone('');
      setBlock('');
      setFlatNumber('');
      setOwnershipType('');
      setMoveInDate('');
      setPropertyOwnerName('');
      setPropertyOwnerContact('');
      setReasonForRegistration('');
      setRole('RESIDENT');
      setSocietyId('');

    } catch (error: any) {
      console.error('Error onboarding member:', error);
      toast.error('Failed to onboard member', {
        description: error.message || 'Please try again later.'
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
              <div className="p-2 bg-gradient-to-br from-sky-400 to-blue-500 rounded-lg shadow-md">
                <UserPlus className="size-6 text-white" />
              </div>
              <div>
                <h1 className="text-slate-900">Member Onboarding</h1>
                <p className="text-slate-600 text-sm">Add new society members to the system</p>
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
                <CardTitle>Add New Member</CardTitle>
                <CardDescription>
                  Fill in the member details to grant system access
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Society Selection */}
                  <div className="space-y-2">
                    <Label htmlFor="society">Society</Label>
                    <Select value={societyId} onValueChange={setSocietyId} required>
                      <SelectTrigger id="society">
                        <SelectValue placeholder="Select society" />
                      </SelectTrigger>
                      <SelectContent>
                        {societies.map((society) => (
                          <SelectItem key={society.id} value={society.id.toString()}>
                            {society.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Personal Information */}
                  <div className="space-y-4">
                    <h3 className="text-slate-900">Personal Information</h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="firstName">First Name</Label>
                        <Input
                          id="firstName"
                          placeholder="Enter first name"
                          value={firstName}
                          onChange={(e) => setFirstName(e.target.value)}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="lastName">Last Name</Label>
                        <Input
                          id="lastName"
                          placeholder="Enter last name"
                          value={lastName}
                          onChange={(e) => setLastName(e.target.value)}
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
                          placeholder="member@society.com"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
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
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
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
                        <Select value={block} onValueChange={setBlock} required>
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
                          value={flatNumber}
                          onChange={(e) => setFlatNumber(e.target.value)}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="ownershipType">Ownership Type</Label>
                        <Select value={ownershipType} onValueChange={setOwnershipType} required>
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

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="moveInDate">
                          <Calendar className="size-4 inline mr-1" />
                          Move-in Date
                        </Label>
                        <Input
                          id="moveInDate"
                          type="date"
                          value={moveInDate}
                          onChange={(e) => setMoveInDate(e.target.value)}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="reasonForRegistration">Reason for Registration</Label>
                        <Input
                          id="reasonForRegistration"
                          placeholder="e.g., New Owner, Renting"
                          value={reasonForRegistration}
                          onChange={(e) => setReasonForRegistration(e.target.value)}
                          required
                        />
                      </div>
                    </div>
                  </div>

                  {/* Property Owner Details (for Tenants only) */}
                  {ownershipType === 'TENANT' && (
                    <div className="space-y-4">
                      <h3 className="text-slate-900">Property Owner Details</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="propertyOwnerName">Property Owner Name</Label>
                          <Input
                            id="propertyOwnerName"
                            placeholder="Enter owner name"
                            value={propertyOwnerName}
                            onChange={(e) => setPropertyOwnerName(e.target.value)}
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="propertyOwnerContact">Property Owner Contact</Label>
                          <Input
                            id="propertyOwnerContact"
                            type="tel"
                            placeholder="+91 98765 43210"
                            value={propertyOwnerContact}
                            onChange={(e) => setPropertyOwnerContact(e.target.value)}
                            required
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Role */}
                  <div className="space-y-4">
                    <h3 className="text-slate-900">Role & Access</h3>

                    <div className="space-y-2">
                      <Label htmlFor="role">Member Role</Label>
                      <Select value={role} onValueChange={setRole} required>
                        <SelectTrigger id="role">
                          <SelectValue placeholder="Select role" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="ADMIN">ADMIN</SelectItem>
                          <SelectItem value="RESIDENT">Resident</SelectItem>
                          <SelectItem value="MC_MEMBER">MC Member</SelectItem>
                          <SelectItem value="PRESIDENT">President</SelectItem>
                          <SelectItem value="SECRETARY">Secretary</SelectItem>
                          <SelectItem value="TREASURER">Treasurer</SelectItem>
                          <SelectItem value="PROCUREMENT_HEAD">Procurement Head</SelectItem>
                          <SelectItem value="ESTATE_MANAGER">Estate Manager</SelectItem>
                          <SelectItem value="ACCOUNTANT">Accountant</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-start gap-2">
                      <CheckCircle2 className="size-5 text-blue-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm text-blue-900">Auto-generated Credentials</p>
                        <p className="text-xs text-blue-700 mt-1">
                          Login credentials will be automatically generated and sent to the member's email address.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-3 pt-4">
                    <Button type="submit" disabled={isLoading} className="flex-1 md:flex-initial">
                      {isLoading ? 'Adding Member...' : 'Add Member'}
                    </Button>
                    <Button type="button" variant="outline" onClick={onClose}>
                      Cancel
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Current Members List */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="size-5 text-blue-600" />
                  Recent Members
                </CardTitle>
                <CardDescription>Currently active members</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {members.map((member) => (
                    <div
                      key={member.id}
                      className="p-3 border border-slate-200 rounded-lg hover:border-slate-300 transition-colors"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-slate-900 truncate">{member.name}</p>
                          <p className="text-xs text-slate-600 mt-1">{member.email}</p>
                          <div className="flex items-center gap-2 mt-2">
                            <Badge variant="outline" className="text-xs">
                              {member.flatNo}
                            </Badge>
                            <Badge variant="secondary" className="text-xs">
                              {member.role}
                            </Badge>
                          </div>
                        </div>
                        <Badge className="bg-green-100 text-green-700 text-xs">
                          {member.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-4 pt-4 border-t border-slate-200">
                  <p className="text-xs text-center text-slate-500">
                    Total Active Members: {members.length}
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
