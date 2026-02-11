import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Search, MessageCircle, MapPin, MoreVertical } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import AppLayout from '@/components/layout/AppLayout';
import BottomNav from '@/components/layout/BottomNav';
import UserAvatar from '@/components/ui/UserAvatar';
import { useUser } from '@/hooks/useUsers';
import { useMatches } from '@/hooks/useMatches';
import { toast } from 'sonner';

const UserConnectionsPage = () => {
  const navigate = useNavigate();
  const { userId } = useParams<{ userId: string }>();
  const { data: user } = useUser(userId);
  const { data: connections } = useMatches('ACCEPTED');
  const [searchQuery, setSearchQuery] = useState('');

  const userConnections = connections || [];
  const filteredConnections = userConnections.filter(match => {
    const u = match?.user;
    if (!u) return false;
    const q = searchQuery.toLowerCase();
    const displayName = (u.displayName ?? '').toLowerCase();
    const firstName = (u.firstName ?? '').toLowerCase();
    const lastName = (u.lastName ?? '').toLowerCase();
    return !q || displayName.includes(q) || firstName.includes(q) || lastName.includes(q);
  });

  const displayName = user?.displayName || user?.firstName || 'User';

  return (
    <AppLayout>
      {/* Header - Your Friends style */}
      <div className="sticky top-0 z-40 bg-background/95 backdrop-blur border-b border-border/50 safe-top">
        <div className="flex items-center justify-between px-4 py-3">
          <motion.button onClick={() => navigate(`/user/${userId}`)} className="p-2 -ml-2" whileTap={{ scale: 0.9 }}>
            <ArrowLeft className="w-5 h-5 text-foreground" />
          </motion.button>
          <h1 className="text-lg font-semibold text-foreground">{displayName}'s Connections</h1>
          <motion.button className="p-2" whileTap={{ scale: 0.9 }} onClick={() => toast.info('Menu coming soon')}>
            <MoreVertical className="w-5 h-5 text-foreground" />
          </motion.button>
        </div>
        <div className="px-4 pb-2">
          <p className="text-sm text-muted-foreground">{filteredConnections.length} connections</p>
        </div>
        <div className="px-4 pb-3">
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
      </div>

      <div className="px-4 pb-6 pt-2">
        {filteredConnections.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No connections yet</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
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
                    onClick={(e) => { e.stopPropagation(); navigate(`/chat?userId=${u.id}`); }}
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
      </div>

      <BottomNav />
    </AppLayout>
  );
};

export default UserConnectionsPage;
