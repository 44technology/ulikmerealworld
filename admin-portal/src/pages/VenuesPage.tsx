import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, Edit, Upload, Video, Image as ImageIcon, MapPin, Eye, Plus } from 'lucide-react';
import { Card, CardContent } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '../components/ui/dialog';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../components/ui/tabs';
import { toast } from 'sonner';

type ApprovalStatus = 'pending' | 'approved' | 'rejected';

type VenueItem = {
  id: string;
  name: string;
  category: string;
  address: string;
  city?: string;
  state?: string;
  country?: string;
  rating: number;
  status: string;
  approvalStatus: ApprovalStatus;
  menuItems: number;
  images: number;
  videos: number;
};

// Mock data
const initialVenues: VenueItem[] = [
  {
    id: '1',
    name: 'Coffee House',
    category: 'Café',
    address: '123 Main St, Miami, FL',
    rating: 4.5,
    status: 'active',
    approvalStatus: 'pending',
    menuItems: 15,
    images: 8,
    videos: 2,
  },
  {
    id: '2',
    name: 'Fine Dining Restaurant',
    category: 'Restaurant',
    address: '456 Ocean Dr, Miami, FL',
    rating: 4.8,
    status: 'active',
    approvalStatus: 'approved',
    menuItems: 25,
    images: 12,
    videos: 1,
  },
];

const emptyCreateForm = {
  name: '',
  category: '',
  address: '',
  city: '',
  state: '',
  country: '',
};

export default function VenuesPage() {
  const [venues, setVenues] = useState<VenueItem[]>(initialVenues);
  const [searchQuery, setSearchQuery] = useState('');
  const [approvalFilter, setApprovalFilter] = useState<'all' | ApprovalStatus>('all');
  const [selectedVenue, setSelectedVenue] = useState<VenueItem | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [createForm, setCreateForm] = useState(emptyCreateForm);

  const filteredVenues = venues.filter((venue) => {
    const matchesSearch =
      venue.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      venue.address.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus =
      approvalFilter === 'all' || venue.approvalStatus === approvalFilter;
    return matchesSearch && matchesStatus;
  });

  const pendingCount = venues.filter((v) => v.approvalStatus === 'pending').length;

  const handleCreateVenue = () => {
    if (!createForm.name.trim()) {
      toast.error('Venue name is required');
      return;
    }
    if (!createForm.category.trim()) {
      toast.error('Category is required');
      return;
    }
    if (!createForm.address.trim()) {
      toast.error('Address is required');
      return;
    }
    const addressLine = [createForm.address, createForm.city, createForm.state, createForm.country]
      .filter(Boolean)
      .join(', ');
    const newVenue: VenueItem = {
      id: String(Math.max(0, ...venues.map((v) => parseInt(v.id, 10) || 0)) + 1),
      name: createForm.name.trim(),
      category: createForm.category.trim(),
      address: addressLine || createForm.address,
      city: createForm.city || undefined,
      state: createForm.state || undefined,
      country: createForm.country || undefined,
      rating: 0,
      status: 'active',
      approvalStatus: 'approved',
      menuItems: 0,
      images: 0,
      videos: 0,
    };
    setVenues((prev) => [newVenue, ...prev]);
    setCreateForm(emptyCreateForm);
    setIsCreateDialogOpen(false);
    toast.success('Venue created successfully.');
  };
  const getApprovalBadgeVariant = (status: ApprovalStatus) =>
    status === 'pending' ? 'secondary' : status === 'approved' ? 'default' : 'destructive';
  const getApprovalLabel = (status: ApprovalStatus) =>
    status === 'pending' ? 'Pending' : status === 'approved' ? 'Approved' : 'Rejected';

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Venues</h1>
          <p className="text-muted-foreground mt-1">Manage restaurants, cafes, and venues</p>
        </div>
        <Button onClick={() => setIsCreateDialogOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Add New Venue
        </Button>
      </div>

      {/* Search & Filter */}
      <Card>
        <CardContent className="pt-6 space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              placeholder="Search venues by name or address..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Tabs value={approvalFilter} onValueChange={(v) => setApprovalFilter(v as 'all' | ApprovalStatus)}>
            <TabsList>
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="pending">
                Pending {pendingCount > 0 && `(${pendingCount})`}
              </TabsTrigger>
              <TabsTrigger value="approved">Approved</TabsTrigger>
              <TabsTrigger value="rejected">Rejected</TabsTrigger>
            </TabsList>
          </Tabs>
        </CardContent>
      </Card>

      {/* Venues List */}
      <div className="grid gap-4">
        {filteredVenues.map((venue) => (
          <Card key={venue.id}>
            <CardContent className="pt-6">
              <div className="flex items-start gap-4">
                {/* Venue Image */}
                <div className="w-24 h-24 rounded-xl overflow-hidden bg-muted flex-shrink-0">
                  <img
                    src={`https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=150`}
                    alt={venue.name}
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Venue Info */}
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <h3 className="text-lg font-semibold text-foreground">{venue.name}</h3>
                        <Badge>{venue.category}</Badge>
                        <Badge variant={getApprovalBadgeVariant(venue.approvalStatus)}>
                          {getApprovalLabel(venue.approvalStatus)}
                        </Badge>
                        <Badge variant={venue.status === 'active' ? 'default' : 'outline'}>
                          {venue.status}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                        <MapPin className="w-4 h-4" />
                        <span>{venue.address}</span>
                      </div>
                      <div className="flex items-center gap-4 text-sm">
                        <span className="text-muted-foreground">Rating: {venue.rating} ⭐</span>
                        <span className="text-muted-foreground">•</span>
                        <span className="text-muted-foreground">{venue.menuItems} menu items</span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 flex-wrap">
                      <Button variant="default" size="sm" asChild>
                        <Link to={`/venues/${venue.id}`}>
                          <Eye className="w-4 h-4 mr-2" />
                          {venue.approvalStatus === 'pending' ? 'Review' : 'View'}
                        </Link>
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedVenue(venue);
                          setIsEditDialogOpen(true);
                        }}
                      >
                        <Edit className="w-4 h-4 mr-2" />
                        Edit
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedVenue(venue);
                          setIsUploadDialogOpen(true);
                        }}
                      >
                        <Upload className="w-4 h-4 mr-2" />
                        Upload Media
                      </Button>
                    </div>
                  </div>

                  {/* Media Status */}
                  <div className="flex items-center gap-6 mt-4 pt-4 border-t border-border">
                    <div className="flex items-center gap-2">
                      <ImageIcon className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">{venue.images} images</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Video className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">{venue.videos} videos</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Create Venue Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create New Venue</DialogTitle>
            <DialogDescription>Add a new venue. You can edit details and upload media after creation.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Venue Name *</Label>
              <Input
                placeholder="e.g. Coffee House"
                value={createForm.name}
                onChange={(e) => setCreateForm((f) => ({ ...f, name: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label>Category *</Label>
              <Input
                placeholder="e.g. Café, Restaurant, Bar"
                value={createForm.category}
                onChange={(e) => setCreateForm((f) => ({ ...f, category: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label>Address *</Label>
              <Input
                placeholder="Street address"
                value={createForm.address}
                onChange={(e) => setCreateForm((f) => ({ ...f, address: e.target.value }))}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>City</Label>
                <Input
                  placeholder="City"
                  value={createForm.city}
                  onChange={(e) => setCreateForm((f) => ({ ...f, city: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label>State / Region</Label>
                <Input
                  placeholder="State or region"
                  value={createForm.state}
                  onChange={(e) => setCreateForm((f) => ({ ...f, state: e.target.value }))}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Country</Label>
              <Input
                placeholder="Country"
                value={createForm.country}
                onChange={(e) => setCreateForm((f) => ({ ...f, country: e.target.value }))}
              />
            </div>
            <div className="flex gap-3 pt-2">
              <Button onClick={handleCreateVenue} className="flex-1">
                Create Venue
              </Button>
              <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Venue</DialogTitle>
            <DialogDescription>Update venue information</DialogDescription>
          </DialogHeader>
          {selectedVenue && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Venue Name</Label>
                <Input defaultValue={selectedVenue.name} />
              </div>
              <div className="space-y-2">
                <Label>Category</Label>
                <Input defaultValue={selectedVenue.category} />
              </div>
              <div className="space-y-2">
                <Label>Address</Label>
                <Textarea defaultValue={selectedVenue.address} />
              </div>
              <div className="flex gap-4">
                <Button className="flex-1">Save Changes</Button>
                <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Upload Media Dialog */}
      <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Upload Media</DialogTitle>
            <DialogDescription>Add images or videos for {selectedVenue?.name}</DialogDescription>
          </DialogHeader>
          {selectedVenue && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Button variant="outline" className="h-24 flex-col gap-2">
                  <ImageIcon className="w-6 h-6" />
                  <span>Upload Images</span>
                </Button>
                <Button variant="outline" className="h-24 flex-col gap-2">
                  <Video className="w-6 h-6" />
                  <span>Upload Videos</span>
                </Button>
              </div>
              <div className="flex gap-4">
                <Button className="flex-1">Upload</Button>
                <Button variant="outline" onClick={() => setIsUploadDialogOpen(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
