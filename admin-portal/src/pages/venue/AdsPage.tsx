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
    title: 'Yaz Kampanyası',
    description: 'Tüm soğuk içeceklerde %20 indirim.',
    destinationUrl: 'https://acmecoffee.com/summer',
    type: 'image',
    status: 'approved',
    startDate: '2025-02-01',
    endDate: '2025-02-28',
  },
  {
    id: 2,
    companyName: 'TechStart Inc',
    title: 'Yeni Menü Lansmanı',
    description: 'Yeni atıştırmalık menüsünü keşfedin.',
    destinationUrl: 'https://techstart.io/menu',
    type: 'video',
    status: 'pending',
    startDate: '2025-02-15',
    endDate: '2025-03-15',
  },
  {
    id: 3,
    companyName: 'Wellness Studio',
    title: 'Sevgililer Günü Özel',
    description: 'İkili masaj paketi - sınırlı süre.',
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
      toast.error('Şirket adı girin');
      return;
    }
    if (!form.title.trim()) {
      toast.error('Reklam başlığı girin');
      return;
    }
    if (!form.destinationUrl.trim()) {
      toast.error('Tıklanınca gidilecek link (URL) girin');
      return;
    }
    try {
      new URL(form.destinationUrl);
    } catch {
      toast.error('Geçerli bir URL girin (örn. https://...)');
      return;
    }
    if (!form.startDate || !form.endDate) {
      toast.error('Başlangıç ve bitiş tarihi girin');
      return;
    }
    if (!editingId && !selectedFile) {
      toast.error('Reklam için görsel veya video yükleyin');
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
      toast.success('Reklam güncellendi.');
    } else {
      const newAd: AdItem = {
        id: Math.max(0, ...ads.map((a) => a.id)) + 1,
        ...form,
        status: 'pending',
        mediaUrl: selectedFile ? URL.createObjectURL(selectedFile) : undefined,
      };
      setAds([newAd, ...ads]);
      toast.success('Reklam eklendi. Onay bekliyor.');
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
      toast.error('Link açılamadı');
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Reklam Yönetimi</h1>
          <p className="text-muted-foreground mt-2">
            Şirket reklamlarını yönetin. Reklama tıklandığında kullanıcı belirttiğiniz linke yönlendirilir.
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={(open) => { setIsDialogOpen(open); if (!open) setEditingId(null); }}>
          <DialogTrigger asChild>
            <Button onClick={openCreate}>
              <Plus className="w-4 h-4 mr-2" />
              Yeni Reklam
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingId ? 'Reklamı Düzenle' : 'Yeni Reklam Ekle'}</DialogTitle>
              <DialogDescription>
                Reklam veren şirket bilgileri ve tıklanınca gidilecek linki girin.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Building2 className="w-4 h-4" />
                  Şirket / Reklam veren adı
                </Label>
                <Input
                  placeholder="Örn: Acme Coffee"
                  value={form.companyName}
                  onChange={(e) => setForm((f) => ({ ...f, companyName: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label>Reklam başlığı</Label>
                <Input
                  placeholder="Örn: Yaz Kampanyası"
                  value={form.title}
                  onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label>Kısa açıklama (isteğe bağlı)</Label>
                <Input
                  placeholder="Reklam metni veya kampanya özeti"
                  value={form.description}
                  onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <LinkIcon className="w-4 h-4" />
                  Tıklanınca gidilecek link (URL) *
                </Label>
                <Input
                  type="url"
                  placeholder="https://sirket.com/kampanya"
                  value={form.destinationUrl}
                  onChange={(e) => setForm((f) => ({ ...f, destinationUrl: e.target.value }))}
                />
                <p className="text-xs text-muted-foreground">
                  Kullanıcı reklama tıkladığında bu adres yeni sekmede açılır.
                </p>
              </div>
              <div className="space-y-2">
                <Label>Medya türü</Label>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant={form.type === 'image' ? 'default' : 'outline'}
                    onClick={() => setForm((f) => ({ ...f, type: 'image' }))}
                    className="flex-1"
                  >
                    <Image className="w-4 h-4 mr-2" />
                    Görsel
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
                  <Label>Başlangıç tarihi</Label>
                  <Input
                    type="date"
                    value={form.startDate}
                    onChange={(e) => setForm((f) => ({ ...f, startDate: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Bitiş tarihi</Label>
                  <Input
                    type="date"
                    value={form.endDate}
                    onChange={(e) => setForm((f) => ({ ...f, endDate: e.target.value }))}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Medya yükle {editingId ? '(değiştirmek için)' : ''}</Label>
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
                {editingId ? 'Güncelle' : 'Reklam Ekle'}
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
                    {ad.status === 'approved' ? 'Onaylı' : ad.status === 'pending' ? 'Bekliyor' : 'Reddedildi'}
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
                  Linke git
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
