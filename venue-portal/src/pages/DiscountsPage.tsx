import { useState } from 'react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Badge } from '../components/ui/badge';
import { Plus, Percent, Tag, Calendar, MapPin, Upload, Image as ImageIcon, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';
import { VENUE_LOCATIONS, getLocationNameById } from '../lib/venueLocations';

type DiscountType = 'food' | 'drink' | 'other';

type DiscountItem = {
  id: number;
  type: DiscountType;
  item: string;
  discount: number;
  status: string;
  endDate: string;
  locationId?: string;
  imageUrl?: string;
  purchaseUrl?: string;
};

export default function DiscountsPage() {
  const [discounts, setDiscounts] = useState<DiscountItem[]>([
    { id: 1, type: 'food', item: 'Pizza', discount: 20, status: 'active', endDate: '2025-02-15', locationId: 'loc-1', imageUrl: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=200', purchaseUrl: 'https://example.com/order/pizza' },
    { id: 2, type: 'drink', item: 'Coffee', discount: 15, status: 'active', endDate: '2025-02-20', locationId: 'loc-2', purchaseUrl: 'https://example.com/menu' },
    { id: 3, type: 'other', item: 'Tennis racket rental', discount: 10, status: 'active', endDate: '2025-03-01', locationId: 'loc-1', purchaseUrl: 'https://example.com/rentals' },
  ]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [item, setItem] = useState('');
  const [discount, setDiscount] = useState('');
  const [endDate, setEndDate] = useState('');
  const [purchaseUrl, setPurchaseUrl] = useState('');
  const [locationId, setLocationId] = useState(VENUE_LOCATIONS[0]?.id ?? '');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const hasMultipleLocations = VENUE_LOCATIONS.length > 1;

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
    if (!item.trim() || !discount || !endDate) {
      toast.error('Please fill all required fields');
      return;
    }
    if (hasMultipleLocations && !locationId) {
      toast.error('Please select a location');
      return;
    }
    if (purchaseUrl.trim()) {
      try {
        new URL(purchaseUrl.trim());
      } catch {
        toast.error('Please enter a valid purchase URL');
        return;
      }
    }
    const newDiscount: DiscountItem = {
      id: discounts.length + 1,
      type: 'other',
      item: item.trim(),
      discount: parseInt(discount, 10),
      status: 'active',
      endDate,
      locationId: hasMultipleLocations ? locationId : (VENUE_LOCATIONS[0]?.id ?? ''),
      imageUrl: imagePreview || undefined,
      purchaseUrl: purchaseUrl.trim() || undefined,
    };
    setDiscounts([newDiscount, ...discounts]);
    setItem('');
    setDiscount('');
    setEndDate('');
    setPurchaseUrl('');
    setLocationId(VENUE_LOCATIONS[0]?.id ?? '');
    setImageFile(null);
    setImagePreview(null);
    setIsDialogOpen(false);
    toast.success('Discount created successfully!');
  };

  const handleDialogClose = (open: boolean) => {
    if (!open) {
      setImageFile(null);
      if (imagePreview) URL.revokeObjectURL(imagePreview);
      setImagePreview(null);
      setPurchaseUrl('');
    }
    setIsDialogOpen(open);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Discounts</h1>
          <p className="text-muted-foreground mt-2">Manage discounts for any product or service (food, drinks, equipment, services, etc.)</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={handleDialogClose}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Create Discount
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New Discount</DialogTitle>
              <DialogDescription>Set a discount for any product or service your venue offers</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Product or service</Label>
                <Input
                  placeholder="e.g. Pizza, Coffee, Tennis racket rental, 1-hour massage, Yoga class"
                  value={item}
                  onChange={(e) => setItem(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">Anything you offer: food, drinks, equipment, activities, services</p>
              </div>
              <div className="space-y-2">
                <Label>Image (optional)</Label>
                <div className="border-2 border-dashed rounded-lg p-4 text-center">
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="max-w-xs mx-auto cursor-pointer"
                  />
                  {imagePreview && (
                    <div className="mt-3 relative inline-block">
                      <img src={imagePreview} alt="Preview" className="h-24 w-auto rounded-lg object-cover border border-border" />
                    </div>
                  )}
                  {!imagePreview && (
                    <p className="text-xs text-muted-foreground mt-2 flex items-center justify-center gap-1">
                      <Upload className="w-4 h-4" /> Upload an image for this discount
                    </p>
                  )}
                </div>
              </div>
              <div className="space-y-2">
                <Label>Discount (%)</Label>
                <Input
                  type="number"
                  placeholder="e.g., 20"
                  value={discount}
                  onChange={(e) => setDiscount(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Purchase link (optional)</Label>
                <Input
                  type="url"
                  placeholder="https://... (link where user can buy or get the offer)"
                  value={purchaseUrl}
                  onChange={(e) => setPurchaseUrl(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">Users will open this link to purchase or claim the offer</p>
              </div>
              {hasMultipleLocations && (
                <div className="space-y-2">
                  <Label>Apply to location</Label>
                  <select
                    value={locationId}
                    onChange={(e) => setLocationId(e.target.value)}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  >
                    {VENUE_LOCATIONS.map((loc) => (
                      <option key={loc.id} value={loc.id}>
                        {loc.name}{loc.address ? ` — ${loc.address}` : ''}
                      </option>
                    ))}
                  </select>
                  <p className="text-xs text-muted-foreground">This discount will apply only to the selected location.</p>
                </div>
              )}
              <div className="space-y-2">
                <Label>End Date</Label>
                <Input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </div>
              <Button onClick={handleSubmit} className="w-full">
                Create Discount
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {discounts.map((disc) => (
          <Card key={disc.id} className="overflow-hidden">
            {disc.imageUrl && (
              <div className="aspect-video w-full bg-muted">
                <img src={disc.imageUrl} alt={disc.item} className="w-full h-full object-cover" />
              </div>
            )}
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  {disc.imageUrl ? <ImageIcon className="w-4 h-4 text-primary" /> : <Tag className="w-4 h-4 text-primary" />}
                  {disc.item}
                </CardTitle>
                <Badge variant={disc.status === 'active' ? 'default' : 'secondary'}>
                  {disc.status}
                </Badge>
              </div>
              <CardDescription>
                <div className="flex items-center gap-2 mt-2">
                  <Percent className="w-4 h-4" />
                  <span>{disc.discount}% off</span>
                </div>
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {hasMultipleLocations && disc.locationId && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <MapPin className="w-4 h-4 shrink-0" />
                  <span>{getLocationNameById(disc.locationId)}</span>
                </div>
              )}
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="w-4 h-4 shrink-0" />
                <span>Ends: {disc.endDate}</span>
              </div>
              {disc.purchaseUrl && (
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full mt-2"
                  asChild
                >
                  <a href={disc.purchaseUrl} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Buy / Get offer
                  </a>
                </Button>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
