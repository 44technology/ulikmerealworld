import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Wallet,
  DollarSign,
  Calendar,
  CheckCircle2,
  Clock,
  CreditCard,
  Building2,
  Link2,
  Shield,
  Loader2,
} from 'lucide-react';
import AppLayout from '@/components/layout/AppLayout';
import BottomNav from '@/components/layout/BottomNav';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';

const PAYOUT_METHOD_KEY = 'payout_method';

export interface PayoutMethod {
  id: string;
  accountHolderName: string;
  last4: string;
  routingLast4: string;
  accountType: 'checking' | 'savings';
  verifiedVia?: 'manual' | 'instant';
  updatedAt: string;
}

// Mock payout history - will be replaced with API
const MOCK_PAYOUTS = [
  { id: '1', amount: 400, date: '2025-01-15', status: 'completed', method: 'Bank Transfer' },
  { id: '2', amount: 350, date: '2025-01-01', status: 'completed', method: 'Bank Transfer' },
  { id: '3', amount: 500, date: '2025-01-25', status: 'pending', method: 'Bank Transfer' },
  { id: '4', amount: 280, date: '2024-12-20', status: 'completed', method: 'Bank Transfer' },
];

function getStoredPayoutMethod(): PayoutMethod | null {
  try {
    const raw = localStorage.getItem(PAYOUT_METHOD_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as PayoutMethod;
  } catch {
    return null;
  }
}

function setStoredPayoutMethod(method: PayoutMethod | null) {
  if (method) localStorage.setItem(PAYOUT_METHOD_KEY, JSON.stringify(method));
  else localStorage.removeItem(PAYOUT_METHOD_KEY);
}

export default function PayoutsPage() {
  const navigate = useNavigate();
  const [payouts] = useState(MOCK_PAYOUTS);
  const [payoutMethod, setPayoutMethod] = useState<PayoutMethod | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [requestConfirmOpen, setRequestConfirmOpen] = useState(false);
  const [requestedAmount, setRequestedAmount] = useState<number | null>(null);
  const [isInstantVerifying, setIsInstantVerifying] = useState(false);

  // Manual form
  const [accountHolderName, setAccountHolderName] = useState('');
  const [routingNumber, setRoutingNumber] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [accountType, setAccountType] = useState<'checking' | 'savings'>('checking');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setPayoutMethod(getStoredPayoutMethod());
  }, []);

  useEffect(() => {
    if (dialogOpen && payoutMethod) {
      setAccountHolderName(payoutMethod.accountHolderName);
      setAccountType(payoutMethod.accountType);
      setRoutingNumber('');
      setAccountNumber('');
    } else if (dialogOpen && !payoutMethod) {
      setAccountHolderName('');
      setRoutingNumber('');
      setAccountNumber('');
      setAccountType('checking');
    }
  }, [dialogOpen, payoutMethod]);

  const totalEarnings = payouts.reduce((sum, p) => sum + p.amount, 0);
  const pendingAmount = payouts.filter((p) => p.status === 'pending').reduce((sum, p) => sum + p.amount, 0);
  const thisMonth = payouts
    .filter((p) => p.status === 'completed' && p.date.startsWith('2025-01'))
    .reduce((sum, p) => sum + p.amount, 0);

  const validateRouting = (val: string) => /^\d{0,9}$/.test(val);
  const validateAccount = (val: string) => /^\d{0,17}$/.test(val);

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const routing = routingNumber.replace(/\s/g, '');
    const account = accountNumber.replace(/\s/g, '');
    if (!accountHolderName.trim()) {
      toast.error('Please enter account holder name');
      return;
    }
    if (routing.length !== 9) {
      toast.error('Routing number must be 9 digits');
      return;
    }
    if (account.length < 4) {
      toast.error('Please enter a valid account number');
      return;
    }
    setIsSubmitting(true);
    setTimeout(() => {
      const method: PayoutMethod = {
        id: payoutMethod?.id || `pm-${Date.now()}`,
        accountHolderName: accountHolderName.trim(),
        last4: account.slice(-4),
        routingLast4: routing.slice(-4),
        accountType,
        verifiedVia: 'manual',
        updatedAt: new Date().toISOString(),
      };
      setStoredPayoutMethod(method);
      setPayoutMethod(method);
      setDialogOpen(false);
      setIsSubmitting(false);
      toast.success(payoutMethod ? 'Payout method updated' : 'Payout method added');
    }, 600);
  };

  const handleInstantVerification = () => {
    setIsInstantVerifying(true);
    // Simulate 3rd party (e.g. Plaid) flow
    setTimeout(() => {
      const method: PayoutMethod = {
        id: payoutMethod?.id || `pm-${Date.now()}`,
        accountHolderName: 'Verified Bank Account',
        last4: '4521',
        routingLast4: '0210',
        accountType: 'checking',
        verifiedVia: 'instant',
        updatedAt: new Date().toISOString(),
      };
      setStoredPayoutMethod(method);
      setPayoutMethod(method);
      setDialogOpen(false);
      setIsInstantVerifying(false);
      toast.success('Bank account linked and verified');
    }, 2500);
  };

  const updatedLabel = payoutMethod
    ? new Date(payoutMethod.updatedAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
    : '';

  return (
    <AppLayout>
      <div className="sticky top-0 z-40 glass safe-top">
        <div className="flex items-center gap-3 px-4 py-3">
          <motion.button onClick={() => navigate('/home')} className="p-2 -ml-2" whileTap={{ scale: 0.9 }}>
            <ArrowLeft className="w-6 h-6 text-foreground" />
          </motion.button>
          <h1 className="text-xl font-bold text-foreground flex-1">Earnings & Payouts</h1>
          <div className="w-10" />
        </div>
      </div>

      <div className="px-4 pb-24 space-y-6">
        <p className="text-sm text-muted-foreground">
          Revenue from your classes and events. Payouts are sent to your linked account.
        </p>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2 text-muted-foreground">
                <Wallet className="w-4 h-4" />
                Total Earnings
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-foreground">${totalEarnings}</p>
              <p className="text-xs text-muted-foreground mt-0.5">All time</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2 text-muted-foreground">
                <Clock className="w-4 h-4" />
                Pending
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-foreground">${pendingAmount}</p>
              <p className="text-xs text-muted-foreground mt-0.5">Awaiting payout</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2 text-muted-foreground">
                <DollarSign className="w-4 h-4" />
                This Month
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-foreground">${thisMonth}</p>
              <p className="text-xs text-muted-foreground mt-0.5">Completed</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Payout method</CardTitle>
            <CardDescription>Where your earnings are sent</CardDescription>
          </CardHeader>
          <CardContent>
            {payoutMethod ? (
              <div className="flex items-center gap-4 p-4 rounded-xl bg-muted/50 border border-border">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <Building2 className="w-6 h-6 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-foreground">{payoutMethod.accountHolderName}</p>
                  <p className="text-sm text-muted-foreground">
                    •••• {payoutMethod.last4}
                    {payoutMethod.verifiedVia === 'instant' && (
                      <span className="ml-2 inline-flex items-center gap-1 text-green-600 dark:text-green-400">
                        <Shield className="w-3.5 h-3.5" />
                        Verified
                      </span>
                    )}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">Updated {updatedLabel}</p>
                </div>
                <Button variant="outline" size="sm" onClick={() => setDialogOpen(true)}>
                  Update
                </Button>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 px-4 rounded-xl border-2 border-dashed border-border">
                <div className="w-14 h-14 rounded-full bg-muted flex items-center justify-center mb-3">
                  <CreditCard className="w-7 h-7 text-muted-foreground" />
                </div>
                <p className="font-medium text-foreground text-center">No payout method</p>
                <p className="text-sm text-muted-foreground text-center mt-1">
                  Add a bank account to receive your earnings
                </p>
                <Button className="mt-4" onClick={() => setDialogOpen(true)}>
                  Add payout method
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Payout history</CardTitle>
            <CardDescription>Your payment transactions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {payouts.map((payout) => (
                <motion.div
                  key={payout.id}
                  className="flex items-center justify-between p-4 rounded-xl border border-border"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <div className="flex items-center gap-4 flex-1">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        payout.status === 'completed' ? 'bg-green-500/10' : 'bg-amber-500/10'
                      }`}
                    >
                      {payout.status === 'completed' ? (
                        <CheckCircle2 className="w-5 h-5 text-green-600" />
                      ) : (
                        <Clock className="w-5 h-5 text-amber-600" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-semibold text-foreground">${payout.amount}</p>
                        <Badge variant={payout.status === 'completed' ? 'default' : 'secondary'}>
                          {payout.status}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-3 text-sm text-muted-foreground mt-0.5">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {payout.date}
                        </span>
                        <span>{payout.method}</span>
                      </div>
                    </div>
                  </div>
                  {payout.status === 'pending' && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        setRequestedAmount(payout.amount);
                        setRequestConfirmOpen(true);
                      }}
                    >
                      Request
                    </Button>
                  )}
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Request confirmation: amount + 3-5 business days */}
      <Dialog open={requestConfirmOpen} onOpenChange={(open) => { setRequestConfirmOpen(open); if (!open) setRequestedAmount(null); }}>
        <DialogContent className="max-w-md mx-4 rounded-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-green-600" />
              Payout request confirmed
            </DialogTitle>
            <DialogDescription asChild>
              <div className="space-y-3 pt-1">
                <p className="text-foreground font-semibold">
                  You requested <span className="text-primary">${requestedAmount ?? 0}</span>.
                </p>
                <p className="text-muted-foreground">
                  Your payout will be deposited to your linked account within <strong>3–5 business days</strong>. You will receive a notification once the transfer is complete.
                </p>
              </div>
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end pt-2">
            <Button onClick={() => { setRequestConfirmOpen(false); setRequestedAmount(null); }}>Done</Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md mx-4 rounded-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{payoutMethod ? 'Update payout method' : 'Add payout method'}</DialogTitle>
            <DialogDescription>
              Add or update the bank account where you want to receive payouts. You can enter details manually or
              verify instantly with your bank.
            </DialogDescription>
          </DialogHeader>

          <Tabs defaultValue="manual" className="w-full">
            <TabsList className="grid w-full grid-cols-2 rounded-xl">
              <TabsTrigger value="manual" className="rounded-lg">
                Manual
              </TabsTrigger>
              <TabsTrigger value="instant" className="rounded-lg">
                Instant verify
              </TabsTrigger>
            </TabsList>

            <TabsContent value="manual" className="space-y-4 pt-4">
              <form onSubmit={handleManualSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="accountHolder">Account holder name</Label>
                  <Input
                    id="accountHolder"
                    placeholder="John Doe"
                    value={accountHolderName}
                    onChange={(e) => setAccountHolderName(e.target.value)}
                    className="rounded-xl"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="routing">Routing number (9 digits)</Label>
                  <Input
                    id="routing"
                    placeholder="021000021"
                    maxLength={9}
                    value={routingNumber}
                    onChange={(e) => {
                      const v = e.target.value.replace(/\D/g, '');
                      if (validateRouting(v)) setRoutingNumber(v);
                    }}
                    className="rounded-xl font-mono"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="account">Bank account number</Label>
                  <Input
                    id="account"
                    placeholder="•••• •••• •••• 1234"
                    maxLength={17}
                    type="password"
                    autoComplete="off"
                    value={accountNumber}
                    onChange={(e) => {
                      const v = e.target.value.replace(/\D/g, '');
                      if (validateAccount(v)) setAccountNumber(v);
                    }}
                    className="rounded-xl font-mono"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Account type</Label>
                  <Select value={accountType} onValueChange={(v) => setAccountType(v as 'checking' | 'savings')}>
                    <SelectTrigger className="rounded-xl">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="checking">Checking</SelectItem>
                      <SelectItem value="savings">Savings</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button type="submit" className="w-full rounded-xl" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Saving…
                    </>
                  ) : payoutMethod ? (
                    'Update method'
                  ) : (
                    'Add payout method'
                  )}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="instant" className="space-y-4 pt-4">
              <div className="rounded-xl border border-border bg-muted/30 p-4 space-y-3">
                <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                  <Link2 className="w-4 h-4 text-primary" />
                  Connect your bank
                </div>
                <p className="text-sm text-muted-foreground">
                  Securely link your bank account with our partner. Instant verification so you can receive payouts
                  right away.
                </p>
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <Shield className="w-3.5 h-3.5" />
                  Bank-level encryption. We never store your full login credentials.
                </p>
              </div>
              <Button
                type="button"
                className="w-full rounded-xl"
                onClick={handleInstantVerification}
                disabled={isInstantVerifying}
              >
                {isInstantVerifying ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Verifying with your bank…
                  </>
                ) : (
                  <>
                    <Building2 className="w-4 h-4 mr-2" />
                    Connect bank (instant verification)
                  </>
                )}
              </Button>
              <p className="text-xs text-center text-muted-foreground">
                You’ll be redirected to a secure 3rd party to authorize access. Supported by most US banks.
              </p>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>

      <BottomNav />
    </AppLayout>
  );
}
