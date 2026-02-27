import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Bell, MoreHorizontal, MessageCircle, MoreVertical, ThumbsUp, Paperclip } from 'lucide-react';
import AppLayout from '@/components/layout/AppLayout';
import BottomNav from '@/components/layout/BottomNav';
import UserAvatar from '@/components/ui/UserAvatar';
import { usePosts, usePostComments, useLikePost, useCommentPost, type Post, type PostComment } from '@/hooks/usePosts';
import { useAuth } from '@/contexts/AuthContext';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

function isVideoUrl(url: string): boolean {
  return /\.(mp4|webm|mov|m4v)(\?|$)/i.test(url) || url.includes('/video/');
}

function timeAgo(date: Date): string {
  const s = Math.floor((Date.now() - date.getTime()) / 1000);
  if (s < 60) return 'just now';
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  if (s < 86400 * 2) return '1d ago';
  return `${Math.floor(s / 86400)}d ago`;
}

export default function PostDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { data: posts = [] } = usePosts();
  const post = id ? posts.find((p: Post) => p.id === id) : null;
  const { data: comments = [], isLoading: commentsLoading } = usePostComments(id || '');
  const likePost = useLikePost();
  const commentPost = useCommentPost();
  const [commentText, setCommentText] = useState('');
  const [liked, setLiked] = useState(false);

  const title = post?.content?.split('\n')[0]?.slice(0, 50) || 'Post';
  const mediaUrl = post?.image;
  const isVideo = mediaUrl ? isVideoUrl(mediaUrl) : false;
  const likeCount = (post?._count?.likes ?? 0) + (liked ? 1 : 0);
  const commentCount = post?._count?.comments ?? comments.length;

  if (!id) {
    navigate('/communities?tab=socialize');
    return null;
  }

  if (!post) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center min-h-[50vh]">
          <p className="text-muted-foreground">Loading...</p>
        </div>
        <BottomNav />
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="flex flex-col flex-1 min-h-0">
      {/* Header: back, title, bell, menu */}
      <div className="sticky top-0 z-40 safe-top bg-background border-b border-border/50 shrink-0">
        <div className="flex items-center justify-between gap-2 px-4 py-3">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="p-2 -ml-2 rounded-lg hover:bg-muted/50"
            aria-label="Back"
          >
            <ArrowLeft className="w-5 h-5 text-foreground" />
          </button>
          <h1 className="flex-1 truncate text-center text-sm font-semibold text-foreground px-2">
            {title}...
          </h1>
          <div className="flex items-center gap-1">
            <button className="p-2 rounded-lg hover:bg-muted/50" aria-label="Notifications">
              <Bell className="w-5 h-5 text-foreground" />
            </button>
            <button className="p-2 rounded-lg hover:bg-muted/50" aria-label="More">
              <MoreHorizontal className="w-5 h-5 text-foreground" />
            </button>
          </div>
        </div>
      </div>

      {/* Media */}
      {mediaUrl && (
        <div className="w-full aspect-video bg-muted shrink-0">
          {isVideo ? (
            <video
              src={mediaUrl}
              controls
              playsInline
              className="w-full h-full object-contain"
            />
          ) : (
            <img src={mediaUrl} alt="" className="w-full h-full object-contain" />
          )}
        </div>
      )}

      {/* Engagement */}
      <div className="px-4 py-3 flex items-center gap-4 border-b border-border/50 shrink-0">
        <button
          onClick={async () => {
            if (!isAuthenticated) {
              toast.error('Please login to like');
              return;
            }
            try {
              await likePost.mutateAsync(post.id);
              setLiked((prev) => !prev);
            } catch (e: any) {
              toast.error(e?.message || 'Failed to like');
            }
          }}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground"
        >
          <ThumbsUp className={`w-5 h-5 ${liked ? 'fill-primary text-primary' : ''}`} />
          <span className="font-medium">
            {likeCount >= 1000 ? `${(likeCount / 1000).toFixed(1)}k` : likeCount}
          </span>
        </button>
        <span className="flex items-center gap-2 text-muted-foreground">
          <MessageCircle className="w-5 h-5" />
          <span className="font-medium">
            {commentCount >= 1000 ? `${(commentCount / 1000).toFixed(1)}k` : commentCount} comments
          </span>
        </span>
      </div>

      {/* Comments - scrollable */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 min-h-0 pb-2">
        {commentsLoading ? (
          <p className="text-sm text-muted-foreground">Loading comments...</p>
        ) : comments.length > 0 ? (
          comments.map((c: PostComment) => {
            const name = c.user?.displayName || `${c.user?.firstName || ''} ${c.user?.lastName || ''}`.trim() || 'User';
            const created = c.createdAt ? timeAgo(new Date(c.createdAt)) : '';
            return (
              <div key={c.id} className="flex gap-3">
                <button
                  type="button"
                  onClick={() => c.user?.id && navigate(`/user/${c.user.id}`)}
                  className="shrink-0"
                >
                  <div className="relative">
                    <UserAvatar src={c.user?.avatar} alt={name} size="sm" />
                    <span className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full bg-primary text-[10px] text-primary-foreground flex items-center justify-center font-medium">6</span>
                  </div>
                </button>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-foreground text-sm">{name}</span>
                      <span className="text-xs text-muted-foreground">{created}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <button className="p-1 rounded hover:bg-muted/50">
                        <MoreVertical className="w-4 h-4 text-muted-foreground" />
                      </button>
                    </div>
                  </div>
                  <p className="text-sm text-foreground mt-0.5 break-words">{c.content}</p>
                  <button className="flex items-center gap-1 mt-1 text-muted-foreground hover:text-foreground text-xs">
                    <ThumbsUp className="w-3.5 h-3.5" />
                    Like
                  </button>
                </div>
              </div>
            );
          })
        ) : (
          <p className="text-sm text-muted-foreground">No comments yet. Be the first to comment.</p>
        )}
        {comments.length > 3 && (
          <button className="flex items-center gap-2 text-primary text-sm font-medium">
            <span>Jump to latest comment</span>
            <span className="inline-block border-l-4 border-l-foreground border-y-4 border-y-transparent rotate-[-90deg]" />
          </button>
        )}
      </div>

      {/* Your comment - writing screen */}
      {isAuthenticated && (
        <div className="shrink-0 border-t border-border bg-background p-3 safe-bottom">
          <div className="flex items-center gap-2 rounded-xl border border-border bg-muted/50 px-3 py-2">
            <Input
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="Your comment"
              className="flex-1 border-0 bg-transparent focus-visible:ring-0 placeholder:text-muted-foreground"
            />
            <button type="button" className="text-sm font-medium text-muted-foreground hover:text-foreground" aria-label="GIF">
              GIF
            </button>
            <button type="button" className="p-1 rounded hover:bg-muted" aria-label="Attach">
              <Paperclip className="w-4 h-4 text-muted-foreground" />
            </button>
            <Button
              size="sm"
              disabled={!commentText.trim() || commentPost.isPending}
              onClick={async () => {
                if (!commentText.trim()) return;
                try {
                  await commentPost.mutateAsync({ postId: post.id, content: commentText.trim() });
                  setCommentText('');
                  toast.success('Comment added');
                } catch (e: any) {
                  toast.error(e?.message || 'Failed to comment');
                }
              }}
            >
              Post
            </Button>
          </div>
        </div>
      )}

      </div>
      <BottomNav />
    </AppLayout>
  );
}
