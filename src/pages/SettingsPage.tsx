import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Bell, Shield, HelpCircle, LogOut, Trash2, User, Mail, Phone, Globe, Calendar, Megaphone, DollarSign, CheckCircle2, Wallet } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import AppLayout from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { toast } from 'sonner';
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

const AD_FREE_PRICE = 19.99;

const SettingsPage = () => {
  const navigate = useNavigate();
  const { logout, user, updateUser } = useAuth();
  const { language, setLanguage, t } = useLanguage();
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showLanguageDialog, setShowLanguageDialog] = useState(false);
  const [showAdFreeDialog, setShowAdFreeDialog] = useState(false);
  const [adFreePurchasing, setAdFreePurchasing] = useState(false);

  const handleLogout = () => {
    logout();
    toast.success(t('loggedOutSuccess'));
    navigate('/');
  };

  const handleDeleteAccount = () => {
    // TODO: Implement account deletion
    toast.error(t('accountDeletionNotImplemented'));
    setShowDeleteDialog(false);
  };

  const handleLanguageChange = (lang: 'en' | 'es') => {
    setLanguage(lang);
    setShowLanguageDialog(false);
    toast.success(lang === 'es' ? t('languageChangedEs') : t('languageChangedEn'));
  };

  const handleRequestAdFree = () => {
    setShowAdFreeDialog(true);
  };

  const handlePurchaseAdFree = async () => {
    setAdFreePurchasing(true);
    try {
      // Simulate payment; in production call payment API then update user
      await new Promise((r) => setTimeout(r, 800));
      await updateUser({ adFree: true });
      setShowAdFreeDialog(false);
      toast.success(t('adFreeSuccess'));
    } catch (e) {
      toast.error(t('paymentFailed'));
    } finally {
      setAdFreePurchasing(false);
    }
  };

  const settingsSections = [
    {
      title: t('account'),
      items: [
        { icon: User, label: t('editProfile'), onClick: () => navigate('/profile') },
        { icon: Wallet, label: 'Wallet', onClick: () => navigate('/settings/wallet') },
        { icon: Mail, label: t('emailSettings'), onClick: () => toast.info('Coming soon') },
        { icon: Phone, label: t('phoneNumber'), onClick: () => toast.info('Coming soon') },
        { icon: Globe, label: t('language'), onClick: () => setShowLanguageDialog(true) },
      ],
    },
    {
      title: t('privacy'),
      items: [
        { icon: Shield, label: t('privacySettings'), onClick: () => toast.info('Coming soon') },
        { icon: Bell, label: t('notifications'), onClick: () => toast.info('Coming soon') },
      ],
    },
    {
      title: t('support'),
      items: [
        { icon: HelpCircle, label: t('helpCenter'), onClick: () => toast.info('Coming soon') },
        { icon: Mail, label: t('contactUs'), onClick: () => toast.info('Coming soon') },
      ],
    },
  ];

  return (
    <AppLayout>
      {/* Header */}
      <div className="sticky top-0 z-40 glass safe-top">
        <div className="flex items-center gap-4 px-4 py-3">
          <motion.button
            onClick={() => navigate('/home')}
            className="p-2 -ml-2"
            whileTap={{ scale: 0.9 }}
          >
            <ArrowLeft className="w-6 h-6 text-foreground" />
          </motion.button>
          <h1 className="text-xl font-bold text-foreground flex-1">{t('settings')}</h1>
          <div className="w-10" />
        </div>
      </div>

      <div className="px-4 py-4 space-y-6">
        {/* User Info */}
        {user && (
          <div className="card-elevated p-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <User className="w-6 h-6 text-primary" />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-foreground">
                  {user.displayName || `${user.firstName} ${user.lastName}`}
                </p>
                <p className="text-sm text-muted-foreground">
                  {user.email || user.phone}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Ads Section: Show ads (free) or Ad-free (paid $19.99) */}
        <div>
          <h3 className="text-sm font-semibold text-muted-foreground mb-2 px-2">{t('ads')}</h3>
          <div className="space-y-1">
            {user?.adFree ? (
              <div className="w-full p-4 rounded-xl bg-card flex items-center justify-between border border-green-500/20 bg-green-500/5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-green-500/20 flex items-center justify-center">
                    <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">{t('adFreeExperience')}</p>
                    <p className="text-xs text-muted-foreground">{t('adFreeExperienceDesc')}</p>
                  </div>
                </div>
              </div>
            ) : (
              <motion.div
                className="w-full p-4 rounded-xl bg-card flex items-center justify-between"
                whileTap={{ scale: 0.98 }}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center">
                    <Megaphone className="w-5 h-5 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">{t('showAds')}</p>
                    <p className="text-xs text-muted-foreground">{t('showAdsDesc')}</p>
                  </div>
                </div>
                <motion.button
                  onClick={handleRequestAdFree}
                  className="text-primary text-sm font-medium whitespace-nowrap"
                  whileTap={{ scale: 0.95 }}
                >
                  {t('goAdFree')}
                </motion.button>
              </motion.div>
            )}
          </div>
        </div>

        {/* Settings Sections */}
        {settingsSections.map((section, sectionIndex) => (
          <div key={section.title}>
            <h3 className="text-sm font-semibold text-muted-foreground mb-2 px-2">
              {section.title}
            </h3>
            <div className="space-y-1">
              {section.items.map((item, itemIndex) => {
                const Icon = item.icon;
                return (
                  <motion.button
                    key={item.label}
                    onClick={item.onClick}
                    className="w-full p-4 rounded-xl bg-card flex items-center justify-between"
                    whileTap={{ scale: 0.98 }}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: (sectionIndex * 0.1) + (itemIndex * 0.05) }}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className="w-5 h-5 text-primary" />
                      <span className="font-medium text-foreground">{item.label}</span>
                    </div>
                    <ArrowLeft className="w-5 h-5 text-muted-foreground rotate-180" />
                  </motion.button>
                );
              })}
            </div>
          </div>
        ))}

        {/* Danger Zone */}
        <div>
          <h3 className="text-sm font-semibold text-muted-foreground mb-2 px-2">
            {t('dangerZone')}
          </h3>
          <div className="space-y-1">
            <motion.button
              onClick={() => setShowLogoutDialog(true)}
              className="w-full p-4 rounded-xl bg-card flex items-center justify-between border-2 border-destructive/20"
              whileTap={{ scale: 0.98 }}
            >
              <div className="flex items-center gap-3">
                <LogOut className="w-5 h-5 text-destructive" />
                <span className="font-medium text-foreground">{t('logOut')}</span>
              </div>
              <ArrowLeft className="w-5 h-5 text-muted-foreground rotate-180" />
            </motion.button>

            <motion.button
              onClick={() => setShowDeleteDialog(true)}
              className="w-full p-4 rounded-xl bg-card flex items-center justify-between border-2 border-destructive/20"
              whileTap={{ scale: 0.98 }}
            >
              <div className="flex items-center gap-3">
                <Trash2 className="w-5 h-5 text-destructive" />
                <span className="font-medium text-destructive">{t('deleteAccount')}</span>
              </div>
              <ArrowLeft className="w-5 h-5 text-muted-foreground rotate-180" />
            </motion.button>
          </div>
        </div>
      </div>

      {/* Logout Dialog */}
      <AlertDialog open={showLogoutDialog} onOpenChange={setShowLogoutDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('logOutTitle')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('logOutConfirm')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('cancel')}</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleLogout}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {t('logOut')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Account Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('deleteAccountTitle')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('deleteAccountConfirm')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('cancel')}</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteAccount}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {t('deleteAccount')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Ad-free purchase Dialog */}
      <Dialog open={showAdFreeDialog} onOpenChange={setShowAdFreeDialog}>
        <DialogContent className="max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Megaphone className="w-5 h-5 text-primary" />
              {t('goAdFreeTitle')}
            </DialogTitle>
            <DialogDescription>
              {t('goAdFreeDesc')}
            </DialogDescription>
          </DialogHeader>
          <div className="mt-4 p-4 rounded-xl bg-muted border border-border">
            <div className="flex items-center justify-between">
              <span className="font-medium text-foreground">{t('oneTimePayment')}</span>
              <span className="text-xl font-bold text-primary">$19.99</span>
            </div>
            <p className="text-xs text-muted-foreground mt-2">{t('noSubscription')}</p>
          </div>
          <div className="mt-4 flex gap-3">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => setShowAdFreeDialog(false)}
              disabled={adFreePurchasing}
            >
              {t('cancel')}
            </Button>
            <Button
              className="flex-1 bg-gradient-primary"
              onClick={handlePurchaseAdFree}
              disabled={adFreePurchasing}
            >
              {adFreePurchasing ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 rounded-full border-2 border-primary-foreground border-t-transparent animate-spin" />
                  {t('processing')}
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <DollarSign className="w-4 h-4" />
                  {t('payAmount')}
                </span>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Language Selection Dialog */}
      <Dialog open={showLanguageDialog} onOpenChange={setShowLanguageDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('language')}</DialogTitle>
            <DialogDescription>
              {t('selectLanguage')}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2 mt-4">
            <motion.button
              onClick={() => handleLanguageChange('en')}
              className={`w-full p-4 rounded-xl text-left transition-all ${
                language === 'en'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-foreground'
              }`}
              whileTap={{ scale: 0.98 }}
            >
              <div className="flex items-center justify-between">
                <span className="font-medium">{t('english')}</span>
                {language === 'en' && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="w-5 h-5 rounded-full bg-primary-foreground flex items-center justify-center"
                  >
                    <span className="text-primary text-xs">✓</span>
                  </motion.div>
                )}
              </div>
            </motion.button>
            <motion.button
              onClick={() => handleLanguageChange('es')}
              className={`w-full p-4 rounded-xl text-left transition-all ${
                language === 'es'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-foreground'
              }`}
              whileTap={{ scale: 0.98 }}
            >
              <div className="flex items-center justify-between">
                <span className="font-medium">{t('spanish')}</span>
                {language === 'es' && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="w-5 h-5 rounded-full bg-primary-foreground flex items-center justify-center"
                  >
                    <span className="text-primary text-xs">✓</span>
                  </motion.div>
                )}
              </div>
            </motion.button>
          </div>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
};

export default SettingsPage;
