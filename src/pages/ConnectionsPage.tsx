import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Search, MessageCircle, UserMinus, UserPlus, Check, X, MapPin, MoreVertical } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import AppLayout from '@/components/layout/AppLayout';
import BottomNav from '@/components/layout/BottomNav';
import UserAvatar from '@/components/ui/UserAvatar';
import { Button } from '@/components/ui/button';
import { useMatches, useUpdateMatch } from '@/hooks/useMatches';
import { useCreateDirectChat } from '@/hooks/useChat';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';

const ConnectionsPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'connections' | 'pending' | 'requests'>('connections');

  // Fetch accepted matches (connections)
  const { data: acceptedMatches, isLoading: connectionsLoading } = useMatches('ACCEPTED');
  // Fetch pending matches (sent requests)
  const { data: pendingMatches, isLoading: pendingLoading } = useMatches('PENDING');
  // Fetch all matches to find received requests
  const { data: allMatches } = useMatches();
  
  const updateMatch = useUpdateMatch();
  const createDirectChat = useCreateDirectChat();

  // Filter received requests (where user is receiver and status is PENDING)
  const receivedRequests = allMatches?.filter(m => !m.isSender && m.status === 'PENDING') || [];

  const safeSearch = (u: { displayName?: string; firstName?: string; lastName?: string } | undefined, q: string) => {
    if (!u) return false;
    const qq = q.toLowerCase();
    return !qq || (u.displayName ?? '').toLowerCase().includes(qq) || (u.firstName ?? '').toLowerCase().includes(qq) || (u.lastName ?? '').toLowerCase().includes(qq);
  };

  const filteredConnections = (acceptedMatches || []).filter(match => safeSearch(match?.user, searchQuery));
  const filteredPending = (pendingMatches || []).filter(match => match?.isSender && safeSearch(match?.user, searchQuery));
  const filteredRequests = receivedRequests.filter(match => safeSearch(match?.user, searchQuery));

  const handleAcceptRequest = async (matchId: string) => {
    try {
      await updateMatch.mutateAsync({ matchId, status: 'ACCEPTED' });
      toast.success('Connection request accepted!');
    } catch (error: any) {
      toast.error(error.message || 'Failed to accept request');
    }
  };

  const handleRejectRequest = async (matchId: string) => {
    try {
      await updateMatch.mutateAsync({ matchId, status: 'REJECTED' });
      toast.success('Connection request rejected');
    } catch (error: any) {
      toast.error(error.message || 'Failed to reject request');
    }
  };

  const handleMessage = async (userId: string) => {
    try {
      const chat = await createDirectChat.mutateAsync(userId);
      navigate(`/chat?chatId=${chat.id}`);
    } catch (error: any) {
      toast.error(error.message || 'Failed to start chat');
    }
  };

  return (
    <AppLayout>
      {/* Header - Your Connections + count */}
      <div className="sticky top-0 z-40 bg-background/95 backdrop-blur border-b border-border/50 safe-top">
        <div className="flex items-center justify-between px-4 py-3">
          <motion.button onClick={() => navigate('/home')} className="p-2 -ml-2" whileTap={{ scale: 0.9 }}>
            <ArrowLeft className="w-5 h-5 text-foreground" />
          </motion.button>
          <h1 className="text-lg font-semibold text-foreground">Your Connections</h1>
          <motion.button className="p-2" whileTap={{ scale: 0.9 }} onClick={() => toast.info('Menu coming soon')}>
            <MoreVertical className="w-5 h-5 text-foreground" />
          </motion.button>
        </div>
        <div className="px-4 pb-2">
          <p className="text-sm text-muted-foreground">
            {activeTab === 'connections' && `${filteredConnections.length} connections`}
            {activeTab === 'pending' && `${filteredPending.length} sent — waiting for approval`}
            {activeTab === 'requests' && (filteredRequests.length > 0 ? 'Accept or reject connection requests' : 'No requests')}
          </p>
        </div>
        {/* Search */}
        <div className="px-4 pb-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-10 pl-9 pr-3 rounded-xl bg-muted/80 border border-border/50 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
        </div>
        {/* Tabs - pill style */}
        <div className="px-4 pb-3">
          <div className="flex gap-1 p-1 bg-muted/60 rounded-xl">
            <button
              onClick={() => setActiveTab('connections')}
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'connections' ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setActiveTab('pending')}
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'pending' ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground'
              }`}
            >
              Pending
            </button>
            <button
              onClick={() => setActiveTab('requests')}
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all relative ${
                activeTab === 'requests' ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground'
              }`}
            >
              Approve
              {receivedRequests.length > 0 && (
                <span className="absolute top-1 right-2 min-w-[18px] h-[18px] px-1 rounded-full bg-red-500 text-white text-[10px] flex items-center justify-center font-bold">
                  {receivedRequests.length}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>

      <div className="px-4 pb-6">
        {activeTab === 'connections' && (
          <>
            {connectionsLoading ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">Loading...</p>
              </div>
            ) : filteredConnections.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No connections yet</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3 pt-2">
                {filteredConnections.map((match, index) => {
                  const u = match?.user;
                  if (!u?.id) return null;
                  const name = u.displayName || [u.firstName, u.lastName].filter(Boolean).join(' ').trim() || 'User';
                  const location = (u as any).location || 'Nearby';
                  const imgSrc = u.avatar || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400';
                  return (
                    <motion.div
                      key={match.id}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.03 }}
                      className="relative aspect-[3/4] rounded-2xl overflow-hidden bg-muted shadow-sm"
                    >
                      <motion.button
                        onClick={() => navigate(`/user/${u.id}`)}
                        className="absolute inset-0 w-full h-full text-left"
                        whileTap={{ scale: 0.98 }}
                      >
                        <img src={imgSrc} alt={name} className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />
                        <div className="absolute bottom-0 left-0 right-0 p-3">
                          <p className="font-semibold text-white truncate text-sm drop-shadow">{name}</p>
                          <p className="flex items-center gap-1 text-white/90 text-xs mt-0.5">
                            <MapPin className="w-3 h-3 flex-shrink-0" />
                            <span className="truncate">{location}</span>
                          </p>
                        </div>
                      </motion.button>
                      <motion.button
                        onClick={(e) => { e.stopPropagation(); handleMessage(u.id); }}
                        className="absolute top-2 right-2 w-8 h-8 rounded-full bg-white/90 shadow flex items-center justify-center text-primary"
                        whileTap={{ scale: 0.9 }}
                      >
                        <MessageCircle className="w-4 h-4" />
                      </motion.button>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </>
        )}

        {activeTab === 'pending' && (
          <>
            <p className="text-sm text-muted-foreground">
              {pendingLoading ? 'Loading...' : `${filteredPending.length} pending requests`}
            </p>
            
            {pendingLoading ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">Loading...</p>
              </div>
            ) : filteredPending.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No pending requests</p>
              </div>
            ) : (
              filteredPending.map((match, index) => {
                const u = match?.user;
                if (!u?.id) return null;
                const name = u.displayName || [u.firstName, u.lastName].filter(Boolean).join(' ').trim() || 'User';
                return (
                  <motion.div
                    key={match.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="rounded-xl border border-border/60 p-4 flex items-center gap-4"
                  >
                    <motion.button onClick={() => navigate(`/user/${u.id}`)} whileTap={{ scale: 0.95 }}>
                      <UserAvatar src={u.avatar || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150'} alt={name} size="lg" />
                    </motion.button>
                    <div className="flex-1 min-w-0">
                      <motion.button onClick={() => navigate(`/user/${u.id}`)} className="text-left w-full">
                        <h3 className="font-semibold text-foreground truncate">{name}</h3>
                        <p className="text-xs text-muted-foreground">
                          Request sent {formatDistanceToNow(new Date(match.createdAt), { addSuffix: true })}
                        </p>
                      </motion.button>
                    </div>
                    <div className="px-3 py-1.5 rounded-full bg-muted text-muted-foreground text-sm">Pending</div>
                  </motion.div>
                );
              })
            )}
          </>
        )}

        {activeTab === 'requests' && (
          <>
            {filteredRequests.length > 0 && (
              <p className="text-sm text-muted-foreground mb-2">
                These people want to connect with you. Accept to add them to your connections.
              </p>
            )}
            <p className="text-sm text-muted-foreground">
              {filteredRequests.length} request{filteredRequests.length !== 1 ? 's' : ''}
            </p>
            
            {filteredRequests.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No connection requests</p>
                <p className="text-xs text-muted-foreground mt-1">When someone sends you a request, it will appear here for you to approve.</p>
              </div>
            ) : (
              filteredRequests.map((match, index) => {
                const u = match?.user;
                if (!u?.id) return null;
                const name = u.displayName || [u.firstName, u.lastName].filter(Boolean).join(' ').trim() || 'User';
                return (
                  <motion.div
                    key={match.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="rounded-xl border border-border/60 p-4 flex items-center gap-4"
                  >
                    <motion.button onClick={() => navigate(`/user/${u.id}`)} whileTap={{ scale: 0.95 }}>
                      <UserAvatar src={u.avatar || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150'} alt={name} size="lg" />
                    </motion.button>
                    <div className="flex-1 min-w-0">
                      <motion.button onClick={() => navigate(`/user/${u.id}`)} className="text-left w-full">
                        <h3 className="font-semibold text-foreground truncate">{name}</h3>
                        <p className="text-xs text-muted-foreground">Wants to connect</p>
                      </motion.button>
                    </div>
                    <div className="flex gap-2">
                      <motion.button
                        className="p-2 rounded-full bg-destructive/10 text-destructive"
                        whileTap={{ scale: 0.9 }}
                        onClick={() => handleRejectRequest(match.id)}
                        disabled={updateMatch.isPending}
                      >
                        <X className="w-5 h-5" />
                      </motion.button>
                      <motion.button
                        className="p-2 rounded-full bg-primary/10 text-primary"
                        whileTap={{ scale: 0.9 }}
                        onClick={() => handleAcceptRequest(match.id)}
                        disabled={updateMatch.isPending}
                      >
                        <Check className="w-5 h-5" />
                      </motion.button>
                    </div>
                  </motion.div>
                );
              })
            )}
          </>
        )}
      </div>

      <BottomNav />
    </AppLayout>
  );
};

export default ConnectionsPage;
