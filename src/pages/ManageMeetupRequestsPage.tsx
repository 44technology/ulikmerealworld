import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, MapPin, MessageCircle, CheckCircle2, Clock, RefreshCw, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import AppLayout from '@/components/layout/AppLayout';
import BottomNav from '@/components/layout/BottomNav';
import UserAvatar from '@/components/ui/UserAvatar';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';

export type MeetupRequestStatus = 'approved' | 'pending' | 'changed';

export interface MeetupRequestItem {
  id: string;
  chatId: string;
  withPerson: { id: string; name: string; avatar?: string };
  venueName: string;
  status: MeetupRequestStatus;
  createdAt: string;
  /** If status is 'changed', optional note */
  changedNote?: string;
}

const STORAGE_KEY = 'ready_to_meet_requests';

function getStoredRequests(): MeetupRequestItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return getDefaultMockRequests();
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : getDefaultMockRequests();
  } catch {
    return getDefaultMockRequests();
  }
}

function getDefaultMockRequests(): MeetupRequestItem[] {
  return [
    {
      id: 'req-1',
      chatId: 'chat-1',
      withPerson: { id: 'user-1', name: 'Sarah M.', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150' },
      venueName: 'Panther Coffee, Wynwood',
      status: 'pending',
      createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: 'req-2',
      chatId: 'chat-1',
      withPerson: { id: 'user-2', name: 'James K.', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150' },
      venueName: 'Zuma Miami',
      status: 'approved',
      createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: 'req-3',
      chatId: 'chat-1',
      withPerson: { id: 'user-3', name: 'Emma W.', avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150' },
      venueName: 'Bayfront Park',
      status: 'changed',
      createdAt: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
      changedNote: 'Time moved to 3pm',
    },
  ];
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffHours = Math.floor(diffMs / (60 * 60 * 1000));
  const diffDays = Math.floor(diffMs / (24 * 60 * 60 * 1000));
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return d.toLocaleDateString();
}

const ManageMeetupRequestsPage = () => {
  const navigate = useNavigate();
  const [requests, setRequests] = useState<MeetupRequestItem[]>(getStoredRequests);
  const [activeTab, setActiveTab] = useState<MeetupRequestStatus>('pending');

  const byStatus = useMemo(() => {
    const approved: MeetupRequestItem[] = [];
    const pending: MeetupRequestItem[] = [];
    const changed: MeetupRequestItem[] = [];
    requests.forEach((r) => {
      if (r.status === 'approved') approved.push(r);
      else if (r.status === 'pending') pending.push(r);
      else changed.push(r);
    });
    return { approved, pending, changed };
  }, [requests]);

  const openChat = (chatId: string) => {
    navigate(`/chat?chatId=${chatId}`);
  };

  return (
    <AppLayout>
      <div className="min-h-screen flex flex-col pb-20">
        {/* Header */}
        <div className="sticky top-0 z-10 glass safe-top border-b border-border/50">
          <div className="flex items-center gap-3 px-4 py-3">
            <motion.button
              onClick={() => navigate('/profile')}
              className="p-2 -ml-2 rounded-lg hover:bg-muted/80"
              whileTap={{ scale: 0.95 }}
            >
              <ArrowLeft className="w-5 h-5 text-foreground" />
            </motion.button>
            <div className="flex-1">
              <h1 className="text-lg font-bold text-foreground">Ready to Meet</h1>
              <p className="text-xs text-muted-foreground">Manage your meetup requests</p>
            </div>
          </div>
        </div>

        <div className="flex-1 px-4 py-4">
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as MeetupRequestStatus)} className="w-full">
            <TabsList className="grid w-full grid-cols-3 rounded-xl bg-muted p-1 h-12 mb-4">
              <TabsTrigger value="pending" className="rounded-lg text-sm gap-1.5">
                <Clock className="w-4 h-4" />
                Pending
                {byStatus.pending.length > 0 && (
                  <span className="rounded-full bg-primary/20 px-1.5 py-0.5 text-xs font-medium text-primary">
                    {byStatus.pending.length}
                  </span>
                )}
              </TabsTrigger>
              <TabsTrigger value="approved" className="rounded-lg text-sm gap-1.5">
                <CheckCircle2 className="w-4 h-4" />
                Approved
              </TabsTrigger>
              <TabsTrigger value="changed" className="rounded-lg text-sm gap-1.5">
                <RefreshCw className="w-4 h-4" />
                Changed
              </TabsTrigger>
            </TabsList>

            <TabsContent value="pending" className="mt-0">
              <RequestList items={byStatus.pending} onOpenChat={openChat} />
            </TabsContent>
            <TabsContent value="approved" className="mt-0">
              <RequestList items={byStatus.approved} onOpenChat={openChat} />
            </TabsContent>
            <TabsContent value="changed" className="mt-0">
              <RequestList items={byStatus.changed} onOpenChat={openChat} />
            </TabsContent>
          </Tabs>
        </div>
      </div>
      <BottomNav />
    </AppLayout>
  );
};

function RequestList({
  items,
  onOpenChat,
}: {
  items: MeetupRequestItem[];
  onOpenChat: (chatId: string) => void;
}) {
  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-3">
          <MapPin className="w-8 h-8 text-muted-foreground" />
        </div>
        <p className="text-muted-foreground text-sm">No requests in this tab</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {items.map((req) => (
        <motion.button
          key={req.id}
          onClick={() => onOpenChat(req.chatId)}
          className="w-full flex items-center gap-3 p-4 rounded-2xl border border-border bg-card text-left hover:bg-muted/50 active:bg-muted transition-colors"
          whileTap={{ scale: 0.99 }}
        >
          <UserAvatar
            src={req.withPerson.avatar}
            alt={req.withPerson.name}
            size="md"
          />
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-foreground truncate">{req.withPerson.name}</p>
            <p className="text-sm text-muted-foreground flex items-center gap-1 truncate">
              <MapPin className="w-3.5 h-3.5 shrink-0" />
              {req.venueName}
            </p>
            {req.status === 'changed' && req.changedNote && (
              <p className="text-xs text-amber-600 dark:text-amber-400 mt-1">{req.changedNote}</p>
            )}
            <p className="text-xs text-muted-foreground mt-0.5">{formatDate(req.createdAt)}</p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <StatusBadge status={req.status} />
            <MessageCircle className="w-5 h-5 text-primary" />
            <ChevronRight className="w-5 h-5 text-muted-foreground" />
          </div>
        </motion.button>
      ))}
    </div>
  );
}

function StatusBadge({ status }: { status: MeetupRequestStatus }) {
  if (status === 'pending') {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 text-xs font-medium border border-amber-500/20">
        <Clock className="w-3 h-3" /> Pending
      </span>
    );
  }
  if (status === 'approved') {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-green-500/10 text-green-600 dark:text-green-400 text-xs font-medium border border-green-500/20">
        <CheckCircle2 className="w-3 h-3" /> Approved
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 text-xs font-medium border border-blue-500/20">
      <RefreshCw className="w-3 h-3" /> Changed
    </span>
  );
}

export default ManageMeetupRequestsPage;
