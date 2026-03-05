import { useState } from 'react';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../../components/ui/dialog';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Badge } from '../../components/ui/badge';
import {
  Plus,
  Upload,
  Image,
  Video,
  Calendar,
  CheckCircle,
  XCircle,
  ExternalLink,
  Pencil,
  Building2,
  Link as LinkIcon,
} from 'lucide-react';
import { toast } from 'sonner';

export type AdStatus = 'pending' | 'approved' | 'rejected';

export interface AdItem {
  id: number;
  companyName: string;
  title: string;
  description: string;
  destinationUrl: string;
  type: 'image' | 'video';
  status: AdStatus;
  startDate: string;
  endDate: string;
  mediaUrl?: string; // preview URL after upload (mock)
}

const defaultAds: AdItem[] = [
  {
    id: 1,
    companyName: 'Acme Coffee',
    title: 'Summer Campaign',
    description: '20% off all cold drinks.',
    destinationUrl: 'https://acmecoffee.com/summer',
    type: 'image',
    status: 'approved',
    startDate: '2025-02-01',
    endDate: '2025-02-28',
  },
  {
    id: 2,
    companyName: 'TechStart Inc',
    title: 'New Menu Launch',
    description: 'Discover our new snack menu.',
    destinationUrl: 'https://techstart.io/menu',
    type: 'video',
    status: 'pending',
    startDate: '2025-02-15',
    endDate: '2025-03-15',
  },
  {
    id: 3,
    companyName: 'Wellness Studio',
    title: 'Valentine\'s Day Special',
    description: 'Couples massage package - limited time.',
    destinationUrl: 'https://wellnessstudio.com/valentine',
    type: 'image',
    status: 'rejected',
    startDate: '2025-02-10',
    endDate: '2025-02-14',
  },
];

const emptyForm = {
  companyName: '',
  title: '',
  description: '',
  destinationUrl: '',
  type: 'image' as const,
  startDate: '',
  endDate: '',
};
type FormState = typeof emptyForm;

export default function AdsPage() {
  const [ads, setAds] = useState<AdItem[]>(defaultAds);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const openCreate = () => {
    setEditingId(null);
    setForm(emptyForm);
    setSelectedFile(null);
    setIsDialogOpen(true);
  };

  const openEdit = (ad: AdItem) => {
    setEditingId(ad.id);
    setForm({
      companyName: ad.companyName,
      title: ad.title,
      description: ad.description,
      destinationUrl: ad.destinationUrl,
      type: ad.type,
      startDate: ad.startDate,
      endDate: ad.endDate,
    });
    setSelectedFile(null);
    setIsDialogOpen(true);
  };

  const handleSubmit = () => {
    if (!form.companyName.trim()) {
      toast.error('Enter company name');
      return;
    }
    if (!form.title.trim()) {
      toast.error('Enter ad title');
      return;
    }
    if (!form.destinationUrl.trim()) {
      toast.error('Enter destination URL');
      return;
    }
    try {
      new URL(form.destinationUrl);
    } catch {
      toast.error('Enter a valid URL (e.g. https://...)');
      return;
    }
    if (!form.startDate || !form.endDate) {
      toast.error('Enter start and end date');
      return;
    }
    if (!editingId && !selectedFile) {
      toast.error('Upload an image or video for the ad');
      return;
    }

    if (editingId) {
      setAds((prev) =>
        prev.map((a) =>
          a.id === editingId
            ? {
                ...a,
                ...form,
                status: a.status,
                mediaUrl: a.mediaUrl,
              }
            : a
        )
      );
      toast.success('Ad updated.');
    } else {
      const newAd: AdItem = {
        id: Math.max(0, ...ads.map((a) => a.id)) + 1,
        ...form,
        status: 'pending',
        mediaUrl: selectedFile ? URL.createObjectURL(selectedFile) : undefined,
      };
      setAds([newAd, ...ads]);
      toast.success('Ad added. Pending approval.');
    }
    setForm(emptyForm);
    setSelectedFile(null);
    setEditingId(null);
    setIsDialogOpen(false);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'rejected':
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return <Calendar className="w-4 h-4 text-yellow-500" />;
    }
  };

  const openLink = (url: string) => {
    try {
      window.open(url, '_blank', 'noopener,noreferrer');
    } catch {
      toast.error('Could not open link');
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Advertisement Management</h1>
          <p className="text-muted-foreground mt-2">
            Manage company advertisements. When a user clicks an ad, they are redirected to the link you specify.
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={(open) => { setIsDialogOpen(open); if (!open) setEditingId(null); }}>
          <DialogTrigger asChild>
            <Button onClick={openCreate}>
              <Plus className="w-4 h-4 mr-2" />
              New Advertisement
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingId ? 'Edit Advertisement' : 'Add New Advertisement'}</DialogTitle>
              <DialogDescription>
                Enter advertiser company details and the destination URL for when users click the ad.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Building2 className="w-4 h-4" />
                  Company / Advertiser name
                </Label>
                <Input
                  placeholder="e.g. Acme Coffee"
                  value={form.companyName}
                  onChange={(e) => setForm((f) => ({ ...f, companyName: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label>Ad title</Label>
                <Input
                  placeholder="e.g. Summer Campaign"
                  value={form.title}
                  onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label>Short description (optional)</Label>
                <Input
                  placeholder="Ad copy or campaign summary"
                  value={form.description}
                  onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <LinkIcon className="w-4 h-4" />
                  Destination URL *
                </Label>
                <Input
                  type="url"
                  placeholder="https://example.com/campaign"
                  value={form.destinationUrl}
                  onChange={(e) => setForm((f) => ({ ...f, destinationUrl: e.target.value }))}
                />
                <p className="text-xs text-muted-foreground">
                  This URL opens in a new tab when the user clicks the ad.
                </p>
              </div>
              <div className="space-y-2">
                <Label>Media type</Label>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant={form.type === 'image' ? 'default' : 'outline'}
                    onClick={() => setForm((f) => ({ ...f, type: 'image' }))}
                    className="flex-1"
                  >
                    <Image className="w-4 h-4 mr-2" />
                    Image
                  </Button>
                  <Button
                    type="button"
                    variant={form.type === 'video' ? 'default' : 'outline'}
                    onClick={() => setForm((f) => ({ ...f, type: 'video' }))}
                    className="flex-1"
                  >
                    <Video className="w-4 h-4 mr-2" />
                    Video
                  </Button>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Start date</Label>
                  <Input
                    type="date"
                    value={form.startDate}
                    onChange={(e) => setForm((f) => ({ ...f, startDate: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>End date</Label>
                  <Input
                    type="date"
                    value={form.endDate}
                    onChange={(e) => setForm((f) => ({ ...f, endDate: e.target.value }))}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Upload media {editingId ? '(to replace)' : ''}</Label>
                <div className="border-2 border-dashed rounded-lg p-6 text-center">
                  <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                  <Input
                    type="file"
                    accept={form.type === 'image' ? 'image/*' : 'video/*'}
                    onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                    className="max-w-xs mx-auto"
                  />
                  {selectedFile && (
                    <p className="text-sm text-muted-foreground mt-2 truncate max-w-full px-2">{selectedFile.name}</p>
                  )}
                </div>
              </div>
              <Button onClick={handleSubmit} className="w-full">
                {editingId ? 'Update' : 'Add Advertisement'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {ads.map((ad) => (
          <Card key={ad.id} className="flex flex-col">
            <CardHeader className="pb-2">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                    <Building2 className="w-3.5 h-3.5 shrink-0" />
                    <span className="truncate">{ad.companyName}</span>
                  </div>
                  <CardTitle className="flex items-center gap-2 text-base">
                    {ad.type === 'image' ? <Image className="w-4 h-4 shrink-0" /> : <Video className="w-4 h-4 shrink-0" />}
                    <span className="truncate">{ad.title}</span>
                  </CardTitle>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  {getStatusIcon(ad.status)}
                  <Badge
                    variant={
                      ad.status === 'approved' ? 'default' : ad.status === 'pending' ? 'secondary' : 'destructive'
                    }
                  >
                    {ad.status === 'approved' ? 'Approved' : ad.status === 'pending' ? 'Pending' : 'Rejected'}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent className="flex-1 space-y-3">
              {ad.description && (
                <p className="text-sm text-muted-foreground line-clamp-2">{ad.description}</p>
              )}
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="w-4 h-4 shrink-0" />
                <span>{ad.startDate} – {ad.endDate}</span>
              </div>
              <div className="flex items-center gap-2 min-w-0">
                <LinkIcon className="w-4 h-4 shrink-0 text-muted-foreground" />
                <span className="text-xs text-muted-foreground truncate" title={ad.destinationUrl}>
                  {ad.destinationUrl}
                </span>
              </div>
              <div className="flex flex-wrap gap-2 pt-1">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 min-w-0"
                  onClick={() => openLink(ad.destinationUrl)}
                >
                  <ExternalLink className="w-4 h-4 mr-1" />
                  Go to link
                </Button>
                <Button variant="ghost" size="sm" onClick={() => openEdit(ad)}>
                  <Pencil className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
