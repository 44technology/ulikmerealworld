import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, CreditCard, Plus, Trash2, Wallet as WalletIcon } from 'lucide-react';
import AppLayout from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useWallet } from '@/contexts/WalletContext';
import { getBrandFromNumber } from '@/lib/wallet';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { toast } from 'sonner';

export default function WalletPage() {
  const navigate = useNavigate();
  const { cards, addCard, removeCard } = useWallet();
  const [cardToRemove, setCardToRemove] = useState<string | null>(null);
  const [showAddCard, setShowAddCard] = useState(false);
  const [addCardNumber, setAddCardNumber] = useState('');
  const [addCardExpiry, setAddCardExpiry] = useState('');
  const [addCardSubmitting, setAddCardSubmitting] = useState(false);

  const handleRemove = (id: string) => {
    setCardToRemove(id);
  };

  const confirmRemove = () => {
    if (cardToRemove) {
      removeCard(cardToRemove);
      setCardToRemove(null);
      toast.success('Card removed from wallet');
    }
  };

  const handleAddCard = () => {
    const num = addCardNumber.replace(/\s/g, '');
    if (num.length < 4) {
      toast.error('Enter at least the last 4 digits of your card');
      return;
    }
    const last4 = num.slice(-4);
    const [expiryMonth, expiryYear] = addCardExpiry.split('/');
    if (!expiryMonth || !expiryYear || expiryMonth.length !== 2 || expiryYear.length !== 2) {
      toast.error('Enter expiry as MM/YY');
      return;
    }
    setAddCardSubmitting(true);
    try {
      addCard({
        last4,
        brand: getBrandFromNumber(num.length >= 4 ? num.padStart(13, '0') : num),
        expiryMonth: expiryMonth.trim(),
        expiryYear: expiryYear.trim(),
      });
      toast.success('Card added to wallet');
      setShowAddCard(false);
      setAddCardNumber('');
      setAddCardExpiry('');
    } catch (e) {
      toast.error('Could not add card');
    } finally {
      setAddCardSubmitting(false);
    }
  };

  return (
    <AppLayout>
      <div className="sticky top-0 z-40 glass safe-top">
        <div className="flex items-center gap-4 px-4 py-3">
          <motion.button
            onClick={() => navigate('/settings')}
            className="p-2 -ml-2"
            whileTap={{ scale: 0.9 }}
          >
            <ArrowLeft className="w-6 h-6 text-foreground" />
          </motion.button>
          <h1 className="text-xl font-bold text-foreground flex-1">Wallet</h1>
        </div>
      </div>

      <div className="px-4 py-6 space-y-6">
        {/* Add to Wallet - Apple Wallet style */}
        <motion.button
          type="button"
          onClick={() => setShowAddCard(true)}
          className="w-full flex items-center justify-center gap-3 py-5 rounded-2xl border-2 border-dashed border-primary/50 bg-primary/5 hover:bg-primary/10 transition-colors"
          whileTap={{ scale: 0.98 }}
        >
          <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center">
            <Plus className="w-6 h-6 text-primary" />
          </div>
          <div className="text-left">
            <p className="font-semibold text-foreground">Add to Wallet</p>
            <p className="text-sm text-muted-foreground">Add debit or credit card</p>
          </div>
        </motion.button>

        <p className="text-sm text-muted-foreground">
          Saved cards can be used when paying for classes, activities, and events. You can also save a card during checkout.
        </p>

        {cards.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 rounded-2xl border border-border bg-muted/30">
            <CreditCard className="w-12 h-12 text-muted-foreground mb-3" />
            <p className="font-medium text-foreground mb-1">No cards yet</p>
            <p className="text-sm text-muted-foreground text-center max-w-xs">
              Tap &quot;Add to Wallet&quot; above to add a debit or credit card.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-sm font-medium text-muted-foreground">Payment methods</p>
            {cards.map((card) => (
              <motion.div
                key={card.id}
                className="flex items-center gap-4 p-4 rounded-xl bg-card border border-border"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                  <CreditCard className="w-6 h-6 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-foreground capitalize">{card.brand || 'Card'}</p>
                  <p className="text-sm text-muted-foreground font-mono">
                    •••• {card.last4}  Expires {card.expiryMonth}/{card.expiryYear}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-muted-foreground hover:text-destructive shrink-0"
                  onClick={() => handleRemove(card.id)}
                >
                  <Trash2 className="w-5 h-5" />
                </Button>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Add debit or credit card dialog */}
      <Dialog open={showAddCard} onOpenChange={setShowAddCard}>
        <DialogContent className="max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle>Add debit or credit card</DialogTitle>
            <DialogDescription>
              Enter your card details. Only the last 4 digits and expiry are stored for display; full number is not saved.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Card number</Label>
              <Input
                placeholder="1234 5678 9012 3456"
                value={addCardNumber}
                onChange={(e) => setAddCardNumber(e.target.value.replace(/\D/g, '').replace(/(.{4})/g, '$1 ').trim())}
                maxLength={19}
                className="rounded-xl"
              />
            </div>
            <div className="space-y-2">
              <Label>Expiry (MM/YY)</Label>
              <Input
                placeholder="MM/YY"
                value={addCardExpiry}
                onChange={(e) => {
                  const v = e.target.value.replace(/\D/g, '');
                  setAddCardExpiry(v.length <= 2 ? v : v.slice(0, 2) + '/' + v.slice(2, 4));
                }}
                maxLength={5}
                className="rounded-xl"
              />
            </div>
            <div className="flex gap-2 pt-2">
              <Button variant="outline" className="flex-1" onClick={() => setShowAddCard(false)}>
                Cancel
              </Button>
              <Button className="flex-1" onClick={handleAddCard} disabled={addCardSubmitting}>
                {addCardSubmitting ? 'Adding...' : 'Add to Wallet'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!cardToRemove} onOpenChange={(open) => !open && setCardToRemove(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove card?</AlertDialogTitle>
            <AlertDialogDescription>
              This card will be removed from your wallet. You can add it again anytime.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmRemove} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AppLayout>
  );
}
