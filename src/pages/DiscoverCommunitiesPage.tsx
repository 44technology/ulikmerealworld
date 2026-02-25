import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Search, Users, ArrowLeft, Check, Clock } from 'lucide-react';
import AppLayout from '@/components/layout/AppLayout';
import BottomNav from '@/components/layout/BottomNav';
import { useCommunities, getUserCommunityIds, hasUserRequestedCommunity, getCommunityIdsWithPendingRequest } from '@/hooks/useCommunities';
import type { Community } from '@/hooks/useCommunities';
import { useAuth } from '@/contexts/AuthContext';

const LANGUAGES = ['All', 'English', 'Spanish', 'French', 'German', 'Other'];
const AREAS = ['All', 'Startup', 'Wellness', 'Design', 'Language', 'Photography', 'Business', 'Tech', 'Creative'];

export default function DiscoverCommunitiesPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [languageFilter, setLanguageFilter] = useState<string>('All');
  const [areaFilter, setAreaFilter] = useState<string>('All');

  const { data: communities = [], isLoading } = useCommunities();
  const myCommunityIds = useMemo(() => new Set(getUserCommunityIds(user?.id || 'current-user')), [user?.id]);
  const pendingRequestCommunityIds = useMemo(() => new Set(getCommunityIdsWithPendingRequest(user?.id)), [user?.id]);

  const filteredCommunities = useMemo(() => {
    return communities.filter((c: Community) => {
      const matchesSearch =
        !searchQuery.trim() ||
        c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (c.description ?? '').toLowerCase().includes(searchQuery.toLowerCase());
      const matchesLanguage =
        languageFilter === 'All' || !c.language || c.language === languageFilter;
      const matchesArea =
        areaFilter === 'All' || !c.category || c.category === areaFilter;
      return matchesSearch && matchesLanguage && matchesArea;
    });
  }, [communities, searchQuery, languageFilter, areaFilter]);

  return (
    <AppLayout>
      <div className="sticky top-0 z-40 bg-background/95 backdrop-blur border-b border-border/50 safe-top">
        <div className="flex items-center gap-3 px-4 py-3">
          <motion.button
            onClick={() => navigate(-1)}
            className="p-2 -ml-2 shrink-0"
            whileTap={{ scale: 0.9 }}
          >
            <ArrowLeft className="w-5 h-5 text-foreground" />
          </motion.button>
          <h1 className="text-lg font-semibold text-foreground flex-1 truncate">Discover Communities</h1>
        </div>
        <div className="px-4 pb-3 space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search by name or description..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-10 pl-9 pr-3 rounded-xl bg-muted/80 border border-border/50 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
          <div>
            <p className="text-xs font-medium text-muted-foreground mb-1.5">Language</p>
            <div className="flex flex-wrap gap-1.5">
              {LANGUAGES.map((lang) => (
                <button
                  key={lang}
                  onClick={() => setLanguageFilter(lang)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    languageFilter === lang
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted/60 text-muted-foreground hover:bg-muted'
                  }`}
                >
                  {lang}
                </button>
              ))}
            </div>
          </div>
          <div>
            <p className="text-xs font-medium text-muted-foreground mb-1.5">Area</p>
            <div className="flex flex-wrap gap-1.5">
              {AREAS.map((area) => (
                <button
                  key={area}
                  onClick={() => setAreaFilter(area)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    areaFilter === area
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted/60 text-muted-foreground hover:bg-muted'
                  }`}
                >
                  {area}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 pb-6 pt-4">
        {isLoading ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Loading communities...</p>
          </div>
        ) : filteredCommunities.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-14 h-14 rounded-full bg-muted flex items-center justify-center mx-auto mb-3">
              <Users className="w-7 h-7 text-muted-foreground" />
            </div>
            <p className="text-muted-foreground font-medium mb-1">No communities found</p>
            <p className="text-sm text-muted-foreground">Try changing the search or filters</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {filteredCommunities.map((community: Community, index: number) => {
              const isJoined = myCommunityIds.has(community.id);
              const isPending = !isJoined && hasUserRequestedCommunity(user?.id, community.id);
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
                      {(community.language || community.category) && (
                        <p className="text-white/80 text-[10px] mt-1 truncate">
                          {[community.category, community.language].filter(Boolean).join(' · ')}
                        </p>
                      )}
                    </div>
                  </motion.button>
                  {isJoined && (
                    <div className="absolute top-2 right-2 w-8 h-8 rounded-full bg-primary shadow flex items-center justify-center">
                      <Check className="w-4 h-4 text-primary-foreground" />
                    </div>
                  )}
                  {isPending && (
                    <div className="absolute top-2 right-2 px-2 py-1 rounded-full bg-amber-500/90 text-white text-xs font-medium flex items-center gap-1 shadow">
                      <Clock className="w-3.5 h-3.5" />
                      Pending
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
