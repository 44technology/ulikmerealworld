import { useState } from 'react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Badge } from '../components/ui/badge';
import { Plus, Calendar, MapPin } from 'lucide-react';
import { toast } from 'sonner';
import { VENUE_LOCATIONS, getLocationNameById } from '../lib/venueLocations';

export default function CampaignsPage() {
  const [campaigns, setCampaigns] = useState([
    { id: 1, title: 'Weekend Special', description: '20% off on all items', status: 'active', endDate: '2025-02-15', locationId: 'loc-1' },
    { id: 2, title: 'Happy Hour', description: 'Buy 2 get 1 free', status: 'active', endDate: '2025-02-20', locationId: 'loc-2' },
    { id: 3, title: 'New Year Sale', description: '30% discount', status: 'ended', endDate: '2025-01-10', locationId: 'loc-1' },
  ]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [endDate, setEndDate] = useState('');
  const [locationId, setLocationId] = useState(VENUE_LOCATIONS[0]?.id ?? '');

  const hasMultipleLocations = VENUE_LOCATIONS.length > 1;

  const handleSubmit = () => {
    if (!title.trim() || !description.trim() || !endDate) {
      toast.error('Please fill all fields');
      return;
    }
    if (hasMultipleLocations && !locationId) {
      toast.error('Please select a location');
      return;
    }
    const newCampaign = {
      id: campaigns.length + 1,
      title,
      description,
      status: 'active' as const,
      endDate,
      locationId: hasMultipleLocations ? locationId : (VENUE_LOCATIONS[0]?.id ?? ''),
    };
    setCampaigns([newCampaign, ...campaigns]);
    setTitle('');
    setDescription('');
    setEndDate('');
    setLocationId(VENUE_LOCATIONS[0]?.id ?? '');
    setIsDialogOpen(false);
    toast.success('Campaign created successfully!');
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Campaigns</h1>
          <p className="text-muted-foreground mt-2">Create and manage marketing campaigns</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Create Campaign
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Campaign</DialogTitle>
              <DialogDescription>Set up a new marketing campaign</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Campaign Title</Label>
                <Input
                  placeholder="e.g., Weekend Special"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea
                  placeholder="Describe your campaign..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                />
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
                  <p className="text-xs text-muted-foreground">This campaign will apply only to the selected location.</p>
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
                Create Campaign
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {campaigns.map((campaign) => (
          <Card key={campaign.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>{campaign.title}</CardTitle>
                <Badge variant={campaign.status === 'active' ? 'default' : 'secondary'}>
                  {campaign.status}
                </Badge>
              </div>
              <CardDescription>{campaign.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {hasMultipleLocations && (campaign as { locationId?: string }).locationId && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <MapPin className="w-4 h-4" />
                    <span>{getLocationNameById((campaign as { locationId?: string }).locationId ?? '')}</span>
                  </div>
                )}
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="w-4 h-4" />
                  <span>Ends: {campaign.endDate}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
