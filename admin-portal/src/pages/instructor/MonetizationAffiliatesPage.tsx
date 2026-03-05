import { useState } from 'react';
import { Card, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Copy, ChevronDown, CircleDollarSign } from 'lucide-react';
import { toast } from 'sonner';

const MOCK_REF_LINK = 'https://app.ulikme.com/signup?ref=0986ae5e887944ee97282ab7af30c641';
const COMMISSION_PERCENT = 5;

export default function MonetizationAffiliatesPage() {
  const [last30Days] = useState(0);
  const [lifetime] = useState(0);
  const [accountBalance] = useState(0);
  const [linkStatus] = useState<'active' | 'paused'>('active');

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(MOCK_REF_LINK);
      toast.success('Link copied to clipboard');
    } catch {
      toast.error('Could not copy link');
    }
  };

  return (
    <div className="p-6 space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Affiliates</h1>
        <p className="text-muted-foreground mt-2">
          Earn commission when you invite somebody to create or join a class, activity, or community
          on Ulikme.
        </p>
      </div>

      {/* Commission stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm font-medium text-muted-foreground">Last 30 days</p>
            <p className="text-2xl font-bold text-foreground mt-1">
              ${last30Days.toFixed(2)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm font-medium text-muted-foreground">Lifetime</p>
            <p className="text-2xl font-bold text-foreground mt-1">
              ${lifetime.toFixed(2)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Account balance</p>
              <p className="text-2xl font-bold text-foreground mt-1">
                ${accountBalance.toFixed(2)}
              </p>
            </div>
            <div className="flex flex-col gap-1">
              <Button variant="secondary" size="sm" disabled={accountBalance <= 0}>
                PAYOUT
              </Button>
              <span className="text-xs text-muted-foreground text-center sm:text-left">
                ${accountBalance.toFixed(2)} available soon
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Your affiliate links */}
      <Card>
        <CardContent className="pt-6 space-y-4">
          <h2 className="text-lg font-semibold text-foreground">Your affiliate links</h2>
          <div className="inline-flex items-center rounded-full bg-muted px-4 py-2 text-sm font-medium text-foreground">
            Ulikme platform
          </div>
          <p className="text-sm text-muted-foreground">
            Earn {COMMISSION_PERCENT}% commission when you invite somebody to create a class or join a
            paid activity on Ulikme.
          </p>
          <div className="flex flex-wrap items-center gap-2">
            <a
              href={MOCK_REF_LINK}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline text-sm font-medium break-all"
            >
              {MOCK_REF_LINK}
            </a>
            <Button size="sm" onClick={handleCopy} className="shrink-0 gap-2">
              <Copy className="w-4 h-4" />
              COPY
            </Button>
            <div className="flex items-center gap-1 rounded-md border border-border bg-muted/50 px-3 py-1.5 text-sm">
              <span className="capitalize">{linkStatus}</span>
              <ChevronDown className="w-4 h-4 text-muted-foreground" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Referrals list placeholder */}
      <Card>
        <CardContent className="py-16 flex flex-col items-center justify-center text-center">
          <div className="rounded-full bg-muted p-4 mb-4">
            <CircleDollarSign className="w-10 h-10 text-muted-foreground" />
          </div>
          <p className="text-muted-foreground font-medium">Your referrals will show here</p>
          <p className="text-sm text-muted-foreground mt-1">
            When someone signs up or pays using your link, they’ll appear in this list.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
