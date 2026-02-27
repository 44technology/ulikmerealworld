import { useNavigate } from 'react-router-dom';
import { Bell, ArrowLeft, CheckCheck } from 'lucide-react';
import AppLayout from '@/components/layout/AppLayout';
import BottomNav from '@/components/layout/BottomNav';
import { Button } from '@/components/ui/button';
import { useNotifications, useMarkAllAsRead, type Notification } from '@/hooks/useNotifications';
import { useAuth } from '@/contexts/AuthContext';

export default function NotificationsPage() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { data: notificationsData, isLoading } = useNotifications(isAuthenticated);
  const markAllRead = useMarkAllAsRead();

  const list: Notification[] = notificationsData?.data ?? [];
  const unreadCount = notificationsData?.unreadCount ?? 0;

  return (
    <AppLayout>
      <div className="sticky top-0 z-40 safe-top bg-background border-b border-border/50">
        <div className="px-4 py-3 flex items-center justify-between">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="p-2 -ml-2 rounded-lg hover:bg-muted/50"
            aria-label="Back"
          >
            <ArrowLeft className="w-5 h-5 text-foreground" />
          </button>
          <h1 className="text-lg font-bold text-foreground">Notifications</h1>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="text-accent text-sm"
              onClick={() => markAllRead.mutate()}
            >
              <CheckCheck className="w-4 h-4 mr-1" />
              Mark all read
            </Button>
          )}
          {unreadCount === 0 && <div className="w-16" />}
        </div>
      </div>

      <div className="px-4 py-4 pb-24">
        {isLoading ? (
          <div className="text-center py-12 text-muted-foreground text-sm">Loading...</div>
        ) : list.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
              <Bell className="w-8 h-8 text-muted-foreground" />
            </div>
            <p className="font-medium text-foreground">No notifications yet</p>
            <p className="text-sm text-muted-foreground mt-1">When you get updates, they’ll show up here.</p>
          </div>
        ) : (
          <div className="space-y-0 divide-y divide-border">
            {list.map((n) => (
              <button
                key={n.id}
                type="button"
                className={`w-full text-left px-0 py-4 hover:bg-muted/30 transition-colors ${!n.read ? 'bg-muted/20' : ''}`}
              >
                <p className="font-medium text-foreground">{n.title}</p>
                <p className="text-sm text-muted-foreground mt-0.5">{n.message}</p>
                <p className="text-xs text-muted-foreground mt-2">
                  {n.createdAt ? new Date(n.createdAt).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' }) : ''}
                </p>
              </button>
            ))}
          </div>
        )}
      </div>

      <BottomNav />
    </AppLayout>
  );
}
