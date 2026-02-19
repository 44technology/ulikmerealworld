import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, X, Globe, Lock, Camera } from 'lucide-react';
import AppLayout from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { getAuthToken, API_ORIGIN } from '@/lib/api';
import { CLASS_AND_COMMUNITY_CATEGORIES } from '@/constants/categories';

const MOCK_COMMUNITIES_KEY = 'ulikme_mock_communities';

export default function CreateCommunityPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [showFollowerDialog, setShowFollowerDialog] = useState(false);
  const [createdCommunityId, setCreatedCommunityId] = useState<string | null>(null);
  const [followerCount, setFollowerCount] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
    categoryOtherText: '', // when category === 'other'
    isPublic: true,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image size must be less than 5MB');
        return;
      }
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      toast.error('Please enter a community name');
      return;
    }

    setIsLoading(true);

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('name', formData.name);
      formDataToSend.append('description', formData.description);
      formDataToSend.append('isPublic', formData.isPublic.toString());
      const categoryValue = formData.category === 'other' ? (formData.categoryOtherText?.trim() || 'other') : formData.category;
      if (categoryValue) formDataToSend.append('category', categoryValue);
      
      if (selectedImage) {
        formDataToSend.append('image', selectedImage);
      }

      const token = getAuthToken();
      const apiBase = API_ORIGIN;
      const response = await fetch(`${apiBase}/api/communities`, {
        method: 'POST',
        headers: token ? { 'Authorization': `Bearer ${token}` } : {},
        body: formDataToSend,
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error((errData as { message?: string }).message || 'Failed to create community');
      }

      const result = await response.json();
      const id = result?.data?.id ?? result?.id;
      setCreatedCommunityId(id);
      setShowFollowerDialog(true);
    } catch (error: unknown) {
      const isNetworkError =
        error instanceof TypeError && (error.message === 'Failed to fetch' || (error as any).name === 'TypeError');
      if (isNetworkError) {
        // Backend yok: mock olarak kaydet, sayfa çalışsın
        const mockId = `mock-${Date.now()}`;
        try {
          const list = JSON.parse(localStorage.getItem(MOCK_COMMUNITIES_KEY) || '[]');
          list.push({
            id: mockId,
            name: formData.name,
            description: formData.description,
            category: formData.category === 'other' ? (formData.categoryOtherText?.trim() || 'other') : (formData.category || undefined),
            image: imagePreview || undefined,
            isPublic: formData.isPublic,
            memberCount: 1,
            creator: { id: user?.id ?? '', displayName: user?.displayName ?? user?.firstName ?? 'You' },
          });
          localStorage.setItem(MOCK_COMMUNITIES_KEY, JSON.stringify(list));
        } catch (_) {}
        setCreatedCommunityId(mockId);
        toast.success('Community created! (offline mode)');
        navigate(`/community/${mockId}`);
      } else {
        toast.error(error instanceof Error ? error.message : 'Failed to create community');
      }
    } finally {
      setIsLoading(false);
    }
  };

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
          <h1 className="text-xl font-bold text-foreground">Create Community</h1>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="px-4 pb-6 space-y-6">
        {/* Image Upload */}
        <div className="space-y-2">
          <Label>Community Image</Label>
          <div className="flex items-center gap-4">
            {imagePreview ? (
              <div className="relative w-32 h-32 rounded-xl overflow-hidden border-2 border-border">
                <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => {
                    setImagePreview(null);
                    setSelectedImage(null);
                  }}
                  className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center w-32 h-32 border-2 border-dashed border-border rounded-xl cursor-pointer hover:border-primary transition-colors">
                <Camera className="w-8 h-8 text-muted-foreground mb-2" />
                <span className="text-xs text-muted-foreground text-center px-2">Upload Image</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
              </label>
            )}
            <div className="flex-1">
              <p className="text-sm text-muted-foreground">
                Upload a high-quality image for your community (max 5MB)
              </p>
            </div>
          </div>
        </div>

        {/* Name */}
        <div className="space-y-2">
          <Label htmlFor="name">Community Name *</Label>
          <Input
            id="name"
            name="name"
            placeholder="e.g., Miami Tennis Club"
            value={formData.name}
            onChange={handleChange}
            required
          />
        </div>

        {/* Description */}
        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            name="description"
            placeholder="Tell people what your community is about..."
            value={formData.description}
            onChange={handleChange}
            rows={4}
          />
        </div>

        {/* Category */}
        <div className="space-y-2">
          <Label>Category</Label>
          <Select value={formData.category || undefined} onValueChange={(v) => setFormData((prev) => ({ ...prev, category: v || '' }))}>
            <SelectTrigger className="h-12 rounded-xl">
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              {CLASS_AND_COMMUNITY_CATEGORIES.map((cat) => {
                const Icon = cat.icon;
                return (
                  <SelectItem key={cat.value} value={cat.value} className="flex items-center gap-3 rounded-lg py-2.5">
                    <Icon className="h-5 w-5 shrink-0 text-muted-foreground" />
                    {cat.label}
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>
          {formData.category === 'other' && (
            <Input
              placeholder="Specify category (optional)"
              value={formData.categoryOtherText}
              onChange={(e) => setFormData((prev) => ({ ...prev, categoryOtherText: e.target.value }))}
              className="h-12 rounded-xl mt-2"
            />
          )}
        </div>

        {/* Privacy & visibility (who can see members and content, search engines) */}
        <div className="space-y-3">
          <Label>Privacy & visibility</Label>
          <p className="text-xs text-muted-foreground">
            Choose who can see members and posts, and whether the community is visible to search engines.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <label
              className={`flex flex-col p-4 rounded-xl border-2 cursor-pointer transition-colors ${
                !formData.isPublic ? 'border-primary bg-primary/5' : 'border-border hover:bg-muted/50'
              }`}
            >
              <div className="flex items-center gap-3">
                <input
                  type="radio"
                  name="isPublic"
                  value="false"
                  checked={formData.isPublic === false}
                  onChange={() => setFormData(prev => ({ ...prev, isPublic: false }))}
                  className="sr-only"
                />
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                  !formData.isPublic ? 'border-primary' : 'border-border'
                }`}>
                  {!formData.isPublic && <div className="w-3 h-3 rounded-full bg-primary" />}
                </div>
                <Lock className="w-5 h-5 text-muted-foreground shrink-0" />
                <span className="font-medium text-foreground">Private</span>
              </div>
              <p className="text-xs text-muted-foreground mt-2 pl-8">
                Only members can see who&apos;s in the group and what they post. Content is hidden from search engines.
              </p>
            </label>

            <label
              className={`flex flex-col p-4 rounded-xl border-2 cursor-pointer transition-colors ${
                formData.isPublic ? 'border-primary bg-primary/5' : 'border-border hover:bg-muted/50'
              }`}
            >
              <div className="flex items-center gap-3">
                <input
                  type="radio"
                  name="isPublic"
                  value="true"
                  checked={formData.isPublic === true}
                  onChange={() => setFormData(prev => ({ ...prev, isPublic: true }))}
                  className="sr-only"
                />
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                  formData.isPublic ? 'border-primary' : 'border-border'
                }`}>
                  {formData.isPublic && <div className="w-3 h-3 rounded-full bg-primary" />}
                </div>
                <Globe className="w-5 h-5 text-muted-foreground shrink-0" />
                <span className="font-medium text-foreground">Public</span>
              </div>
              <p className="text-xs text-muted-foreground mt-2 pl-8">
                Anyone can see who&apos;s in the group and what they post. Content is discoverable by search engines.
              </p>
            </label>
          </div>
        </div>

        {/* Support contact */}
        <div className="p-4 rounded-xl bg-muted/50 border border-border">
          <p className="text-sm text-muted-foreground">
            Support email:{' '}
            <a
              href={`mailto:${import.meta.env.VITE_SUPPORT_EMAIL || 'support@ulikme.com'}`}
              className="font-medium text-primary hover:underline"
            >
              {import.meta.env.VITE_SUPPORT_EMAIL || 'support@ulikme.com'}
            </a>
            {' '}
            <span className="text-muted-foreground/80">(change in settings)</span>
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Contact this address for help with your community or account.
          </p>
        </div>

        <Button
          type="submit"
          className="w-full h-12 bg-gradient-primary text-primary-foreground"
          disabled={isLoading}
        >
          {isLoading ? 'Creating...' : 'Create Community'}
        </Button>
      </form>

      {/* Social Media Followers Dialog */}
      <Dialog open={showFollowerDialog} onOpenChange={setShowFollowerDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Social Media Followers</DialogTitle>
            <DialogDescription>
              How many followers do you have across your main social media platforms (Instagram, Twitter, YouTube, etc.)?
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="followerCount">Total Followers</Label>
              <Input
                id="followerCount"
                type="number"
                placeholder="e.g., 10000"
                value={followerCount}
                onChange={(e) => setFollowerCount(e.target.value)}
                min="0"
              />
              <p className="text-xs text-muted-foreground">
                Add up your followers from Instagram, Twitter, YouTube, TikTok, etc.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-muted border border-border">
              <p className="text-sm font-medium text-foreground mb-2">What this means:</p>
              <ul className="text-xs text-muted-foreground space-y-1">
                <li>• Less than 5,000: You can create communities</li>
                <li>• 5,000 or more: You can request to create classes</li>
              </ul>
            </div>

            <div className="flex gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowFollowerDialog(false);
                  if (createdCommunityId) navigate(`/community/${createdCommunityId}`);
                }}
                className="flex-1"
              >
                Skip
              </Button>
              <Button
                type="button"
                onClick={async () => {
                  if (!followerCount || parseInt(followerCount) < 0) {
                    toast.error('Please enter a valid follower count');
                    return;
                  }

                  try {
                    const token = getAuthToken();
                    const response = await fetch(`${API_ORIGIN}/api/users/social-followers`, {
                      method: 'PUT',
                      headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`,
                      },
                      body: JSON.stringify({
                        socialMediaFollowers: parseInt(followerCount),
                      }),
                    });

                    if (!response.ok) {
                      throw new Error('Failed to save follower count');
                    }

                    const followerCountNum = parseInt(followerCount);
                    if (followerCountNum >= 5000) {
                      toast.success('Follower count saved! You can now request to create classes.');
                    } else {
                      toast.success('Follower count saved! You can create communities.');
                    }
                    setShowFollowerDialog(false);
                    if (createdCommunityId) navigate(`/community/${createdCommunityId}`);
                  } catch (error: unknown) {
                    toast.error(error instanceof Error ? error.message : 'Failed to save follower count');
                    setShowFollowerDialog(false);
                    if (createdCommunityId) navigate(`/community/${createdCommunityId}`);
                  }
                }}
                className="flex-1 bg-gradient-primary text-primary-foreground"
              >
                Continue
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
