import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { 
  FileText, 
  CheckCircle2, 
  Users, 
  FileQuestion, 
  ThumbsUp, 
  ShoppingCart, 
  Package, 
  FileCheck, 
  CreditCard, 
  Wallet,
  FolderOpen,
  ChevronRight,
  Info
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from './ui/dialog';

export function WorkflowVisualization() {
  const [selectedStep, setSelectedStep] = useState<number | null>(null);

  const workflowSteps = [
    {
      id: 1,
      title: 'Requirement Initiation',
      description: 'Department identifies need and submits PR',
      icon: FileText,
      color: 'blue',
      owner: 'Department Lead / Estate Manager',
      details: [
        'Fill Purchase Requisition form',
        'Include item/service details and quantity',
        'Add purpose and estimated cost',
        'Select budget head',
        'Submit to Estate Manager'
      ],
      outputs: 'Purchase Requisition (PR) Form'
    },
    {
      id: 2,
      title: 'Verification & Budget Check',
      description: 'Verify need and check budget allocation',
      icon: CheckCircle2,
      color: 'green',
      owner: 'Estate Manager / Accountant',
      details: [
        'Verify stock or service requirement',
        'Check budget allocation',
        'Approve or return for modification',
        'Add to Pending Procurement Tracker'
      ],
      outputs: 'Approved PR'
    },
    {
      id: 3,
      title: 'Vendor Selection',
      description: 'Onboard or select approved vendor',
      icon: Users,
      color: 'purple',
      owner: 'Estate Manager + MC Procurement Member',
      details: [
        'Check if vendor is pre-approved',
        'For new vendors: collect GST, PAN, bank details',
        'Conduct background check',
        'MC approval for new vendors',
        'Add to Approved Vendor List'
      ],
      outputs: 'Approved Vendor List'
    },
    {
      id: 4,
      title: 'Request for Quotation',
      description: 'Get quotes from minimum 3 vendors',
      icon: FileQuestion,
      color: 'orange',
      owner: 'Estate Manager / Procurement Team',
      details: [
        'Send RFQ to minimum 3 vendors',
        'Capture price, delivery terms, warranty',
        'Record payment terms',
        'Create Quotation Comparison Sheet'
      ],
      outputs: 'Quotation Comparison Sheet (QCS)'
    },
    {
      id: 5,
      title: 'Evaluation & MC Approval',
      description: 'Compare quotes and get MC approval',
      icon: ThumbsUp,
      color: 'indigo',
      owner: 'Procurement Committee + Treasurer',
      details: [
        'Compare quotations on cost and quality',
        'Prepare Recommendation Note',
        'Get approval per financial limits:',
        '< ₹10K: Estate Manager',
        '₹10K-₹25K: Treasurer + Secretary',
        '> ₹25K: MC Meeting approval'
      ],
      outputs: 'Approved Recommendation'
    },
    {
      id: 6,
      title: 'Purchase Order Issue',
      description: 'Generate and send PO to vendor',
      icon: ShoppingCart,
      color: 'blue',
      owner: 'Accountant / Estate Manager',
      details: [
        'Prepare PO with all details',
        'Include item, quantity, price, GST',
        'Add delivery and payment terms',
        'Get approval per limits',
        'Send PO to vendor'
      ],
      outputs: 'Purchase Order (PO)'
    },
    {
      id: 7,
      title: 'Delivery & Verification',
      description: 'Receive and verify goods/services',
      icon: Package,
      color: 'green',
      owner: 'Estate Manager / Department Lead',
      details: [
        'Receive goods or service',
        'Verify quality and quantity vs PO',
        'Prepare Goods Receipt Note (GRN)',
        'Report deviations to vendor'
      ],
      outputs: 'Goods Receipt Note (GRN)'
    },
    {
      id: 8,
      title: 'Invoice Submission',
      description: 'Vendor submits invoice for verification',
      icon: FileCheck,
      color: 'purple',
      owner: 'Vendor → Accountant',
      details: [
        'Vendor submits invoice with PO reference',
        'Accountant verifies PO & GRN match',
        'Check GST details validity',
        'Verify invoice is in approved vendor name'
      ],
      outputs: 'Verified Invoice'
    },
    {
      id: 9,
      title: 'Payment Approval',
      description: 'Approve payment per financial limits',
      icon: CreditCard,
      color: 'orange',
      owner: 'Accountant + Treasurer + Secretary',
      details: [
        'Prepare Payment Approval Note',
        'Get approvals per limit:',
        '< ₹25K: Treasurer',
        '₹25K-₹50K: Treasurer + Secretary',
        '> ₹50K: MC majority approval',
        'Document digital approval'
      ],
      outputs: 'Payment Approval'
    },
    {
      id: 10,
      title: 'Payment Release',
      description: 'Transfer payment to vendor',
      icon: Wallet,
      color: 'green',
      owner: 'Accountant',
      details: [
        'Make payment via NEFT/RTGS',
        'Update vendor payment register',
        'Share payment confirmation',
        'File invoice in Paid Vendor File'
      ],
      outputs: 'Payment Confirmation'
    },
    {
      id: 11,
      title: 'Record Keeping',
      description: 'Maintain audit trail and reports',
      icon: FolderOpen,
      color: 'indigo',
      owner: 'Accountant / Admin',
      details: [
        'Maintain PR, QCS, PO, Invoice, Payment proof',
        'Update vendor master with KYC',
        'Monthly procurement tracker',
        'Payment pending summary for MC',
        'Prepare monthly MC report'
      ],
      outputs: 'Complete Audit Trail & Monthly Report'
    }
  ];

  const getColorClasses = (color: string) => {
    const colors: Record<string, { bg: string; text: string; border: string }> = {
      blue: { bg: 'bg-blue-100', text: 'text-blue-700', border: 'border-blue-300' },
      green: { bg: 'bg-green-100', text: 'text-green-700', border: 'border-green-300' },
      purple: { bg: 'bg-purple-100', text: 'text-purple-700', border: 'border-purple-300' },
      orange: { bg: 'bg-orange-100', text: 'text-orange-700', border: 'border-orange-300' },
      indigo: { bg: 'bg-indigo-100', text: 'text-indigo-700', border: 'border-indigo-300' },
    };
    return colors[color] || colors.blue;
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Procurement Process Workflow</CardTitle>
          <CardDescription>
            Complete step-by-step procurement process from requirement to payment
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {workflowSteps.map((step, index) => {
              const Icon = step.icon;
              const colors = getColorClasses(step.color);
              const isLast = index === workflowSteps.length - 1;

              return (
                <div key={step.id} className="relative">
                  <div
                    className={`flex items-start gap-4 p-4 border-2 rounded-lg transition-all cursor-pointer hover:shadow-md ${
                      selectedStep === step.id ? `${colors.border} ${colors.bg}` : 'border-slate-200 hover:border-slate-300'
                    }`}
                    onClick={() => setSelectedStep(selectedStep === step.id ? null : step.id)}
                  >
                    <div className={`p-3 rounded-lg ${colors.bg} flex-shrink-0`}>
                      <Icon className={`size-6 ${colors.text}`} />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge variant="outline" className="text-xs">
                          Step {step.id}
                        </Badge>
                        <h3 className="text-slate-900">{step.title}</h3>
                      </div>
                      <p className="text-sm text-slate-600 mt-1">{step.description}</p>
                      <p className="text-xs text-slate-500 mt-2">Owner: {step.owner}</p>

                      {selectedStep === step.id && (
                        <div className="mt-4 p-4 bg-white rounded-lg border border-slate-200">
                          <p className="text-sm text-slate-900 mb-2">Actions:</p>
                          <ul className="space-y-2">
                            {step.details.map((detail, idx) => (
                              <li key={idx} className="flex items-start gap-2 text-sm text-slate-600">
                                <ChevronRight className="size-4 text-slate-400 flex-shrink-0 mt-0.5" />
                                <span>{detail}</span>
                              </li>
                            ))}
                          </ul>
                          <div className="mt-3 pt-3 border-t border-slate-200">
                            <p className="text-xs text-slate-500">Output:</p>
                            <p className="text-sm text-slate-900 mt-1">{step.outputs}</p>
                          </div>
                        </div>
                      )}
                    </div>

                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="ghost" size="sm" onClick={(e) => e.stopPropagation()}>
                          <Info className="size-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle className="flex items-center gap-2">
                            <Icon className={`size-5 ${colors.text}`} />
                            {step.title}
                          </DialogTitle>
                          <DialogDescription>{step.description}</DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div>
                            <p className="text-sm text-slate-900 mb-2">Process Owner:</p>
                            <p className="text-sm text-slate-600">{step.owner}</p>
                          </div>
                          <div>
                            <p className="text-sm text-slate-900 mb-2">Actions Required:</p>
                            <ul className="space-y-2">
                              {step.details.map((detail, idx) => (
                                <li key={idx} className="flex items-start gap-2 text-sm text-slate-600">
                                  <CheckCircle2 className="size-4 text-green-600 flex-shrink-0 mt-0.5" />
                                  <span>{detail}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                          <div className="p-3 bg-slate-50 rounded-lg">
                            <p className="text-sm text-slate-900">Output Document:</p>
                            <p className="text-sm text-slate-600 mt-1">{step.outputs}</p>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>

                  {!isLast && (
                    <div className="flex justify-center my-2">
                      <div className="w-0.5 h-6 bg-slate-300"></div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Quick Reference */}
      <Card>
        <CardHeader>
          <CardTitle>Financial Approval Limits</CardTitle>
          <CardDescription>Quick reference guide for approval requirements</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 border border-slate-200 rounded-lg">
              <p className="text-sm text-slate-600">Below ₹10,000</p>
              <p className="text-slate-900 mt-1">Estate Manager</p>
            </div>
            <div className="p-4 border border-slate-200 rounded-lg">
              <p className="text-sm text-slate-600">₹10,001 - ₹25,000</p>
              <p className="text-slate-900 mt-1">Treasurer + Secretary</p>
            </div>
            <div className="p-4 border border-slate-200 rounded-lg">
              <p className="text-sm text-slate-600">Above ₹25,000</p>
              <p className="text-slate-900 mt-1">MC Meeting / WhatsApp Approval</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
