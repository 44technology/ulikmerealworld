import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Users, Plus, GraduationCap, Settings, Globe, Lock, Calendar, DollarSign, User, Send, AlertCircle, Heart, MessageCircle, PartyPopper, UserPlus, Check, X } from 'lucide-react';
import AppLayout from '@/components/layout/AppLayout';
import BottomNav from '@/components/layout/BottomNav';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import {
  useCommunities,
  addUserToCommunity,
  getUserCommunityIds,
  getCommunityJoinRequests,
  addCommunityJoinRequest,
  removeCommunityJoinRequest,
  hasUserRequestedCommunity,
  type JoinRequest,
} from '@/hooks/useCommunities';
import { useClasses } from '@/hooks/useClasses';
import { useMeetups } from '@/hooks/useMeetups';
import { usePosts, type Post as ApiPost } from '@/hooks/usePosts';
import { getAuthToken } from '@/lib/api';
import UserAvatar from '@/components/ui/UserAvatar';

interface Community {
  id: string;
  name: string;
  description?: string;
  image?: string;
  isPublic: boolean;
  creator: {
    id: string;
    displayName: string;
    avatar?: string;
  };
  memberCount: number;
  isMember: boolean;
  isOwner: boolean;
}

const COMMUNITY_POSTS_KEY = (id: string) => `ulikme_community_posts_${id}`;
const POST_COMMENTS_KEY = (postId: string) => `ulikme_community_post_comments_${postId}`;

interface CommunityPost {
  id: string;
  content: string;
  image?: string;
  userId: string;
  userDisplayName: string;
  userAvatar?: string;
  createdAt: string;
  likes: number;
  comments: number;
}

interface PostComment {
  id: string;
  postId: string;
  content: string;
  userId: string;
  userDisplayName: string;
  userAvatar?: string;
  createdAt: string;
}

function loadPostComments(postId: string): PostComment[] {
  try {
    const raw = localStorage.getItem(POST_COMMENTS_KEY(postId));
    if (!raw) return [];
    const list = JSON.parse(raw);
    return Array.isArray(list) ? list : [];
  } catch {
    return [];
  }
}

function savePostComments(postId: string, comments: PostComment[]) {
  try {
    localStorage.setItem(POST_COMMENTS_KEY(postId), JSON.stringify(comments));
  } catch (_) {}
}

const MOCK_MEMBERS = [
  { id: 'm1', displayName: 'Alex Chen', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150', role: 'Creator' },
  { id: 'm2', displayName: 'Sarah Kim', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150', role: 'Member' },
  { id: 'm3', displayName: 'Jordan Lee', avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150', role: 'Member' },
  { id: 'm4', displayName: 'Mike Park', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150', role: 'Member' },
  { id: 'm5', displayName: 'Emma Wilson', avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150', role: 'Member' },
  { id: 'm6', displayName: 'Chris Taylor', avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150', role: 'Member' },
  { id: 'm7', displayName: 'Jamie Rivera', avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150', role: 'Member' },
];

const MOCK_POSTS_FALLBACK: CommunityPost[] = [
  { id: 'p1', content: 'Welcome to the community! Share your ideas and connect with others.', userId: 'c1', userDisplayName: 'Alex Chen', userAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150', createdAt: new Date(Date.now() - 86400000 * 2).toISOString(), likes: 24, comments: 5 },
  { id: 'p2', content: 'Just finished an amazing session. Who\'s up for the next meetup?', userId: 'c2', userDisplayName: 'Sarah Kim', userAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150', createdAt: new Date(Date.now() - 86400000).toISOString(), likes: 18, comments: 7 },
  { id: 'p3', content: 'Great discussion today on growth strategies. Let\'s keep the momentum going!', userId: 'c3', userDisplayName: 'Jordan Lee', userAvatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150', createdAt: new Date(Date.now() - 43200000).toISOString(), likes: 11, comments: 2 },
  { id: 'p4', content: 'Reminder: our weekly call is tomorrow at 6 PM. See you there!', userId: 'c1', userDisplayName: 'Alex Chen', userAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150', createdAt: new Date(Date.now() - 3600000).toISOString(), likes: 6, comments: 1 },
];

function loadCommunityPosts(communityId: string): CommunityPost[] {
  try {
    const raw = localStorage.getItem(COMMUNITY_POSTS_KEY(communityId));
    if (!raw) return MOCK_POSTS_FALLBACK;
    const list = JSON.parse(raw);
    return Array.isArray(list) && list.length > 0 ? list : MOCK_POSTS_FALLBACK;
  } catch {
    return MOCK_POSTS_FALLBACK;
  }
}

function saveCommunityPosts(communityId: string, posts: CommunityPost[]) {
  try {
    localStorage.setItem(COMMUNITY_POSTS_KEY(communityId), JSON.stringify(posts));
  } catch (_) {}
}

export default function CommunityDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: communitiesList = [] } = useCommunities();
  const [showRequestDialog, setShowRequestDialog] = useState(false);
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [newPostContent, setNewPostContent] = useState('');
  const [selectedPost, setSelectedPost] = useState<CommunityPost | null>(null);
  const [postComments, setPostComments] = useState<PostComment[]>([]);
  const [newCommentText, setNewCommentText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'posts' | 'members' | 'classes' | 'vibes'>('posts');
  const [pendingJoinRequests, setPendingJoinRequests] = useState<JoinRequest[]>(() =>
    id ? getCommunityJoinRequests(id) : []
  );

  const communityFromList = useMemo(() => (id ? communitiesList.find((c: any) => c.id === id) : null), [id, communitiesList]);
  const [community, setCommunity] = useState<Community | null>(null);
  const { data: communityClasses = [] } = useClasses(undefined, undefined, undefined, undefined, undefined, id ?? undefined);
  const { data: communityVibes = [] } = useMeetups(id ? { communityId: id } : undefined);
  const { data: apiPosts = [] } = usePosts(undefined, undefined, id ?? undefined);
  const [members] = useState<any[]>(MOCK_MEMBERS);
  const [posts, setPosts] = useState<CommunityPost[]>(() => (id ? loadCommunityPosts(id) : MOCK_POSTS_FALLBACK));

  const mergedPosts = useMemo((): CommunityPost[] => {
    const fromApi: CommunityPost[] = (apiPosts as ApiPost[]).map((p) => ({
      id: p.id,
      content: p.content ?? '',
      image: p.image,
      userId: p.user?.id ?? '',
      userDisplayName: p.user?.displayName ?? ([p.user?.firstName, p.user?.lastName].filter(Boolean).join(' ') || 'User'),
      userAvatar: p.user?.avatar,
      createdAt: p.createdAt,
      likes: (p as any)._count?.likes ?? (p as any).likes ?? 0,
      comments: (p as any)._count?.comments ?? (p as any).commentsCount ?? 0,
    }));
    return [...fromApi, ...posts].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }, [apiPosts, posts]);

  useEffect(() => {
    if (communityFromList) {
      const isMember = id ? getUserCommunityIds(user?.id ?? '').includes(id) : false;
      const isOwner = user?.id === communityFromList.creator?.id;
      setCommunity({
        id: communityFromList.id,
        name: communityFromList.name,
        description: communityFromList.description,
        image: communityFromList.image,
        isPublic: communityFromList.isPublic ?? true,
        creator: communityFromList.creator,
        memberCount: communityFromList.memberCount ?? 0,
        isMember,
        isOwner,
      });
    } else if (id && user) {
      const isMember = getUserCommunityIds(user.id ?? '').includes(id);
      setCommunity({
        id,
        name: 'My Community',
        description: 'A community you created or joined.',
        image: undefined,
        isPublic: true,
        creator: { id: user.id, displayName: user.displayName || `${user.firstName} ${user.lastName}` || 'You', avatar: user.avatar },
        memberCount: MOCK_MEMBERS.length,
        isMember,
        isOwner: false,
      });
    }
  }, [id, user, communityFromList]);

  useEffect(() => {
    if (id) setPendingJoinRequests(getCommunityJoinRequests(id));
  }, [id]);

  // User's social media followers count (from user profile)
  // For testing: if not set, allow class creation (set to 10000 for testing)
  const userFollowers = user?.socialMediaFollowers ?? 10000; // Default to 10000 for testing
  const canCreateClasses = user?.canCreateClasses || false;
  const hasRequestedClassCreation = user?.classCreationRequestStatus === 'pending';
  const classRequestApproved = user?.classCreationRequestStatus === 'approved';
  // For testing: allow class creation if user is owner (temporary)
  const canDirectlyCreateClass = canCreateClasses || classRequestApproved || (community?.isOwner && userFollowers >= 5000);
  
  const handleRequestClassCreation = async () => {
    if (userFollowers < 5000) {
      toast.error('You need at least 5,000 followers to request class creation');
      return;
    }

    setIsLoading(true);
    try {
      const token = getAuthToken();
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/api/users/request-class-creation`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          communityId: id,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to send request');
      }

      toast.success('Request sent to admin! You will be notified once approved.');
      setShowRequestDialog(false);
      // TODO: Refresh user data
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : 'Failed to send request');
    } finally {
      setIsLoading(false);
    }
  };

  const joinRequestPending = !!(community && !community.isMember && hasUserRequestedCommunity(user?.id, id));

  const handleAcceptJoinRequest = (request: JoinRequest) => {
    if (!id) return;
    addUserToCommunity(request.userId, id);
    removeCommunityJoinRequest(id, request.userId);
    setPendingJoinRequests(getCommunityJoinRequests(id));
    setCommunity((prev) => (prev ? { ...prev, memberCount: prev.memberCount + 1 } : null));
    toast.success(`${request.displayName} joined the community.`);
  };

  const handleRejectJoinRequest = (request: JoinRequest) => {
    if (!id) return;
    removeCommunityJoinRequest(id, request.userId);
    setPendingJoinRequests(getCommunityJoinRequests(id));
    toast.success('Request rejected.');
  };

  const handleJoinCommunity = async () => {
    if (!user) {
      toast.error('Please login to join');
      return;
    }
    if (!id) return;

    setIsLoading(true);
    try {
      addCommunityJoinRequest(id, {
        id: user.id,
        displayName: user.displayName,
        firstName: user.firstName,
        lastName: user.lastName,
        avatar: user.avatar,
      });
      setPendingJoinRequests(getCommunityJoinRequests(id));
      toast.success('Request sent! The community creator will review your request.');
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : 'Failed to send request');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (id) setPosts(loadCommunityPosts(id));
  }, [id]);

  const handleCreatePost = () => {
    if (!newPostContent.trim() || !user || !id) return;
    const post: CommunityPost = {
      id: `post-${Date.now()}`,
      content: newPostContent.trim(),
      userId: user.id,
      userDisplayName: user.displayName || user.firstName || 'You',
      userAvatar: user.avatar,
      createdAt: new Date().toISOString(),
      likes: 0,
      comments: 0,
    };
    const next = [post, ...posts];
    setPosts(next);
    saveCommunityPosts(id, next);
    setNewPostContent('');
    setShowCreatePost(false);
    toast.success('Post shared!');
  };

  const openPostDetail = (post: CommunityPost) => {
    setSelectedPost(post);
    setPostComments(loadPostComments(post.id));
    setNewCommentText('');
  };

  const handleAddComment = () => {
    if (!newCommentText.trim() || !user || !selectedPost) return;
    const comment: PostComment = {
      id: `comment-${Date.now()}`,
      postId: selectedPost.id,
      content: newCommentText.trim(),
      userId: user.id,
      userDisplayName: user.displayName || user.firstName || 'You',
      userAvatar: user.avatar,
      createdAt: new Date().toISOString(),
    };
    const next = [comment, ...postComments];
    setPostComments(next);
    savePostComments(selectedPost.id, next);
    setNewCommentText('');
    const updatedPosts = posts.map((p) =>
      p.id === selectedPost.id ? { ...p, comments: p.comments + 1 } : p
    );
    setPosts(updatedPosts);
    saveCommunityPosts(id!, updatedPosts);
    toast.success('Comment added!');
  };

  if (!community) {
    return (
      <AppLayout>
        <div className="text-center py-12">
          <p className="text-muted-foreground">Loading community...</p>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      {/* Header */}
      <div className="sticky top-0 z-40 glass safe-top">
        <div className="flex items-center gap-3 px-4 py-3">
          <motion.button
            onClick={() => navigate('/communities')}
            className="p-2 -ml-2"
            whileTap={{ scale: 0.9 }}
          >
            <ArrowLeft className="w-6 h-6 text-foreground" />
          </motion.button>
          <h1 className="text-xl font-bold text-foreground flex-1 truncate">{community.name}</h1>
          {community.isOwner && (
            <motion.button
              onClick={() => navigate(`/community/${id}/settings`)}
              className="p-2"
              whileTap={{ scale: 0.9 }}
            >
              <Settings className="w-6 h-6 text-foreground" />
            </motion.button>
          )}
        </div>
      </div>

      <div className="pb-6">
        {/* Community Header */}
        <div className="relative">
          <div className="w-full h-48 bg-gradient-to-br from-primary/20 to-secondary/20">
            {community.image && (
              <img src={community.image} alt={community.name} className="w-full h-full object-cover" />
            )}
          </div>
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-background to-transparent p-4">
            <div className="flex items-end justify-between">
              <div>
                <h2 className="text-2xl font-bold text-foreground mb-1">{community.name}</h2>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  {community.isPublic ? (
                    <Globe className="w-4 h-4" />
                  ) : (
                    <Lock className="w-4 h-4" />
                  )}
                  <span>{community.memberCount} members</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Description */}
        {community.description && (
          <div className="px-4 pt-4">
            <p className="text-muted-foreground">{community.description}</p>
          </div>
        )}

        {/* Actions - Join / Request to join */}
        <div className="px-4 pt-4 flex gap-2">
          {!community.isMember && !joinRequestPending && (
            <Button
              onClick={handleJoinCommunity}
              className="flex-1 bg-gradient-primary text-primary-foreground"
              disabled={isLoading}
            >
              <UserPlus className="w-4 h-4 mr-2" />
              Join Community
            </Button>
          )}
          {!community.isMember && joinRequestPending && (
            <div className="flex-1 space-y-2">
              <Button variant="secondary" className="w-full" disabled>
                <AlertCircle className="w-4 h-4 mr-2" />
                Request Pending
              </Button>
              <p className="text-xs text-muted-foreground text-center px-2">
                The community owner will review your request. You can check status under Communities → Pending.
              </p>
            </div>
          )}
        </div>

        {/* Tabs - Skool style: Posts, Members, Classes */}
        <div className="px-4 pt-6">
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'posts' | 'members' | 'classes' | 'vibes')}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="posts" className="text-sm">Posts</TabsTrigger>
              <TabsTrigger value="members" className="text-sm">Members</TabsTrigger>
              <TabsTrigger value="classes" className="text-sm">Classes</TabsTrigger>
              <TabsTrigger value="vibes" className="text-sm">Vibes</TabsTrigger>
            </TabsList>

            <TabsContent value="posts" className="mt-4 space-y-4">
              {community.isMember && (
                <div className="space-y-2">
                  {!showCreatePost ? (
                    <motion.button
                      onClick={() => setShowCreatePost(true)}
                      className="w-full p-3 rounded-xl border-2 border-dashed border-border hover:border-primary/40 hover:bg-muted/30 flex items-center gap-3 text-left"
                      whileTap={{ scale: 0.98 }}
                    >
                      <UserAvatar src={user?.avatar} alt={user?.displayName || 'You'} size="md" />
                      <span className="text-muted-foreground text-sm">Write a post...</span>
                      <Plus className="w-5 h-5 text-muted-foreground ml-auto" />
                    </motion.button>
                  ) : (
                    <div className="p-4 rounded-xl border border-border bg-card space-y-3">
                      <Textarea
                        placeholder="Share something with the community..."
                        value={newPostContent}
                        onChange={(e) => setNewPostContent(e.target.value)}
                        rows={3}
                        className="resize-none"
                      />
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={() => { setShowCreatePost(false); setNewPostContent(''); }}>
                          Cancel
                        </Button>
                        <Button size="sm" onClick={handleCreatePost} disabled={!newPostContent.trim()}>
                          Post
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              )}
              <div className="space-y-3">
                {mergedPosts.length === 0 ? (
                  <div className="text-center py-12">
                    <MessageCircle className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
                    <p className="text-muted-foreground">No posts yet. Be the first to share!</p>
                  </div>
                ) : (
                  mergedPosts.map((post) => (
                    <motion.div
                      key={post.id}
                      className="rounded-xl border border-border bg-card overflow-hidden cursor-pointer hover:bg-muted/20 transition-colors"
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      onClick={() => openPostDetail(post)}
                    >
                      <div className="p-4">
                        <div className="flex items-center gap-3 mb-3">
                          <button
                            type="button"
                            onClick={(e) => { e.stopPropagation(); navigate(`/user/${post.userId}`); }}
                            className="flex items-center gap-3 min-w-0 flex-1 text-left rounded-lg -m-1 p-1 hover:bg-muted/50"
                          >
                            <UserAvatar src={post.userAvatar} alt={post.userDisplayName} size="md" />
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-foreground truncate">{post.userDisplayName}</p>
                              <p className="text-xs text-muted-foreground">
                                {new Date(post.createdAt).toLocaleDateString(undefined, { dateStyle: 'short' })}
                              </p>
                            </div>
                          </button>
                        </div>
                        <p className="text-foreground text-sm whitespace-pre-wrap break-words">{post.content}</p>
                        {post.image && (
                          <div className="mt-3 rounded-lg overflow-hidden border border-border">
                            <img src={post.image} alt="" className="w-full max-h-80 object-cover object-center" />
                          </div>
                        )}
                        <div className="flex items-center gap-4 mt-3 pt-3 border-t border-border text-muted-foreground">
                          <span className="flex items-center gap-1 text-xs">
                            <Heart className="w-4 h-4" />
                            {post.likes}
                          </span>
                          <span className="flex items-center gap-1 text-xs">
                            <MessageCircle className="w-4 h-4" />
                            {post.comments}
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  ))
                )}
              </div>
            </TabsContent>

            <TabsContent value="members" className="mt-4 space-y-3">
              {community.isOwner && pendingJoinRequests.length > 0 && (
                <div className="mb-4 p-4 rounded-xl border border-border bg-muted/30 space-y-3">
                  <p className="text-sm font-medium text-foreground">Join requests</p>
                  <p className="text-xs text-muted-foreground">Accept or reject requests to join this community.</p>
                  <div className="space-y-2">
                    {pendingJoinRequests.map((req) => (
                      <div
                        key={req.userId}
                        className="flex items-center justify-between gap-3 p-3 rounded-lg border border-border bg-card"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <UserAvatar src={req.avatar} alt={req.displayName} size="md" />
                          <div className="min-w-0">
                            <p className="font-medium text-foreground truncate">{req.displayName}</p>
                            <p className="text-xs text-muted-foreground">
                              Requested {new Date(req.requestedAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <div className="flex gap-2 flex-shrink-0">
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-green-600 border-green-600/50 hover:bg-green-600/10"
                            onClick={() => handleAcceptJoinRequest(req)}
                          >
                            <Check className="w-4 h-4 mr-1" />
                            Accept
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-destructive border-destructive/50 hover:bg-destructive/10"
                            onClick={() => handleRejectJoinRequest(req)}
                          >
                            <X className="w-4 h-4 mr-1" />
                            Reject
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              <p className="text-sm text-muted-foreground mb-2">{community.memberCount} members</p>
              {members.map((member) => (
                <motion.div
                  key={member.id}
                  onClick={() => navigate(`/user/${member.id}`)}
                  className="flex items-center gap-3 p-4 rounded-xl border border-border bg-card cursor-pointer hover:bg-muted/30"
                  whileTap={{ scale: 0.98 }}
                >
                  <UserAvatar src={member.avatar} alt={member.displayName} size="md" />
                  <div className="flex-1">
                    <p className="font-medium text-foreground">{member.displayName}</p>
                    <p className="text-xs text-muted-foreground">{member.role}</p>
                  </div>
                </motion.div>
              ))}
            </TabsContent>

            <TabsContent value="classes" className="mt-4 space-y-3">
              {community.isMember && (
                <motion.button
                  type="button"
                  onClick={() => navigate(`/create-class?communityId=${id}`)}
                  className="w-full flex items-center justify-center gap-3 p-4 rounded-xl border-2 border-dashed border-border hover:border-primary/50 hover:bg-primary/5 transition-all text-muted-foreground hover:text-primary"
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <Plus className="w-5 h-5 text-primary" />
                  </div>
                  <span className="font-medium text-foreground">New class</span>
                </motion.button>
              )}
              {communityClasses.length === 0 && !community.isMember && (
                <div className="text-center py-12">
                  <GraduationCap className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
                  <p className="text-muted-foreground font-medium mb-2">No classes yet</p>
                  <p className="text-sm text-muted-foreground">Join the community to see and create classes</p>
                </div>
              )}
              {communityClasses.length === 0 && community.isMember && (
                <div className="text-center py-8">
                  <p className="text-sm text-muted-foreground">No classes yet. Use the button above to create one.</p>
                </div>
              )}
              {communityClasses.length > 0 && communityClasses.map((classItem) => (
                  <motion.div
                    key={classItem.id}
                    onClick={() => navigate(`/class/${classItem.id}`)}
                    className="card-elevated overflow-hidden cursor-pointer"
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className="p-4">
                      <h3 className="font-semibold text-foreground mb-1">{classItem.title}</h3>
                      <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{classItem.description}</p>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          <span>{new Date(classItem.startTime).toLocaleDateString()}</span>
                        </div>
                        {classItem.price != null && (
                          <>
                            <span>•</span>
                            <div className="flex items-center gap-1">
                              <DollarSign className="w-3 h-3" />
                              <span>${classItem.price}</span>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
            </TabsContent>

            <TabsContent value="vibes" className="mt-4 space-y-3">
              {community.isMember && (
                <motion.button
                  type="button"
                  onClick={() => navigate(`/create?communityId=${id}`)}
                  className="w-full flex items-center justify-center gap-3 p-4 rounded-xl border-2 border-dashed border-border hover:border-primary/50 hover:bg-primary/5 transition-all text-muted-foreground hover:text-primary"
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <Plus className="w-5 h-5 text-primary" />
                  </div>
                  <span className="font-medium text-foreground">Create Vibe</span>
                </motion.button>
              )}
              {communityVibes.length === 0 && !community.isMember && (
                <div className="text-center py-12">
                  <PartyPopper className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
                  <p className="text-muted-foreground font-medium mb-2">No activities or events yet</p>
                  <p className="text-sm text-muted-foreground">Join the community to see and create vibes.</p>
                </div>
              )}
              {communityVibes.length === 0 && community.isMember && (
                <div className="text-center py-8">
                  <p className="text-sm text-muted-foreground">No vibes yet. Use the button above to create one.</p>
                </div>
              )}
              {communityVibes.length > 0 && communityVibes.map((vibe) => (
                <motion.div
                  key={vibe.id}
                  onClick={() => navigate(`/meetup/${vibe.id}`)}
                  className="card-elevated overflow-hidden cursor-pointer"
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="p-4">
                    <h3 className="font-semibold text-foreground mb-1">{vibe.title}</h3>
                    {vibe.description && (
                      <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{vibe.description}</p>
                    )}
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        <span>{new Date(vibe.startTime).toLocaleDateString()}</span>
                      </div>
                      {vibe.pricePerPerson != null && vibe.pricePerPerson > 0 && (
                        <>
                          <span>•</span>
                          <div className="flex items-center gap-1">
                            <DollarSign className="w-3 h-3" />
                            <span>${vibe.pricePerPerson}</span>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Request Class Creation Dialog */}
      <Dialog open={showRequestDialog} onOpenChange={setShowRequestDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Request Class Creation</DialogTitle>
            <DialogDescription>
              You have {userFollowers.toLocaleString()} followers. Request admin approval to create classes in this community.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-muted border border-border">
              <p className="text-sm text-muted-foreground">
                Your request will be reviewed by our admin team. You'll be notified once a decision is made.
              </p>
            </div>
            <div className="flex gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowRequestDialog(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                type="button"
                onClick={handleRequestClassCreation}
                className="flex-1 bg-gradient-primary text-primary-foreground"
                disabled={isLoading}
              >
                {isLoading ? 'Sending...' : 'Send Request'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Post Detail & Comments Dialog */}
      <Dialog open={!!selectedPost} onOpenChange={(open) => !open && setSelectedPost(null)}>
        <DialogContent className="max-w-md max-h-[90vh] flex flex-col p-0">
          {selectedPost && (
            <>
              <div className="p-4 overflow-y-auto flex-1">
                <div className="flex items-center gap-3 mb-3">
                  <button
                    type="button"
                    onClick={() => { navigate(`/user/${selectedPost.userId}`); setSelectedPost(null); }}
                    className="flex items-center gap-3 min-w-0 flex-1 text-left rounded-lg -m-1 p-1 hover:bg-muted/50"
                  >
                    <UserAvatar src={selectedPost.userAvatar} alt={selectedPost.userDisplayName} size="md" />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-foreground truncate">{selectedPost.userDisplayName}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(selectedPost.createdAt).toLocaleDateString(undefined, { dateStyle: 'medium' })}
                      </p>
                    </div>
                  </button>
                </div>
                <p className="text-foreground text-sm whitespace-pre-wrap break-words">{selectedPost.content}</p>
                <div className="flex items-center gap-4 mt-3 pt-3 border-b border-border text-muted-foreground">
                  <span className="flex items-center gap-1 text-xs">
                    <Heart className="w-4 h-4" />
                    {selectedPost.likes}
                  </span>
                  <span className="flex items-center gap-1 text-xs">
                    <MessageCircle className="w-4 h-4" />
                    {postComments.length}
                  </span>
                </div>

                <div className="mt-4">
                  <p className="text-sm font-medium text-foreground mb-3">Comments</p>
                  {postComments.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No comments yet. Be the first!</p>
                  ) : (
                    <div className="space-y-3">
                      {postComments.map((c) => (
                        <div key={c.id} className="flex gap-3">
                          <button
                            type="button"
                            onClick={() => { navigate(`/user/${c.userId}`); setSelectedPost(null); }}
                            className="flex-shrink-0"
                          >
                            <UserAvatar src={c.userAvatar} alt={c.userDisplayName} size="sm" />
                          </button>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-medium text-foreground">{c.userDisplayName}</p>
                            <p className="text-sm text-muted-foreground break-words">{c.content}</p>
                            <p className="text-xs text-muted-foreground mt-0.5">
                              {new Date(c.createdAt).toLocaleDateString(undefined, { dateStyle: 'short' })}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              {community?.isMember && (
                <div className="p-4 border-t border-border flex gap-2">
                  <Input
                    placeholder="Write a comment..."
                    value={newCommentText}
                    onChange={(e) => setNewCommentText(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleAddComment();
                      }
                    }}
                    className="flex-1"
                  />
                  <Button size="sm" onClick={handleAddComment} disabled={!newCommentText.trim()}>
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              )}
            </>
          )}
        </DialogContent>
      </Dialog>

      <BottomNav />
    </AppLayout>
  );
}
