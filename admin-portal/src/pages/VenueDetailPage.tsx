import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Building2,
  MapPin,
  Phone,
  Globe,
  User,
  Mail,
  FileText,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Image as ImageIcon,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '../components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';
import { toast } from 'sonner';

// Mock venue detail – replace with API
const getVenueById = (id: string) => {
  const venues: Record<string, any> = {
    '1': {
      id: '1',
      name: 'Coffee House',
      category: 'Café',
      description: 'Cozy café with specialty coffee and pastries.',
      address: '123 Main St',
      city: 'Miami',
      state: 'FL',
      country: 'United States',
      zipCode: '33101',
      phone: '+1 305 555 0100',
      website: 'https://coffeehouse.example.com',
      businessHours: 'Mon–Fri 7:00–20:00, Sat–Sun 8:00–21:00',
      logoUrl: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=150',
      coverUrl: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800',
      verificationStatus: 'pending',
      ownerName: 'Jane Smith',
      ownerEmail: 'jane@coffeehouse.com',
      ownerPhone: '+1 305 555 0101',
      accountCreatedAt: '2025-01-15',
      businessLicense: 'BL-2024-001',
      taxId: 'XX-XXXXX1234',
      totalEvents: 12,
      totalAttendees: 340,
      averageRating: 4.5,
      totalReviews: 28,
      totalFollowers: 120,
    },
    '2': {
      id: '2',
      name: 'Fine Dining Restaurant',
      category: 'Restaurant',
      description: 'Upscale dining with ocean view.',
      address: '456 Ocean Dr',
      city: 'Miami',
      state: 'FL',
      country: 'United States',
      zipCode: '33139',
      phone: '+1 305 555 0200',
      website: 'https://finedining.example.com',
      businessHours: 'Tue–Sun 18:00–23:00',
      logoUrl: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=150',
      coverUrl: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800',
      verificationStatus: 'approved',
      ownerName: 'John Doe',
      ownerEmail: 'john@finedining.com',
      ownerPhone: '+1 305 555 0201',
      accountCreatedAt: '2024-11-20',
      businessLicense: 'BL-2024-002',
      taxId: 'XX-XXXXX5678',
      totalEvents: 8,
      totalAttendees: 180,
      averageRating: 4.8,
      totalReviews: 45,
      totalFollowers: 250,
    },
  };
  return venues[id] || null;
};

const REJECTION_REASONS = [
  'Invalid business license',
  'Incomplete information',
  'Suspicious activity',
  'Violates terms of service',
  'Duplicate venue',
  'Other (custom reason)',
];

export default function VenueDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const venue = id ? getVenueById(id) : null;

  const [isApproveDialogOpen, setIsApproveDialogOpen] = useState(false);
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [rejectionCustomReason, setRejectionCustomReason] = useState('');
  const [loading, setLoading] = useState(false);

  const handleApprove = async () => {
    if (!venue) return;
    setLoading(true);
    try {
      // TODO: API call to approve venue
      await new Promise((r) => setTimeout(r, 500));
      toast.success('Venue approved successfully.');
      setIsApproveDialogOpen(false);
      navigate('/venues');
    } catch {
      toast.error('Failed to approve venue.');
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async () => {
    if (!venue) return;
    const reason = rejectionReason === 'Other (custom reason)' ? rejectionCustomReason : rejectionReason;
    if (!reason.trim()) {
      toast.error('Please provide a rejection reason.');
      return;
    }
    setLoading(true);
    try {
      // TODO: API call to reject venue with reason
      await new Promise((r) => setTimeout(r, 500));
      toast.success('Venue rejected.');
      setIsRejectDialogOpen(false);
      setRejectionReason('');
      setRejectionCustomReason('');
      navigate('/venues');
    } catch {
      toast.error('Failed to reject venue.');
    } finally {
      setLoading(false);
    }
  };

  if (!venue) {
    return (
      <div className="space-y-6 p-6">
        <p className="text-muted-foreground">Venue not found.</p>
        <Button variant="outline" asChild>
          <Link to="/venues">Back to Venues</Link>
        </Button>
      </div>
    );
  }

  const isPending = venue.verificationStatus === 'pending';
  const verificationLabel =
    venue.verificationStatus === 'pending'
      ? 'Pending'
      : venue.verificationStatus === 'approved'
        ? 'Verified'
        : 'Rejected';
  const verificationVariant =
    venue.verificationStatus === 'pending'
      ? 'secondary'
      : venue.verificationStatus === 'approved'
        ? 'default'
        : 'destructive';

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link to="/venues">
              <ArrowLeft className="w-5 h-5" />
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-foreground">{venue.name}</h1>
            <p className="text-muted-foreground mt-1">Venue details and approval</p>
          </div>
        </div>
        {isPending && (
          <div className="flex gap-2">
            <Button
              variant="outline"
              className="bg-green-600/10 text-green-600 border-green-600/30 hover:bg-green-600/20"
              onClick={() => setIsApproveDialogOpen(true)}
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              Approve
            </Button>
            <Button
              variant="outline"
              className="bg-destructive/10 text-destructive border-destructive/30 hover:bg-destructive/20"
              onClick={() => setIsRejectDialogOpen(true)}
            >
              <XCircle className="w-4 h-4 mr-2" />
              Reject
            </Button>
          </div>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="w-5 h-5" />
              Basic Information
            </CardTitle>
            <CardDescription>Venue identity and contact</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start gap-4">
              <div className="w-20 h-20 rounded-xl overflow-hidden bg-muted flex-shrink-0">
                <img
                  src={venue.logoUrl}
                  alt={venue.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-muted-foreground">Venue ID: {venue.id}</p>
                <p className="font-medium text-foreground">{venue.name}</p>
                <Badge className="mt-1">{venue.category}</Badge>
              </div>
            </div>
            {venue.description && (
              <p className="text-sm text-muted-foreground">{venue.description}</p>
            )}
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-muted-foreground" />
                <span>{[venue.address, venue.city, venue.state, venue.zipCode, venue.country].filter(Boolean).join(', ')}</span>
              </div>
              {venue.phone && (
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-muted-foreground" />
                  <span>{venue.phone}</span>
                </div>
              )}
              {venue.website && (
                <div className="flex items-center gap-2">
                  <Globe className="w-4 h-4 text-muted-foreground" />
                  <a href={venue.website} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">{venue.website}</a>
                </div>
              )}
              {venue.businessHours && (
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-muted-foreground" />
                  <span>{venue.businessHours}</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Owner Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5" />
              Owner Information
            </CardTitle>
            <CardDescription>Account holder details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-muted-foreground" />
              <span className="font-medium">{venue.ownerName}</span>
            </div>
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-muted-foreground" />
              <span>{venue.ownerEmail}</span>
            </div>
            {venue.ownerPhone && (
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-muted-foreground" />
                <span>{venue.ownerPhone}</span>
              </div>
            )}
            <p className="text-muted-foreground">Account created: {venue.accountCreatedAt}</p>
          </CardContent>
        </Card>

        {/* Verification Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Verification
            </CardTitle>
            <CardDescription>Documents and status</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-2">
              <Badge variant={verificationVariant}>{verificationLabel}</Badge>
              {isPending && (
                <AlertCircle className="w-4 h-4 text-orange-500" />
              )}
            </div>
            <div className="space-y-2 text-sm">
              <p><span className="text-muted-foreground">Business license:</span> {venue.businessLicense || '—'}</p>
              <p><span className="text-muted-foreground">Tax ID:</span> {venue.taxId || '—'}</p>
            </div>
          </CardContent>
        </Card>

        {/* Statistics */}
        <Card>
          <CardHeader>
            <CardTitle>Statistics</CardTitle>
            <CardDescription>Activity and engagement</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Events</p>
                <p className="font-semibold text-foreground">{venue.totalEvents ?? 0}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Attendees</p>
                <p className="font-semibold text-foreground">{venue.totalAttendees ?? 0}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Avg. rating</p>
                <p className="font-semibold text-foreground">{venue.averageRating ?? '—'} ⭐</p>
              </div>
              <div>
                <p className="text-muted-foreground">Reviews</p>
                <p className="font-semibold text-foreground">{venue.totalReviews ?? 0}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Followers</p>
                <p className="font-semibold text-foreground">{venue.totalFollowers ?? 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Approve Dialog */}
      <Dialog open={isApproveDialogOpen} onOpenChange={setIsApproveDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Approve Venue</DialogTitle>
            <DialogDescription>
              This will verify &quot;{venue.name}&quot; and make it visible on the platform. The owner will be notified.
            </DialogDescription>
          </DialogHeader>
          <div className="flex gap-2 justify-end pt-4">
            <Button variant="outline" onClick={() => setIsApproveDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleApprove} disabled={loading} className="bg-green-600 hover:bg-green-700">
              {loading ? 'Approving...' : 'Approve Venue'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Reject Dialog */}
      <Dialog open={isRejectDialogOpen} onOpenChange={setIsRejectDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Venue</DialogTitle>
            <DialogDescription>
              Reject &quot;{venue.name}&quot; and optionally send a reason to the owner.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div className="space-y-2">
              <Label>Rejection reason</Label>
              <Select value={rejectionReason} onValueChange={setRejectionReason}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a reason" />
                </SelectTrigger>
                <SelectContent>
                  {REJECTION_REASONS.map((r) => (
                    <SelectItem key={r} value={r}>
                      {r}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {rejectionReason === 'Other (custom reason)' && (
              <div className="space-y-2">
                <Label>Custom reason</Label>
                <Textarea
                  placeholder="Explain why this venue is being rejected..."
                  value={rejectionCustomReason}
                  onChange={(e) => setRejectionCustomReason(e.target.value)}
                  rows={3}
                />
              </div>
            )}
            <div className="flex gap-2 justify-end pt-2">
              <Button variant="outline" onClick={() => setIsRejectDialogOpen(false)}>
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleReject}
                disabled={loading || !rejectionReason.trim() || (rejectionReason === 'Other (custom reason)' && !rejectionCustomReason.trim())}
              >
                {loading ? 'Rejecting...' : 'Reject Venue'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
