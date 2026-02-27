import { useNavigate } from 'react-router-dom';
import { Radio, ArrowLeft } from 'lucide-react';
import AppLayout from '@/components/layout/AppLayout';
import BottomNav from '@/components/layout/BottomNav';
import { Button } from '@/components/ui/button';

export default function LivePage() {
  const navigate = useNavigate();

  return (
    <AppLayout>
      <div className="sticky top-0 z-40 safe-top bg-background border-b border-border/50">
        <div className="px-4 py-3 flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="p-2 -ml-2 rounded-lg hover:bg-muted/50"
            aria-label="Back"
          >
            <ArrowLeft className="w-5 h-5 text-foreground" />
          </button>
          <h1 className="text-lg font-bold text-foreground">Live</h1>
        </div>
      </div>

      <div className="px-4 py-12 flex flex-col items-center justify-center text-center">
        <div className="w-20 h-20 rounded-full bg-red-500/10 flex items-center justify-center mb-6">
          <Radio className="w-10 h-10 text-red-500" />
        </div>
        <h2 className="text-xl font-bold text-foreground mb-2">Live streaming</h2>
        <p className="text-muted-foreground text-sm mb-6 max-w-xs">
          Start a live stream to share with your community. This feature will connect to your streaming setup.
        </p>
        <Button
          className="bg-red-500 hover:bg-red-600 text-white"
          onClick={() => navigate('/communities')}
        >
          <Radio className="w-4 h-4 mr-2" />
          Start live streaming
        </Button>
      </div>

      <BottomNav />
    </AppLayout>
  );
}
