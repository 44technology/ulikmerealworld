import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Phone } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

type LoginStep = 'welcome' | 'phone' | 'complete';

/* Google G logo icon */
const GoogleIcon = ({ className }: { className?: string }) => (
  <svg className={className || 'w-5 h-5'} viewBox="0 0 24 24">
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
  </svg>
);

/* Facebook f logo icon */
const FacebookIcon = ({ className }: { className?: string }) => (
  <svg className={className || 'w-5 h-5'} viewBox="0 0 24 24" fill="#1877F2">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
  </svg>
);

const loginMethods = [
  { id: 'phone', label: 'Continue with Phone Number', icon: Phone },
  { id: 'google', label: 'Continue with Google', icon: GoogleIcon },
  { id: 'facebook', label: 'Continue with Facebook', icon: FacebookIcon },
];

const LoginPage = () => {
  const navigate = useNavigate();
  const { verifyOTP, loginWithGoogle } = useAuth();
  const [step, setStep] = useState<LoginStep>('welcome');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);

  const handleMethodSelect = async (methodId: string) => {
    if (methodId === 'google') {
      setLoading(true);
      try {
        await loginWithGoogle();
        toast.success('Signed in with Google!');
        setStep('complete');
        setTimeout(() => navigate('/home'), 1500);
      } catch (error: any) {
        toast.error(error.message || 'Google sign in failed');
      } finally {
        setLoading(false);
      }
    } else if (methodId === 'facebook') {
      toast.info('Facebook sign in coming soon.');
    } else if (methodId === 'phone') {
      setStep('phone');
    }
  };

  const handleSendOTP = async () => {
    if (!phone) {
      toast.error('Please enter your phone number');
      return;
    }
    setLoading(true);
    try {
      const formattedPhone = phone.startsWith('+') ? phone : `+1${phone.replace(/\D/g, '')}`;
      await verifyOTP(formattedPhone, '123456');
      toast.success('Signed in successfully!');
      setStep('complete');
      setTimeout(() => navigate('/home'), 1500);
    } catch (error: any) {
      console.error('Phone verification error:', error);
      toast.error(error.message || 'Failed to verify phone number');
    } finally {
      setLoading(false);
    }
  };

  /* Phone step: back + ULIKME header + form (matches your phone login design) */
  if (step === 'phone') {
    return (
      <div className="min-h-screen bg-white flex flex-col">
        <header className="flex items-center justify-center relative px-4 pt-12 pb-4">
          <button
            type="button"
            onClick={() => setStep('welcome')}
            className="absolute left-4 w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-700"
            aria-label="Back"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <span className="text-xl font-bold text-[#ED6C27]">ULIKME</span>
        </header>
        <div className="flex-1 px-6 flex flex-col">
          <p className="text-gray-500 text-center mb-1">To get started,</p>
          <p className="text-gray-900 text-center mb-6">please enter your phone number so I can help you sign in.</p>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-900 mb-2">Enter your Phone Number</label>
            <Input
              type="tel"
              placeholder="(303) 555-5555"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="h-12 rounded-xl border-gray-200"
              disabled={loading}
            />
            <p className="text-sm text-gray-500 mt-1">OTP will be sent to this number by SMS</p>
          </div>
          <Button
            onClick={handleSendOTP}
            disabled={loading || !phone}
            className="w-full h-12 rounded-xl bg-[#ED6C27] hover:bg-[#d95a1f] text-white text-base font-semibold"
          >
            {loading ? 'Verifying...' : 'Send OTP'}
          </Button>
        </div>
      </div>
    );
  }

  /* Complete: redirect overlay */
  if (step === 'complete') {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <p className="text-gray-600">Taking you to ULIKME...</p>
      </div>
    );
  }

  /* İlk ekran: tek statik giriş ekranı (satır satır / adım adım yok) */
  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden">
      {/* Arka plan: kalabalık görsel + koyu overlay */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: `linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.45)), url('https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=1200&q=80')`,
        }}
      />
      <div className="relative flex-1 flex flex-col items-center justify-center px-6 pt-12 pb-10 max-w-md mx-auto w-full">
        {/* Logo: beyaz kare, yumuşak köşeler, soldan sağa hafif mavi–turuncu gradient, içinde siyah U */}
        <div
          className="w-20 h-20 rounded-2xl flex items-center justify-center mb-4"
          style={{
            background: 'linear-gradient(to right, #b8daf0 0%, #ffffff 50%, #ffdfb8 100%)',
            boxShadow: '0 4px 14px rgba(0,0,0,0.12)',
          }}
        >
          <span className="text-4xl font-black text-black leading-none">U</span>
        </div>

        {/* ULIKME */}
        <h1 className="text-4xl font-extrabold text-white uppercase tracking-tight mb-8">
          ULIKME
        </h1>

        {/* Sign in to your Account – tek blok, Account daha büyük ve kalın */}
        <div className="text-center mb-2">
          <p className="text-white text-lg">Sign in to your</p>
          <p className="text-white text-2xl font-bold">Account</p>
        </div>
        <p className="text-white/90 text-sm mb-8">
          Choose how you&apos;d like to get started
        </p>

        {/* Üç buton: beyaz, yuvarlatılmış, açık gri yazı, hafif gölge */}
        <div className="w-full space-y-3">
          {loginMethods.map((method) => {
            const Icon = method.icon;
            return (
              <button
                key={method.id}
                type="button"
                onClick={() => handleMethodSelect(method.id)}
                disabled={loading}
                className="w-full flex items-center justify-center gap-3 py-4 px-4 rounded-xl bg-white text-gray-600 font-medium hover:bg-gray-50 active:scale-[0.99] transition-colors disabled:opacity-60 shadow-md"
              >
                <Icon className="w-5 h-5 shrink-0" />
                <span>{method.label}</span>
              </button>
            );
          })}
        </div>

        {/* Sign up link */}
        <p className="mt-8 text-center text-white/90 text-sm">
          Don&apos;t have an account?{' '}
          <button
            type="button"
            onClick={() => navigate('/onboarding')}
            className="font-semibold text-white underline underline-offset-2 hover:no-underline"
          >
            Sign up
          </button>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
