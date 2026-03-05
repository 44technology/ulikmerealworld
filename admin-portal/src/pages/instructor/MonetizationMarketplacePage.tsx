import { useState } from 'react';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../../components/ui/dialog';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Badge } from '../../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import {
  FileText,
  Plus,
  ExternalLink,
  Image as ImageIcon,
  Link2,
  Percent,
  DollarSign,
  Package,
  Download,
} from 'lucide-react';
import { toast } from 'sonner';

type ProductType = 'own_product' | 'affiliate';

type DigitalProductItem = {
  id: string;
  type: ProductType;
  title: string;
  description: string;
  price?: number;
  productUrl: string;
  imageUrl?: string;
  commissionPercent?: number; // for affiliate
  status: 'active' | 'draft';
};

export default function MonetizationMarketplacePage() {
  const [items, setItems] = useState<DigitalProductItem[]>([
    {
      id: '1',
      type: 'own_product',
      title: 'Beginner Yoga Guide (PDF)',
      description: 'Digital guide with poses and routines for home practice.',
      price: 12,
      productUrl: 'https://example.com/download/yoga-guide',
      imageUrl: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=400',
      status: 'active',
    },
    {
      id: '2',
      type: 'affiliate',
      title: 'Meditation App – Annual Plan',
      description: 'Partner app subscription – you earn commission on each sign-up.',
      productUrl: 'https://example.com/affiliate/meditation-app',
      commissionPercent: 15,
      status: 'active',
    },
    {
      id: '3',
      type: 'own_product',
      title: 'Workshop Recording + Worksheets',
      description: 'Full recording and PDF worksheets from the last workshop.',
      price: 29,
      productUrl: 'https://example.com/store/recordings',
      status: 'active',
    },
  ]);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [type, setType] = useState<ProductType>('own_product');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [productUrl, setProductUrl] = useState('');
  const [commissionPercent, setCommissionPercent] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        toast.error('Please upload an image file');
        return;
      }
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    } else {
      setImageFile(null);
      if (imagePreview) URL.revokeObjectURL(imagePreview);
      setImagePreview(null);
    }
  };

  const handleSubmit = () => {
    if (!title.trim()) {
      toast.error('Please enter a product title');
      return;
    }
    if (!productUrl.trim()) {
      toast.error('Please enter the product or affiliate link');
      return;
    }
    try {
      new URL(productUrl.trim());
    } catch {
      toast.error('Please enter a valid URL');
      return;
    }
    if (type === 'own_product' && (!price || parseFloat(price) < 0)) {
      toast.error('Please enter a valid price for your product');
      return;
    }
    if (type === 'affiliate') {
      const commission = commissionPercent ? parseFloat(commissionPercent) : 0;
      if (commission < 0 || commission > 100) {
        toast.error('Commission must be between 0 and 100');
        return;
      }
    }

    const imageUrl = imagePreview || (imageFile ? URL.createObjectURL(imageFile) : undefined);
    const newItem: DigitalProductItem = {
      id: String(Date.now()),
      type,
      title: title.trim(),
      description: description.trim(),
      price: type === 'own_product' && price ? parseFloat(price) : undefined,
      productUrl: productUrl.trim(),
      imageUrl,
      commissionPercent:
        type === 'affiliate' && commissionPercent ? parseFloat(commissionPercent) : undefined,
      status: 'active',
    };
    setItems([newItem, ...items]);
    setTitle('');
    setDescription('');
    setPrice('');
    setProductUrl('');
    setCommissionPercent('');
    setImageFile(null);
    setImagePreview(null);
    setIsDialogOpen(false);
    toast.success(type === 'affiliate' ? 'Affiliate product added!' : 'Digital product added!');
  };

  const handleDialogClose = (open: boolean) => {
    if (!open) {
      setImageFile(null);
      if (imagePreview) URL.revokeObjectURL(imagePreview);
      setImagePreview(null);
      setProductUrl('');
      setCommissionPercent('');
    }
    setIsDialogOpen(open);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Digital Products</h1>
          <p className="text-muted-foreground mt-2">
            Sell your own digital products (guides, recordings, PDFs) or promote affiliate digital
            offerings and earn commission. Add links and optional cover images.
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={handleDialogClose}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Add Digital Product
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add Digital Product or Affiliate</DialogTitle>
              <DialogDescription>
                Add your own digital product (e.g. PDF, recording, course) or an affiliate link to
                earn commission.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Type</Label>
                <Tabs value={type} onValueChange={(v) => setType(v as ProductType)}>
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="own_product" className="gap-2">
                      <Package className="w-4 h-4" />
                      My product
                    </TabsTrigger>
                    <TabsTrigger value="affiliate" className="gap-2">
                      <Link2 className="w-4 h-4" />
                      Affiliate
                    </TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>

              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  placeholder="e.g. Yoga Guide PDF, Partner App Subscription"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description (optional)</Label>
                <Input
                  id="description"
                  placeholder="Short description for your audience"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>

              {type === 'own_product' && (
                <div className="space-y-2">
                  <Label htmlFor="price">Price ($)</Label>
                  <Input
                    id="price"
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                  />
                </div>
              )}
              {type === 'affiliate' && (
                <div className="space-y-2">
                  <Label htmlFor="commission">Your commission (%)</Label>
                  <Input
                    id="commission"
                    type="number"
                    min="0"
                    max="100"
                    step="0.5"
                    placeholder="e.g. 10"
                    value={commissionPercent}
                    onChange={(e) => setCommissionPercent(e.target.value)}
                  />
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="productUrl">
                  {type === 'own_product' ? 'Product / checkout URL' : 'Affiliate link'}
                </Label>
                <Input
                  id="productUrl"
                  type="url"
                  placeholder="https://..."
                  value={productUrl}
                  onChange={(e) => setProductUrl(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label>Image (optional)</Label>
                <div className="flex items-center gap-4">
                  <Input type="file" accept="image/*" onChange={handleImageChange} />
                  {imagePreview && (
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="h-20 w-20 object-cover rounded-lg border"
                    />
                  )}
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={() => handleDialogClose(false)}>
                Cancel
              </Button>
              <Button onClick={handleSubmit}>Add</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue="all" className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="own">My digital products</TabsTrigger>
          <TabsTrigger value="affiliate">Affiliate</TabsTrigger>
        </TabsList>
        <TabsContent value="all" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {items.map((item) => (
              <DigitalProductCard key={item.id} item={item} />
            ))}
          </div>
        </TabsContent>
        <TabsContent value="own" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {items
              .filter((i) => i.type === 'own_product')
              .map((item) => (
                <DigitalProductCard key={item.id} item={item} />
              ))}
          </div>
        </TabsContent>
        <TabsContent value="affiliate" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {items
              .filter((i) => i.type === 'affiliate')
              .map((item) => (
                <DigitalProductCard key={item.id} item={item} />
              ))}
          </div>
        </TabsContent>
      </Tabs>

      {items.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <FileText className="w-12 h-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">
              No digital products or affiliate links yet. Add your first item to start monetizing.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function DigitalProductCard({ item }: { item: DigitalProductItem }) {
  return (
    <Card className="overflow-hidden">
      {item.imageUrl && (
        <div className="aspect-video w-full overflow-hidden bg-muted">
          <img
            src={item.imageUrl}
            alt={item.title}
            className="h-full w-full object-cover"
          />
        </div>
      )}
      <CardHeader className="flex flex-row items-start justify-between gap-2">
        <div className="space-y-1.5">
          <CardTitle className="text-lg flex items-center gap-2">
            {item.imageUrl ? (
              <ImageIcon className="w-4 h-4 text-muted-foreground" />
            ) : (
              <FileText className="w-4 h-4 text-muted-foreground" />
            )}
            {item.title}
          </CardTitle>
          <CardDescription className="line-clamp-2">{item.description || '—'}</CardDescription>
        </div>
        <Badge variant={item.type === 'affiliate' ? 'secondary' : 'default'}>
          {item.type === 'affiliate' ? (
            <>
              <Percent className="w-3 h-3 mr-1" />
              Affiliate
              {item.commissionPercent != null && ` ${item.commissionPercent}%`}
            </>
          ) : (
            <>
              <Package className="w-3 h-3 mr-1" />
              My product
            </>
          )}
        </Badge>
      </CardHeader>
      <CardContent className="flex items-center justify-between gap-2">
        {item.price != null && (
          <span className="font-semibold text-primary flex items-center gap-1">
            <DollarSign className="w-4 h-4" />
            {item.price.toFixed(2)}
          </span>
        )}
        <Button asChild size="sm" className="ml-auto">
          <a href={item.productUrl} target="_blank" rel="noopener noreferrer">
            {item.type === 'affiliate' ? (
              <span className="inline-flex items-center"><ExternalLink className="w-4 h-4 mr-2" /> Get offer</span>
            ) : (
              <span className="inline-flex items-center"><Download className="w-4 h-4 mr-2" /> Get / Buy</span>
            )}
          </a>
        </Button>
      </CardContent>
    </Card>
  );
}
