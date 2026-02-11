import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, MessageCircle, Share2, MoreVertical, X, Plus, Sparkles, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import AppLayout from '@/components/layout/AppLayout';
import UserAvatar from '@/components/ui/UserAvatar';
import { Button } from '@/components/ui/button';
import CreatePostModal from '@/components/CreatePostModal';
import { usePosts, useLikePost, useCommentPost, usePostComments } from '@/hooks/usePosts';
import { useMatches } from '@/hooks/useMatches';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { useCreateDirectChat } from '@/hooks/useChat';
import { Input } from '@/components/ui/input';
import { Send, ExternalLink } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';

// Sponsor reels data (ads) - Vertical video format
const sponsorReels = [
  {
    id: 'sponsor-reel-1',
    type: 'sponsor',
    adType: 'reel',
    sponsorType: 'venue',
    name: 'Panther Coffee',
    avatar: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=150',
    content: 'Discover Miami\'s best coffee experience! ☕',
    image: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=800',
    link: 'https://panthercoffee.com',
    category: 'Café',
  },
  {
    id: 'sponsor-reel-2',
    type: 'sponsor',
    adType: 'reel',
    sponsorType: 'brand',
    name: 'Nike',
    avatar: 'https://logos-world.net/wp-content/uploads/2020/04/Nike-Logo.png',
    content: 'Just Do It. Find your perfect fit! 🏃‍♂️',
    image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800',
    link: 'https://nike.com',
    category: 'Sportswear',
  },
  {
    id: 'sponsor-reel-3',
    type: 'sponsor',
    adType: 'reel',
    sponsorType: 'venue',
    name: 'Zuma Miami',
    avatar: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=150',
    content: 'Experience authentic Japanese cuisine! 🍣',
    image: 'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=800',
    link: 'https://zumarestaurant.com',
    category: 'Restaurant',
  },
];

// Sponsor posts data (ads) - Square/Post format
const sponsorPosts = [
  {
    id: 'sponsor-post-1',
    type: 'sponsor',
    adType: 'post',
    sponsorType: 'brand',
    name: 'Coca-Cola',
    avatar: 'https://logos-world.net/wp-content/uploads/2020/04/Coca-Cola-Logo.png',
    content: 'Taste the Feeling! 🥤',
    image: 'https://images.unsplash.com/photo-1554866585-cd94860890b7?w=800',
    link: 'https://coca-cola.com',
    category: 'Beverage',
    likes: 0,
    comments: 0,
    time: 'Sponsored',
  },
  {
    id: 'sponsor-post-2',
    type: 'sponsor',
    adType: 'post',
    sponsorType: 'venue',
    name: 'Equinox South Beach',
    avatar: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=150',
    content: 'Transform your body and mind! 💪',
    image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800',
    link: 'https://equinox.com',
    category: 'Fitness',
    likes: 0,
    comments: 0,
    time: 'Sponsored',
  },
  {
    id: 'sponsor-post-3',
    type: 'sponsor',
    adType: 'post',
    sponsorType: 'brand',
    name: 'Adidas',
    avatar: 'https://logos-world.net/wp-content/uploads/2020/04/Adidas-Logo.png',
    content: 'Impossible is Nothing. 🏃‍♀️',
    image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800',
    link: 'https://adidas.com',
    category: 'Sportswear',
    likes: 0,
    comments: 0,
    time: 'Sponsored',
  },
  {
    id: 'sponsor-post-4',
    type: 'sponsor',
    adType: 'post',
    sponsorType: 'venue',
    name: 'Wynwood Walls',
    avatar: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=150',
    content: 'Explore Miami\'s vibrant street art scene! 🎨',
    image: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=800',
    link: 'https://wynwoodwalls.com',
    category: 'Art & Culture',
    likes: 0,
    comments: 0,
    time: 'Sponsored',
  },
];

// Mock data for posts (users and venues)
const posts = [
  {
    id: '1',
    type: 'user',
    user: { name: 'Sarah M.', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150' },
    venue: null,
    content: 'Amazing salsa night at La Bodeguita! 💃',
    image: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=800',
    likes: 142,
    comments: 23,
    time: '2h ago',
    commonInterests: ['Salsa', 'Dancing', 'Nightlife'],
  },
  {
    id: '2',
    type: 'venue',
    user: null,
    venue: { name: 'Panther Coffee', avatar: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=150' },
    content: 'New Colombian coffee beans just arrived! ☕',
    image: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=800',
    likes: 89,
    comments: 12,
    time: '5h ago',
    commonInterests: ['Coffee', 'Foodie'],
  },
  {
    id: '3',
    type: 'user',
    user: { name: 'Mike C.', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150' },
    venue: null,
    content: 'Tennis match was incredible! 🎾',
    image: 'https://images.unsplash.com/photo-1595435934249-5df7ed86e1c0?w=800',
    likes: 67,
    comments: 8,
    time: '8h ago',
    commonInterests: ['Tennis', 'Fitness', 'Sports'],
  },
  {
    id: '4',
    type: 'venue',
    user: null,
    venue: { name: 'Zuma Miami', avatar: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=150' },
    content: 'Join us for our special sushi night! 🍣',
    image: 'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=800',
    likes: 156,
    comments: 34,
    time: '12h ago',
    commonInterests: ['Japanese Cuisine', 'Foodie', 'Fine Dining'],
  },
];

const LifePage = () => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const { user, isAuthenticated } = useAuth();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [likedPosts, setLikedPosts] = useState<Record<string, boolean>>({});
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [activeTab, setActiveTab] = useState<'explore' | 'friends'>('explore');
  const [showComments, setShowComments] = useState(false);
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null);
  const [commentText, setCommentText] = useState('');
  const [showCommonInterestsModal, setShowCommonInterestsModal] = useState(false);
  const [commonInterestsModalPost, setCommonInterestsModalPost] = useState<{ name?: string; commonInterests: string[] } | null>(null);
  const [mediaModalPost, setMediaModalPost] = useState<any>(null);

  // Fetch posts from backend
  const { data: backendPosts, isLoading } = usePosts();
  const likePost = useLikePost();
  const commentPost = useCommentPost();
  const createDirectChat = useCreateDirectChat();
  
  // Fetch comments for selected post
  const { data: comments, isLoading: commentsLoading } = usePostComments(selectedPostId || '');
  
  // Fetch connections for Friends tab
  const { data: connections } = useMatches('ACCEPTED');
  const connectionIds = useMemo(() => {
    if (!connections || !user) return new Set<string>();
    return new Set(
      connections
        .map(match => match?.user?.id)
        .filter((id): id is string => Boolean(id))
    );
  }, [connections, user]);

  // Calculate common interests between current user and post user
  const getCommonInterests = (postUserInterests: string[] = []) => {
    if (!user?.interests || !postUserInterests || postUserInterests.length === 0) return [];
    return user.interests.filter(interest => postUserInterests.includes(interest));
  };

  // Use backend posts if available, otherwise use mock data
  const allBackendPosts = useMemo(() => {
    if (backendPosts && backendPosts.length > 0) {
      return backendPosts.map((p: any) => {
        const postUserInterests = p.user?.interests || [];
        const commonInterests = getCommonInterests(postUserInterests);
        
        return {
          id: p.id,
          type: p.venue ? 'venue' : 'user',
          user: p.user ? {
            id: p.user.id,
            name: p.user.displayName || `${p.user.firstName} ${p.user.lastName}`,
            avatar: p.user.avatar || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150',
            interests: postUserInterests,
          } : null,
          venue: p.venue ? {
            name: p.venue.name,
            avatar: p.venue.image || 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=150',
          } : null,
          content: p.content || '',
          image: p.image || 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=800',
          likes: p._count?.likes || 0,
          comments: p._count?.comments || 0,
          time: new Date(p.createdAt).toLocaleTimeString('en-US', { hour: 'numeric', minute: 'numeric' }),
          commonInterests,
        };
      });
    }
    return posts.map(p => {
      const postUserInterests = p.user?.commonInterests || [];
      const commonInterests = getCommonInterests(postUserInterests);
      return { 
        ...p, 
        user: p.user ? { id: p.user.name, ...p.user, interests: postUserInterests } : null,
        commonInterests,
      };
    });
  }, [backendPosts, user?.interests]);

  // Filter posts based on active tab and insert sponsor reels and posts every 3-5 posts (skip if user is ad-free)
  const allPosts = useMemo(() => {
    let filteredPosts: any[] = [];
    
    if (activeTab === 'friends') {
      filteredPosts = allBackendPosts.filter((p: any) => 
        p.user && connectionIds.has(p.user.id)
      );
    } else {
      filteredPosts = allBackendPosts;
    }

    if (user?.adFree) return filteredPosts;

    const allSponsors = [...sponsorReels, ...sponsorPosts];
    const postsWithSponsors: any[] = [];
    let sponsorIndex = 0;
    let lastSponsorPosition = -1;
    
    filteredPosts.forEach((post, index) => {
      postsWithSponsors.push(post);
      const shouldInsertSponsor = index > 0 && 
                                  index < filteredPosts.length - 1 &&
                                  (index - lastSponsorPosition >= 3) &&
                                  (Math.random() < 0.3 || (index + 1) % 4 === 0);
      if (shouldInsertSponsor && allSponsors.length > 0) {
        const sponsor = allSponsors[sponsorIndex % allSponsors.length];
        postsWithSponsors.push({ ...sponsor, isSponsored: true });
        sponsorIndex++;
        lastSponsorPosition = index;
      }
    });

    return postsWithSponsors;
  }, [allBackendPosts, activeTab, connectionIds, user?.adFree]);

  const currentPost = allPosts[currentIndex];

  const handleNext = () => {
    if (currentIndex < allPosts.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const toggleLike = async (postId: string) => {
    if (!isAuthenticated) {
      toast.error('Please login to like posts');
      return;
    }

    try {
      await likePost.mutateAsync(postId);
      setLikedPosts(prev => ({ ...prev, [postId]: !prev[postId] }));
    } catch (error: any) {
      toast.error(error.message || 'Failed to like post');
    }
  };

  const handleAddComment = async () => {
    if (!isAuthenticated) {
      toast.error('Please login to comment');
      return;
    }

    if (!commentText.trim() || !selectedPostId) {
      return;
    }

    try {
      await commentPost.mutateAsync({
        postId: selectedPostId,
        content: commentText.trim(),
      });
      setCommentText('');
      toast.success('Comment added!');
    } catch (error: any) {
      toast.error(error.message || 'Failed to add comment');
    }
  };

  // Vertical swipe detection (Instagram Reels style)
  useEffect(() => {
    let touchStartY = 0;
    let touchEndY = 0;
    let isScrolling = false;
    let lastWheelTime = 0;

    const handleTouchStart = (e: TouchEvent) => {
      touchStartY = e.touches[0].clientY;
      isScrolling = false;
    };

    const handleTouchMove = (e: TouchEvent) => {
      const currentY = e.touches[0].clientY;
      const diff = touchStartY - currentY;
      
      if (Math.abs(diff) > 10) {
        isScrolling = true;
      }
    };

    const handleTouchEnd = (e: TouchEvent) => {
      if (!isScrolling) return;
      
      touchEndY = e.changedTouches[0].clientY;
      const diff = touchStartY - touchEndY;
      const threshold = 50; // Minimum swipe distance
      
      if (Math.abs(diff) > threshold) {
        if (diff > 0) {
          // Swipe up - next post
          if (currentIndex < allPosts.length - 1) {
            setCurrentIndex(currentIndex + 1);
          }
        } else {
          // Swipe down - previous post
          if (currentIndex > 0) {
            setCurrentIndex(currentIndex - 1);
          }
        }
      }
    };

    // Mouse wheel support for desktop (throttled)
    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      const now = Date.now();
      if (now - lastWheelTime < 300) return; // Throttle to prevent rapid scrolling
      lastWheelTime = now;

      if (e.deltaY > 0) {
        // Scroll down - next post
        if (currentIndex < allPosts.length - 1) {
          setCurrentIndex(currentIndex + 1);
        }
      } else {
        // Scroll up - previous post
        if (currentIndex > 0) {
          setCurrentIndex(currentIndex - 1);
        }
      }
    };

    const container = document.querySelector('.life-container');
    if (container) {
      container.addEventListener('touchstart', handleTouchStart, { passive: true });
      container.addEventListener('touchmove', handleTouchMove, { passive: true });
      container.addEventListener('touchend', handleTouchEnd, { passive: true });
      container.addEventListener('wheel', handleWheel, { passive: false });
    }

    return () => {
      if (container) {
        container.removeEventListener('touchstart', handleTouchStart);
        container.removeEventListener('touchmove', handleTouchMove);
        container.removeEventListener('touchend', handleTouchEnd);
        container.removeEventListener('wheel', handleWheel);
      }
    };
  }, [currentIndex, allPosts.length]);

  if (isLoading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center min-h-[60vh] bg-background">
          <p className="text-muted-foreground">Loading posts...</p>
        </div>
      </AppLayout>
    );
  }

  if (!currentPost || allPosts.length === 0) {
    return (
      <AppLayout>
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
          <p className="text-foreground text-lg">No posts yet</p>
          <motion.button
            onClick={() => setShowCreatePost(true)}
            className="px-6 py-3 rounded-xl bg-primary text-primary-foreground"
            whileTap={{ scale: 0.95 }}
          >
            Create First Post
          </motion.button>
        </div>
      </AppLayout>
    );
  }

  // Desktop: Instagram web style — feed of cards (no full-screen swipe)
  if (!isMobile) {
    return (
      <AppLayout>
        <div className="min-h-screen bg-background">
          {/* Header */}
          <div className="sticky top-0 z-30 flex items-center justify-between border-b border-border bg-background/95 px-4 py-3 backdrop-blur">
            <div className="flex items-center gap-3 min-w-0">
              <motion.button
                onClick={() => navigate('/home')}
                className="p-2 -ml-2 rounded-xl hover:bg-muted text-foreground shrink-0"
                whileTap={{ scale: 0.9 }}
                aria-label="Geri"
              >
                <ArrowLeft className="w-5 h-5" />
              </motion.button>
              <h1 className="text-xl font-bold text-foreground truncate">Life</h1>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex rounded-xl bg-muted p-0.5">
                <button
                  onClick={() => setActiveTab('explore')}
                  className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${activeTab === 'explore' ? 'bg-background text-foreground shadow' : 'text-muted-foreground hover:text-foreground'}`}
                >
                  Explore
                </button>
                <button
                  onClick={() => setActiveTab('friends')}
                  className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${activeTab === 'friends' ? 'bg-background text-foreground shadow' : 'text-muted-foreground hover:text-foreground'}`}
                >
                  Friends
                </button>
              </div>
              <Button size="icon" variant="outline" onClick={() => setShowCreatePost(true)} className="rounded-xl">
                <Plus className="h-5 w-5" />
              </Button>
            </div>
          </div>

          {/* Feed: 2-column grid on large screens */}
          <div className="mx-auto grid max-w-4xl grid-cols-1 gap-6 p-4 sm:grid-cols-2">
            {allPosts.map((post: any, idx: number) => (
              <motion.article
                key={post.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.03 }}
                className="overflow-hidden rounded-2xl border border-border bg-card"
              >
                <button
                  type="button"
                  onClick={() => setMediaModalPost(post)}
                  className="aspect-[4/3] relative bg-muted w-full block cursor-pointer overflow-hidden"
                >
                  <img src={post.image} alt="" className="h-full w-full object-cover" />
                  {post.isSponsored && (
                    <span className="absolute top-2 right-2 rounded-full bg-black/60 px-2 py-0.5 text-xs font-medium text-white backdrop-blur">Sponsored</span>
                  )}
                </button>
                <div className="p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <UserAvatar src={post.user?.avatar || post.venue?.avatar} alt={post.user?.name || post.venue?.name} size="sm" />
                      <div>
                        <p className="font-semibold text-foreground text-sm">{post.user?.name || post.venue?.name}</p>
                        <p className="text-xs text-muted-foreground">{post.time}</p>
                      </div>
                    </div>
                  </div>
                  <p className="text-sm text-foreground line-clamp-2">{post.content}</p>
                  <div className="flex items-center gap-4 text-muted-foreground">
                    {post.commonInterests && post.commonInterests.length > 0 && (
                      <button
                        onClick={() => {
                          setCommonInterestsModalPost({
                            name: post.user?.name || post.venue?.name,
                            commonInterests: post.commonInterests,
                          });
                          setShowCommonInterestsModal(true);
                        }}
                        className="flex items-center gap-1.5 hover:text-foreground"
                        title="Common interests"
                      >
                        <span className="text-lg">⭐</span>
                        <span className="text-sm">{post.commonInterests.length}</span>
                      </button>
                    )}
                    <button onClick={() => toggleLike(post.id)} className="flex items-center gap-1.5 hover:text-foreground">
                      <Heart className={`h-4 w-4 ${likedPosts[post.id] ? 'fill-red-500 text-red-500' : ''}`} />
                      <span className="text-sm">{post.likes}</span>
                    </button>
                    <button
                      onClick={() => { setSelectedPostId(post.id); setShowComments(true); }}
                      className="flex items-center gap-1.5 hover:text-foreground"
                    >
                      <MessageCircle className="h-4 w-4" />
                      <span className="text-sm">{post.comments}</span>
                    </button>
                  </div>
                </div>
              </motion.article>
            ))}
          </div>
        </div>
        <CreatePostModal open={showCreatePost} onOpenChange={setShowCreatePost} onSuccess={() => window.location.reload()} />

        {/* Web: modal for image/video */}
        <AnimatePresence>
          {mediaModalPost && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm p-4"
              onClick={() => setMediaModalPost(null)}
            >
              <motion.div
                initial={{ scale: 0.95 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0.95 }}
                onClick={(e) => e.stopPropagation()}
                className="relative max-w-4xl w-full max-h-[90vh] flex flex-col items-center"
              >
                <button
                  type="button"
                  onClick={() => setMediaModalPost(null)}
                  className="absolute -top-12 right-0 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white z-10"
                  aria-label="Kapat"
                >
                  <X className="w-6 h-6" />
                </button>
                {mediaModalPost.image && (
                  (mediaModalPost.video || (typeof mediaModalPost.image === 'string' && /\.(mp4|webm|mov)(\?|$)/i.test(mediaModalPost.image))) ? (
                    <video
                      src={mediaModalPost.video || mediaModalPost.image}
                      controls
                      autoPlay
                      playsInline
                      className="max-h-[85vh] w-auto max-w-full rounded-xl object-contain"
                      onClick={(e) => e.stopPropagation()}
                    />
                  ) : (
                    <img
                      src={mediaModalPost.image}
                      alt={mediaModalPost.content || ''}
                      className="max-h-[85vh] w-auto max-w-full rounded-xl object-contain"
                      onClick={(e) => e.stopPropagation()}
                    />
                  )
                )}
                {mediaModalPost.content && (
                  <p className="mt-3 text-sm text-white/90 text-center max-w-lg line-clamp-2">{mediaModalPost.content}</p>
                )}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {showComments && (
          <div className="fixed inset-0 z-50 flex items-end bg-black/50 backdrop-blur-sm" onClick={() => setShowComments(false)}>
            <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} onClick={(e) => e.stopPropagation()} className="w-full max-h-[80vh] overflow-hidden rounded-t-2xl bg-background">
              <div className="flex items-center justify-between p-4 border-b border-border">
                <h2 className="text-lg font-semibold text-foreground">Comments</h2>
                <button onClick={() => setShowComments(false)} className="p-2 rounded-full hover:bg-muted"><X className="w-5 h-5" /></button>
              </div>
              <div className="overflow-y-auto p-4 space-y-4 max-h-[50vh]">
                {commentsLoading ? <p className="text-muted-foreground text-sm">Loading...</p> : comments?.length ? comments.map((c: any) => (
                  <div key={c.id} className="flex gap-3">
                    <UserAvatar src={c.user?.avatar} alt={c.user?.displayName} size="sm" />
                    <div>
                      <p className="text-sm font-medium text-foreground">{c.user?.displayName || `${c.user?.firstName} ${c.user?.lastName}`}</p>
                      <p className="text-sm text-muted-foreground">{c.content}</p>
                    </div>
                  </div>
                )) : <p className="text-sm text-muted-foreground">No comments yet.</p>}
              </div>
              {isAuthenticated && (
                <div className="p-4 border-t border-border flex gap-2">
                  <Input value={commentText} onChange={(e) => setCommentText(e.target.value)} placeholder="Add a comment..." className="flex-1" />
                  <Button size="sm" onClick={handleAddComment} disabled={!commentText.trim() || commentPost.isPending}><Send className="h-4 w-4" /></Button>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AppLayout>
    );
  }

  // Mobile: Instagram app style — full-screen vertical reels
  return (
    <AppLayout>
      <div className="relative h-screen w-full overflow-hidden bg-black life-container">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={currentPost.id}
            initial={{ opacity: 0, y: '100%' }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: '-100%' }}
            transition={{ 
              type: 'tween',
              duration: 0.3,
              ease: 'easeInOut'
            }}
            className="absolute inset-0"
          >
            {/* Post Image/Video */}
            <div className="relative h-full w-full">
              <img
                src={currentPost.isSponsored ? currentPost.image : currentPost.image}
                alt={currentPost.content}
                className="h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
              {currentPost.isSponsored && (
                <div className="absolute top-4 right-4 px-3 py-1 rounded-full bg-black/60 backdrop-blur-sm">
                  <span className="text-white text-xs font-semibold">Sponsored</span>
                </div>
              )}
            </div>

            {/* Content Overlay */}
            <div className="absolute inset-0 flex flex-col justify-between p-6">
              {/* Top Bar */}
              <div className="flex flex-col gap-4">
                {/* Explore/Friends Tabs */}
                <div className="flex items-center justify-center gap-8">
                  <motion.button
                    onClick={() => setActiveTab('explore')}
                    className="relative px-4 py-2"
                    whileTap={{ scale: 0.95 }}
                  >
                    <span className={`text-lg font-semibold transition-colors ${
                      activeTab === 'explore' ? 'text-white' : 'text-white/60'
                    }`}>
                      Explore
                    </span>
                    {activeTab === 'explore' && (
                      <motion.div
                        className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"
                        layoutId="activeTab"
                      />
                    )}
                  </motion.button>
                  <motion.button
                    onClick={() => setActiveTab('friends')}
                    className="relative px-4 py-2"
                    whileTap={{ scale: 0.95 }}
                  >
                    <span className={`text-lg font-semibold transition-colors ${
                      activeTab === 'friends' ? 'text-white' : 'text-white/60'
                    }`}>
                      Friends
                    </span>
                    {activeTab === 'friends' && (
                      <motion.div
                        className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"
                        layoutId="activeTab"
                      />
                    )}
                  </motion.button>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center justify-between">
                  <motion.button
                    onClick={() => navigate('/home')}
                    className="p-2 rounded-full bg-black/30 backdrop-blur-sm"
                    whileTap={{ scale: 0.9 }}
                    aria-label="Geri"
                  >
                    <ArrowLeft className="w-5 h-5 text-white" />
                  </motion.button>
                  <div className="flex gap-2">
                    <motion.button
                      onClick={() => setShowCreatePost(true)}
                      className="p-2 rounded-full bg-primary backdrop-blur-sm"
                      whileTap={{ scale: 0.9 }}
                    >
                      <Plus className="w-5 h-5 text-white" />
                    </motion.button>
                    <motion.button
                      className="p-2 rounded-full bg-black/30 backdrop-blur-sm"
                      whileTap={{ scale: 0.9 }}
                    >
                      <Share2 className="w-5 h-5 text-white" />
                    </motion.button>
                    <motion.button
                      className="p-2 rounded-full bg-black/30 backdrop-blur-sm"
                      whileTap={{ scale: 0.9 }}
                    >
                      <MoreVertical className="w-5 h-5 text-white" />
                    </motion.button>
                  </div>
                </div>
              </div>

              {/* Bottom Content */}
              <div className="flex gap-4">
                {/* Left: Post Info */}
                <div className="flex-1 space-y-3">
                  {/* User/Venue Info */}
                  <div className="flex items-center gap-3">
                    <motion.button
                      onClick={() => {
                        if (currentPost.user?.id) {
                          navigate(`/user/${currentPost.user.id}`);
                        }
                      }}
                      whileTap={{ scale: 0.95 }}
                      className="cursor-pointer"
                    >
                      <UserAvatar
                        src={currentPost.user?.avatar || currentPost.venue?.avatar}
                        alt={currentPost.user?.name || currentPost.venue?.name || ''}
                        size="md"
                      />
                    </motion.button>
                    <div>
                      <h3 className="font-semibold text-white">
                        {currentPost.user?.name || currentPost.venue?.name}
                      </h3>
                      <p className="text-sm text-white/80">{currentPost.time}</p>
                    </div>
                  </div>

                  {/* Content */}
                  <p className="text-white text-lg leading-relaxed">{currentPost.content}</p>
                  
                  {/* Sponsor Link Button */}
                  {currentPost.isSponsored && currentPost.link && (
                    <motion.button
                      onClick={() => {
                        window.open(currentPost.link, '_blank', 'noopener,noreferrer');
                      }}
                      className="mt-4 flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-primary-foreground font-semibold"
                      whileTap={{ scale: 0.95 }}
                    >
                      <span>Visit Website</span>
                      <ExternalLink className="w-4 h-4" />
                    </motion.button>
                  )}
                </div>

                {/* Right: Actions */}
                <div className="flex flex-col items-center gap-6">
                  {/* Common Interest Indicator - Star: tap to open modal */}
                  {currentPost.commonInterests && currentPost.commonInterests.length > 0 && (
                    <motion.button
                      type="button"
                      initial={{ scale: 0, rotate: -180 }}
                      animate={{ scale: 1, rotate: 0 }}
                      className="flex flex-col items-center gap-1 mb-2"
                      title={`${currentPost.commonInterests.length} common interest${currentPost.commonInterests.length > 1 ? 's' : ''}`}
                      onClick={() => {
                        setCommonInterestsModalPost({
                          name: currentPost.user?.name || currentPost.venue?.name,
                          commonInterests: currentPost.commonInterests,
                        });
                        setShowCommonInterestsModal(true);
                      }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <div className="p-2 rounded-full bg-primary/20 backdrop-blur-sm border border-primary/30 shadow-lg">
                        <span className="text-2xl">⭐</span>
                      </div>
                    </motion.button>
                  )}
                  
                  {/* Like Button */}
                  <motion.button
                    onClick={() => toggleLike(currentPost.id)}
                    className="flex flex-col items-center gap-1"
                    whileTap={{ scale: 0.9 }}
                  >
                    <div className="p-3 rounded-full bg-black/30 backdrop-blur-sm">
                      <Heart
                        className={`w-6 h-6 ${
                          likedPosts[currentPost.id] ? 'fill-red-500 text-red-500' : 'text-white'
                        }`}
                      />
                    </div>
                    <span className="text-white text-sm font-medium">{currentPost.likes}</span>
                  </motion.button>

                  {/* Comment Button - Disabled for sponsored content */}
                  {!currentPost.isSponsored ? (
                    <motion.button
                      onClick={async () => {
                        // Open chat with post owner when clicking comment
                        if (currentPost.user?.id && currentPost.user.id !== user?.id) {
                          try {
                            const chat = await createDirectChat.mutateAsync(currentPost.user.id);
                            navigate(`/chat?chatId=${chat.id}`);
                          } catch (error: any) {
                            // If chat creation fails, still show comments
                            setSelectedPostId(currentPost.id);
                            setShowComments(true);
                            if (error.message && !error.message.includes('chat')) {
                              toast.error(error.message);
                            }
                          }
                        } else {
                          // Show comments if own post or no user ID
                          setSelectedPostId(currentPost.id);
                          setShowComments(true);
                        }
                      }}
                      className="flex flex-col items-center gap-1"
                      whileTap={{ scale: 0.9 }}
                    >
                      <div className="p-3 rounded-full bg-black/30 backdrop-blur-sm">
                        <MessageCircle className="w-6 h-6 text-white" />
                      </div>
                      <span className="text-white text-sm font-medium">{currentPost.comments}</span>
                    </motion.button>
                  ) : (
                    <div className="flex flex-col items-center gap-1 opacity-50">
                      <div className="p-3 rounded-full bg-black/30 backdrop-blur-sm">
                        <MessageCircle className="w-6 h-6 text-white" />
                      </div>
                      <span className="text-white text-sm font-medium">{currentPost.comments || 0}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Progress Indicator */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-white/20 z-50">
              <motion.div
                className="h-full bg-primary"
                initial={{ width: 0 }}
                animate={{ width: `${((currentIndex + 1) / allPosts.length) * 100}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Navigation Dots */}
        <div className="absolute bottom-20 left-1/2 -translate-x-1/2 flex gap-2">
          {allPosts.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentIndex(idx)}
              className={`h-1.5 rounded-full transition-all ${
                idx === currentIndex ? 'w-6 bg-primary' : 'w-1.5 bg-white/30'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Common Interests Modal */}
      <AnimatePresence>
        {showCommonInterestsModal && commonInterestsModalPost && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
            onClick={() => setShowCommonInterestsModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-sm rounded-2xl bg-card border border-border shadow-xl overflow-hidden"
            >
              <div className="p-4 border-b border-border flex items-center justify-between gap-2">
                <div>
                  <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
                    <span className="text-2xl">⭐</span>
                    Common interests
                  </h2>
                  {commonInterestsModalPost.name && (
                    <p className="text-sm text-muted-foreground mt-0.5">with {commonInterestsModalPost.name}</p>
                  )}
                </div>
                <motion.button
                  type="button"
                  onClick={() => setShowCommonInterestsModal(false)}
                  className="p-2 rounded-full hover:bg-muted text-foreground"
                  whileTap={{ scale: 0.9 }}
                >
                  <X className="w-5 h-5" />
                </motion.button>
              </div>
              <div className="p-4 flex flex-wrap gap-2">
                {commonInterestsModalPost.commonInterests.map((interest) => (
                  <span
                    key={interest}
                    className="px-3 py-1.5 rounded-full bg-primary/15 text-primary font-medium text-sm border border-primary/30"
                  >
                    {interest}
                  </span>
                ))}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Create Post Modal */}
      <CreatePostModal
        open={showCreatePost}
        onOpenChange={setShowCreatePost}
        onSuccess={() => {
          // Refresh posts after creation
          window.location.reload();
        }}
      />

      {/* Comments Modal */}
      <AnimatePresence>
        {showComments && (
          <div className="fixed inset-0 z-50 flex items-end bg-black/50 backdrop-blur-sm" onClick={() => setShowComments(false)}>
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full bg-background rounded-t-3xl max-h-[80vh] flex flex-col"
            >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-border">
              <h2 className="text-lg font-semibold text-foreground">Comments</h2>
              <motion.button
                onClick={() => setShowComments(false)}
                className="p-2 rounded-full hover:bg-muted"
                whileTap={{ scale: 0.9 }}
              >
                <X className="w-5 h-5 text-foreground" />
              </motion.button>
            </div>

            {/* Comments List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {commentsLoading ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">Loading comments...</p>
                </div>
              ) : comments && comments.length > 0 ? (
                comments.map((comment: any) => (
                  <div key={comment.id} className="flex gap-3">
                    <UserAvatar
                      src={comment.user?.avatar}
                      alt={comment.user?.displayName || `${comment.user?.firstName} ${comment.user?.lastName}`}
                      size="sm"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold text-foreground text-sm">
                          {comment.user?.displayName || `${comment.user?.firstName} ${comment.user?.lastName}`}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {new Date(comment.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-foreground text-sm">{comment.content}</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No comments yet. Be the first to comment!</p>
                </div>
              )}
            </div>

            {/* Comment Input */}
            {isAuthenticated && (
              <div className="p-4 border-t border-border">
                <div className="flex gap-2">
                  <Input
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    placeholder="Add a comment..."
                    className="flex-1"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && commentText.trim() && selectedPostId) {
                        handleAddComment();
                      }
                    }}
                  />
                  <motion.button
                    onClick={handleAddComment}
                    disabled={!commentText.trim() || commentPost.isPending}
                    className="p-2 rounded-full bg-primary text-primary-foreground disabled:opacity-50 disabled:cursor-not-allowed"
                    whileTap={{ scale: 0.9 }}
                  >
                    <Send className="w-5 h-5" />
                  </motion.button>
                </div>
              </div>
            )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </AppLayout>
  );
};

export default LifePage;
