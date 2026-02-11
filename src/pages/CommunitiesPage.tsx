import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Users, MoreVertical, Check, ArrowLeft, Calendar } from 'lucide-react';
import AppLayout from '@/components/layout/AppLayout';
import BottomNav from '@/components/layout/BottomNav';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useCommunities, getUserCommunityIds } from '@/hooks/useCommunities';

type FilterTab = 'all' | 'joined';

export default function CommunitiesPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterTab, setFilterTab] = useState<FilterTab>('all');
  const { data: communities = [], isLoading } = useCommunities();

  const myCommunityIds = useMemo(() => new Set(getUserCommunityIds(user?.id || 'current-user')), [user?.id]);

  const filteredBySearch = useMemo(
    () =>
      communities.filter(
        c =>
          c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (c.description ?? '').toLowerCase().includes(searchQuery.toLowerCase())
      ),
    [communities, searchQuery]
  );

  const filteredCommunities = useMemo(() => {
    if (filterTab === 'joined') return filteredBySearch.filter(c => myCommunityIds.has(c.id));
    return filteredBySearch;
  }, [filterTab, filteredBySearch, myCommunityIds]);

  return (
    <AppLayout>
      {/* Header - Your Friends style */}
      <div className="sticky top-0 z-40 bg-background/95 backdrop-blur border-b border-border/50 safe-top">
        <div className="flex items-center justify-between gap-3 px-4 py-3">
          <motion.button
            onClick={() => navigate('/home')}
            className="p-2 -ml-2 shrink-0"
            whileTap={{ scale: 0.9 }}
          >
            <ArrowLeft className="w-5 h-5 text-foreground" />
          </motion.button>
          <h1 className="text-lg font-semibold text-foreground flex-1 truncate">Communities</h1>
          <div className="flex items-center gap-2 shrink-0">
            <motion.button
              onClick={() => navigate('/create-community')}
              className="p-2 rounded-full bg-primary text-primary-foreground"
              whileTap={{ scale: 0.9 }}
            >
              <Plus className="w-5 h-5" />
            </motion.button>
            <motion.button className="p-2" whileTap={{ scale: 0.9 }}>
              <MoreVertical className="w-5 h-5 text-foreground" />
            </motion.button>
          </div>
        </div>
        <div className="px-4 pb-2">
          <p className="text-sm text-muted-foreground">
            {filterTab === 'joined' ? `${filteredCommunities.length} joined` : `${filteredCommunities.length} communities`}
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
        {/* Tabs - All | Joined (mutual) */}
        <div className="px-4 pb-3">
          <div className="flex gap-1 p-1 bg-muted/60 rounded-xl">
            <button
              onClick={() => setFilterTab('all')}
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
                filterTab === 'all' ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilterTab('joined')}
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
                filterTab === 'joined' ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground'
              }`}
            >
              Joined
            </button>
          </div>
        </div>
      </div>

      <div className="px-4 pb-6 pt-2">
        {isLoading ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Loading...</p>
          </div>
        ) : filteredCommunities.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-14 h-14 rounded-full bg-muted flex items-center justify-center mx-auto mb-3">
              <Users className="w-7 h-7 text-muted-foreground" />
            </div>
            <p className="text-muted-foreground font-medium mb-1">No communities</p>
            <p className="text-sm text-muted-foreground mb-4">
              {searchQuery || filterTab === 'joined' ? 'Try changing filter or search' : 'Create your first community'}
            </p>
            {!searchQuery && filterTab === 'all' && (
              <Button onClick={() => navigate('/create-community')} className="bg-primary text-primary-foreground">
                <Plus className="w-4 h-4 mr-2" />
                Create Community
              </Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {filteredCommunities.map((community, index) => {
              const isJoined = myCommunityIds.has(community.id);
              const imgSrc = community.image || 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=400';
              return (
                <motion.div
                  key={community.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.03 }}
                  className="relative aspect-square rounded-2xl overflow-hidden bg-muted shadow-sm"
                >
                  <motion.button
                    onClick={() => navigate(`/community/${community.id}`)}
                    className="absolute inset-0 w-full h-full text-left"
                    whileTap={{ scale: 0.98 }}
                  >
                    <img src={imgSrc} alt={community.name} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />
                    <div className="absolute bottom-0 left-0 right-0 p-3">
                      <p className="font-semibold text-white truncate text-sm drop-shadow">{community.name}</p>
                      <p className="flex items-center gap-1 text-white/90 text-xs mt-0.5">
                        <Users className="w-3 h-3 flex-shrink-0" />
                        <span>{community.memberCount} members</span>
                      </p>
                    </div>
                  </motion.button>
                  {/* Sağ üst köşe işareti: Joined / Mutual */}
                  {isJoined && (
                    <div className="absolute top-2 right-2 w-8 h-8 rounded-full bg-primary shadow flex items-center justify-center">
                      <Check className="w-4 h-4 text-primary-foreground" />
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      <BottomNav />
    </AppLayout>
  );
}
