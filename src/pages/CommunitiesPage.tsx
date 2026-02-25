import { useState, useMemo, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Plus, Search, Users, MoreVertical, Check, ArrowLeft, Calendar, Clock, AlertCircle, Heart, MessageCircle, Send, X } from 'lucide-react';
import AppLayout from '@/components/layout/AppLayout';
import BottomNav from '@/components/layout/BottomNav';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/contexts/AuthContext';
import { useCommunities, getUserCommunityIds, hasUserRequestedCommunity, getCommunityIdsWithPendingRequest } from '@/hooks/useCommunities';
import { usePosts, useLikePost, useCommentPost, usePostComments, type Post as ApiPost } from '@/hooks/usePosts';
import CreatePostModal from '@/components/CreatePostModal';
import UserAvatar from '@/components/ui/UserAvatar';
import { toast } from 'sonner';

type FilterTab = 'all' | 'joined' | 'pending';
type MainTab = 'feed' | 'communities';

function isVideoUrl(url: string): boolean {
  return /\.(mp4|webm|mov|m4v)(\?|$)/i.test(url) || url.includes('/video/');
}

export default function CommunitiesPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { user, isAuthenticated } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterTab, setFilterTab] = useState<FilterTab>('all');
  const [mainTab, setMainTab] = useState<MainTab>(() => {
    const tab = searchParams.get('tab');
    if (tab === 'communities') return 'communities';
    return 'feed'; // default: show Feed first (post feed with like/comment)
  });
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [likedPosts, setLikedPosts] = useState<Record<string, boolean>>({});
  const [showComments, setShowComments] = useState(false);
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null);
  const [commentText, setCommentText] = useState('');

  const { data: communities = [], isLoading } = useCommunities();
  const { data: feedPosts = [], isLoading: postsLoading } = usePosts();
  const likePost = useLikePost();
  const commentPost = useCommentPost();
  const { data: comments, isLoading: commentsLoading } = usePostComments(selectedPostId || '');

  useEffect(() => {
    const tab = searchParams.get('tab');
    setMainTab(tab === 'communities' ? 'communities' : 'feed');
  }, [searchParams]);

  // Sync URL with default Feed when no tab param
  useEffect(() => {
    if (!searchParams.get('tab') && mainTab === 'feed') {
      setSearchParams({ tab: 'feed' }, { replace: true });
    }
  }, []);

  const setMainTabAndUrl = (tab: MainTab) => {
    setMainTab(tab);
    setSearchParams(tab === 'feed' ? { tab: 'feed' } : { tab: 'communities' }, { replace: true });
  };

  const myCommunityIds = useMemo(() => new Set(getUserCommunityIds(user?.id || 'current-user')), [user?.id]);
  const pendingRequestCommunityIds = useMemo(
    () => new Set(getCommunityIdsWithPendingRequest(user?.id)),
    [user?.id]
  );

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
    if (filterTab === 'pending') return filteredBySearch.filter(c => pendingRequestCommunityIds.has(c.id));
    return filteredBySearch;
  }, [filterTab, filteredBySearch, myCommunityIds, pendingRequestCommunityIds]);

  return (
    <AppLayout>
      {/* Header */}
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
            {mainTab === 'feed' ? (
              <motion.button
                onClick={() => setShowCreatePost(true)}
                className="p-2 rounded-full bg-primary text-primary-foreground"
                whileTap={{ scale: 0.9 }}
                aria-label="New post"
              >
                <Plus className="w-5 h-5" />
              </motion.button>
            ) : (
              <motion.button
                onClick={() => navigate('/create-community')}
                className="p-2 rounded-full bg-primary text-primary-foreground"
                whileTap={{ scale: 0.9 }}
              >
                <Plus className="w-5 h-5" />
              </motion.button>
            )}
            <motion.button className="p-2" whileTap={{ scale: 0.9 }}>
              <MoreVertical className="w-5 h-5 text-foreground" />
            </motion.button>
          </div>
        </div>
        {/* Main tabs: Feed | Communities */}
        <div className="px-4 pb-2">
          <div className="flex gap-1 p-1 bg-muted/60 rounded-xl">
            <button
              onClick={() => setMainTabAndUrl('feed')}
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
                mainTab === 'feed' ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground'
              }`}
            >
              Feed
            </button>
            <button
              onClick={() => setMainTabAndUrl('communities')}
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
                mainTab === 'communities' ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground'
              }`}
            >
              Communities
            </button>
          </div>
        </div>
        {mainTab === 'communities' && (
          <>
            <div className="px-4 pb-2 flex items-center justify-between gap-2">
              <p className="text-sm text-muted-foreground">
                {filterTab === 'joined'
                  ? `${filteredCommunities.length} joined`
                  : filterTab === 'pending'
                    ? `${filteredCommunities.length} pending approval`
                    : `${filteredCommunities.length} communities`}
              </p>
              <motion.button
                onClick={() => navigate('/discover-communities')}
                className="text-sm font-medium text-primary hover:underline shrink-0"
                whileTap={{ scale: 0.98 }}
              >
                Discover
              </motion.button>
            </div>
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
                <button
                  onClick={() => setFilterTab('pending')}
                  className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-1 ${
                    filterTab === 'pending' ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground'
                  }`}
                >
                  Pending
                  {pendingRequestCommunityIds.size > 0 && (
                    <span className={`min-w-[18px] h-[18px] rounded-full flex items-center justify-center text-xs ${filterTab === 'pending' ? 'bg-primary-foreground/20 text-primary-foreground' : 'bg-primary text-primary-foreground'}`}>
                      {pendingRequestCommunityIds.size}
                    </span>
                  )}
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      <div className="px-4 pb-6 pt-2">
        {mainTab === 'feed' ? (
          <>
            {postsLoading ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">Loading posts...</p>
              </div>
            ) : feedPosts.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-14 h-14 rounded-full bg-muted flex items-center justify-center mx-auto mb-3">
                  <MessageCircle className="w-7 h-7 text-muted-foreground" />
                </div>
                <p className="text-muted-foreground font-medium mb-1">No posts yet</p>
                <p className="text-sm text-muted-foreground mb-4">Share a photo or video to get started</p>
                <Button onClick={() => setShowCreatePost(true)} className="bg-primary text-primary-foreground">
                  <Plus className="w-4 h-4 mr-2" />
                  Create Post
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {feedPosts.map((post: ApiPost, index: number) => {
                  const displayName = post.user?.displayName || (post.user ? `${post.user.firstName} ${post.user.lastName}` : '');
                  const mediaUrl = post.image;
                  const isVideo = mediaUrl ? isVideoUrl(mediaUrl) : false;
                  return (
                    <motion.article
                      key={post.id}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.03 }}
                      className="rounded-2xl border border-border bg-card overflow-hidden"
                    >
                      <div className="p-3 flex items-center gap-3">
                        <button
                          type="button"
                          onClick={() => post.user?.id && navigate(`/user/${post.user.id}`)}
                          className="flex items-center gap-3 shrink-0"
                        >
                          <UserAvatar src={post.user?.avatar} alt={displayName} size="sm" />
                          <div className="text-left">
                            <p className="font-semibold text-foreground text-sm">{displayName}</p>
                            <p className="text-xs text-muted-foreground">
                              {post.createdAt ? new Date(post.createdAt).toLocaleDateString(undefined, { dateStyle: 'short' }) : ''}
                            </p>
                          </div>
                        </button>
                      </div>
                      {post.content && (
                        <div className="px-3 pb-2">
                          <p className="text-sm text-foreground">{post.content}</p>
                        </div>
                      )}
                      {mediaUrl && (
                        <div className="aspect-[4/3] max-h-80 bg-muted relative">
                          {isVideo ? (
                            <video
                              src={mediaUrl}
                              controls
                              playsInline
                              className="w-full h-full object-contain"
                            />
                          ) : (
                            <img src={mediaUrl} alt="" className="w-full h-full object-cover" />
                          )}
                        </div>
                      )}
                      <div className="p-3 flex items-center gap-4 text-muted-foreground">
                        <button
                          onClick={async () => {
                            if (!isAuthenticated) {
                              toast.error('Please login to like');
                              return;
                            }
                            try {
                              await likePost.mutateAsync(post.id);
                              setLikedPosts((prev) => ({ ...prev, [post.id]: !prev[post.id] }));
                            } catch (e: any) {
                              toast.error(e?.message || 'Failed to like');
                            }
                          }}
                          className="flex items-center gap-1.5 hover:text-foreground"
                        >
                          <Heart className={`w-4 h-4 ${likedPosts[post.id] ? 'fill-red-500 text-red-500' : ''}`} />
                          <span className="text-sm">{post._count?.likes ?? 0}</span>
                        </button>
                        <button
                          onClick={() => {
                            setSelectedPostId(post.id);
                            setShowComments(true);
                          }}
                          className="flex items-center gap-1.5 hover:text-foreground"
                        >
                          <MessageCircle className="w-4 h-4" />
                          <span className="text-sm">{post._count?.comments ?? 0}</span>
                        </button>
                      </div>
                    </motion.article>
                  );
                })}
              </div>
            )}
            <CreatePostModal
              open={showCreatePost}
              onOpenChange={setShowCreatePost}
              onSuccess={() => setShowCreatePost(false)}
            />
            {showComments && (
              <div className="fixed inset-0 z-50 flex flex-col bg-background" role="dialog" aria-label="Comments">
                <div className="flex items-center justify-between p-4 border-b border-border">
                  <h2 className="text-lg font-semibold text-foreground">Comments</h2>
                  <button onClick={() => { setShowComments(false); setSelectedPostId(null); setCommentText(''); }} className="p-2 rounded-full hover:bg-muted">
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <div className="overflow-y-auto p-4 space-y-4 flex-1 min-h-0">
                  {commentsLoading ? (
                    <p className="text-muted-foreground text-sm">Loading...</p>
                  ) : comments?.length ? (
                    comments.map((c: any) => (
                      <div key={c.id} className="flex gap-3">
                        <UserAvatar src={c.user?.avatar} alt={c.user?.displayName} size="sm" />
                        <div>
                          <p className="text-sm font-medium text-foreground">
                            {c.user?.displayName || `${c.user?.firstName} ${c.user?.lastName}`}
                          </p>
                          <p className="text-sm text-muted-foreground">{c.content}</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground">No comments yet.</p>
                  )}
                </div>
                {isAuthenticated && (
                  <div className="p-4 border-t border-border flex gap-2">
                    <Input
                      value={commentText}
                      onChange={(e) => setCommentText(e.target.value)}
                      placeholder="Add a comment..."
                      className="flex-1"
                    />
                    <Button
                      size="sm"
                      onClick={async () => {
                        if (!selectedPostId || !commentText.trim()) return;
                        try {
                          await commentPost.mutateAsync({ postId: selectedPostId, content: commentText.trim() });
                          setCommentText('');
                          toast.success('Comment added');
                        } catch (e: any) {
                          toast.error(e?.message || 'Failed to comment');
                        }
                      }}
                      disabled={!commentText.trim() || commentPost.isPending}
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>
            )}
          </>
        ) : isLoading ? (
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
              {filterTab === 'pending'
                ? 'You have no pending join requests. Request to join a community to see it here.'
                : searchQuery || filterTab === 'joined'
                  ? 'Try changing filter or search'
                  : 'Create your first community'}
            </p>
            {!searchQuery && filterTab === 'all' && (
              <Button onClick={() => navigate('/create-community')} className="bg-primary text-primary-foreground">
                <Plus className="w-4 h-4 mr-2" />
                Create Community
              </Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {filteredCommunities.map((community, index) => {
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
