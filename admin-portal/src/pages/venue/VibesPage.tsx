import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../../components/ui/dialog';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import { Badge } from '../../components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../../components/ui/tabs';
import { Plus, Calendar, MapPin, Users, Ticket, CheckCircle2, XCircle, Clock, DollarSign, User } from 'lucide-react';
import { toast } from 'sonner';

type VibeTicket = {
  id: number;
  title: string;
  price: number;
  type: 'paid' | 'free';
  available: number;
  sold: number;
};

type PendingActivity = {
  id: string;
  title: string;
  description: string;
  pricePerPerson: number;
  maxAttendees: number;
  startTime: string;
  endTime?: string;
  location?: string;
  creator: {
    id: string;
    firstName: string;
    lastName: string;
    displayName?: string;
    avatar?: string;
  };
  createdAt: string;
};

export default function VibesPage() {
  const navigate = useNavigate();
  const [vibes, setVibes] = useState([
    { 
      id: 1, 
      title: 'Bowling Night', 
      description: 'Join us for a fun bowling session', 
      date: '2025-02-05', 
      time: '19:00', 
      location: 'Main Hall', 
      maxParticipants: 20, 
      currentParticipants: 12,
      tickets: [
        { id: 1, title: 'Bowling Night Ticket', price: 25, type: 'paid' as const, available: 20, sold: 12 },
      ] as VibeTicket[],
    },
    { 
      id: 2, 
      title: 'Karaoke Evening', 
      description: 'Sing your heart out', 
      date: '2025-02-10', 
      time: '20:00', 
      location: 'Event Room', 
      maxParticipants: 30, 
      currentParticipants: 18,
      tickets: [
        { id: 2, title: 'Karaoke Evening Ticket', price: 0, type: 'free' as const, available: 30, sold: 18 },
      ] as VibeTicket[],
    },
  ]);
  const [pendingActivities, setPendingActivities] = useState<PendingActivity[]>([]);
  const [activeTab, setActiveTab] = useState<'pending' | 'approved'>('pending');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [showApprovalDialog, setShowApprovalDialog] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState<PendingActivity | null>(null);
  const [approvalAction, setApprovalAction] = useState<'approve' | 'reject'>('approve');
  const [approvedPrice, setApprovedPrice] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [location, setLocation] = useState('');
  const [maxParticipants, setMaxParticipants] = useState('');

  // Fetch pending activities for approval
  useEffect(() => {
    fetchPendingActivities();
  }, []);

  const fetchPendingActivities = async () => {
    try {
      // TODO: Replace with actual API call
      // const response = await fetch('/api/meetups/venue/pending');
      // const data = await response.json();
      // setPendingActivities(data.data || []);
      
      // Mock data for now
      const mockPending: PendingActivity[] = [
        {
          id: 'pending-1',
          title: 'Yoga Session',
          description: 'A relaxing yoga session for beginners',
          pricePerPerson: 50,
          maxAttendees: 15,
          startTime: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
          location: 'Main Hall',
          creator: {
            id: 'user-1',
            firstName: 'Sarah',
            lastName: 'Miller',
            displayName: 'Sarah M.',
            avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
          },
          createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        },
      ];
      setPendingActivities(mockPending);
    } catch (error) {
      console.error('Error fetching pending activities:', error);
      toast.error('Failed to load pending activities');
    }
  };

  const handleApprove = async () => {
    if (!selectedActivity) return;

    if (approvalAction === 'approve' && !approvedPrice) {
      toast.error('Please enter a price');
      return;
    }

    if (approvalAction === 'reject' && !rejectionReason.trim()) {
      toast.error('Please provide a rejection reason');
      return;
    }

    setLoading(true);
    try {
      // TODO: Replace with actual API call
      // const response = await fetch(`/api/meetups/${selectedActivity.id}/venue-approval`, {
      //   method: 'PUT',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({
      //     action: approvalAction,
      //     approvedPrice: approvalAction === 'approve' ? parseFloat(approvedPrice) : undefined,
      //     rejectionReason: approvalAction === 'reject' ? rejectionReason : undefined,
      //   }),
      // });
      
      // Mock success
      await new Promise(resolve => setTimeout(resolve, 500));
      
      toast.success(
        approvalAction === 'approve' 
          ? 'Activity approved successfully!' 
          : 'Activity rejected successfully!'
      );
      
      // Remove from pending list
      setPendingActivities(prev => prev.filter(a => a.id !== selectedActivity.id));
      setShowApprovalDialog(false);
      setSelectedActivity(null);
      setApprovedPrice('');
      setRejectionReason('');
    } catch (error) {
      console.error('Error processing approval:', error);
      toast.error('Failed to process approval');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = () => {
    if (!title.trim() || !description.trim() || !date || !time || !location || !maxParticipants) {
      toast.error('Please fill all fields');
      return;
    }
    const newVibe = {
      id: vibes.length + 1,
      title,
      description,
      date,
      time,
      location,
      maxParticipants: parseInt(maxParticipants),
      currentParticipants: 0,
      tickets: [] as VibeTicket[],
    };
    setVibes([newVibe, ...vibes]);
    setTitle('');
    setDescription('');
    setDate('');
    setTime('');
    setLocation('');
    setMaxParticipants('');
    setIsDialogOpen(false);
    toast.success('Vibe created successfully!');
  };

  const openApprovalDialog = (activity: PendingActivity, action: 'approve' | 'reject') => {
    setSelectedActivity(activity);
    setApprovalAction(action);
    setApprovedPrice(activity.pricePerPerson.toString());
    setRejectionReason('');
    setShowApprovalDialog(true);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Vibes & Activities</h1>
          <p className="text-muted-foreground mt-2">Manage your vibes and approve user-created activities</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Create Vibe
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create New Vibe</DialogTitle>
              <DialogDescription>Organize a casual meetup or social event</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Title</Label>
                <Input
                  placeholder="e.g., Bowling Night"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea
                  placeholder="Describe your vibe..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Date</Label>
                  <Input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Time</Label>
                  <Input
                    type="time"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Location</Label>
                <Input
                  placeholder="e.g., Main Hall"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Max Participants</Label>
                <Input
                  type="number"
                  placeholder="e.g., 20"
                  value={maxParticipants}
                  onChange={(e) => setMaxParticipants(e.target.value)}
                />
              </div>
              <Button onClick={handleSubmit} className="w-full">
                Create Vibe
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'pending' | 'approved')}>
        <TabsList>
          <TabsTrigger value="pending">
            Pending Approval
            {pendingActivities.length > 0 && (
              <Badge variant="destructive" className="ml-2">
                {pendingActivities.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="approved">Approved Vibes</TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="space-y-4">
          {pendingActivities.length === 0 ? (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center py-12">
                  <Clock className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No pending activities</p>
                  <p className="text-sm text-muted-foreground mt-2">
                    User-created activities waiting for approval will appear here
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {pendingActivities.map((activity) => (
                <Card key={activity.id} className="border-2 border-orange-500/20">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg">{activity.title}</CardTitle>
                        <CardDescription className="mt-1 line-clamp-2">
                          {activity.description}
                        </CardDescription>
                      </div>
                      <Badge variant="outline" className="border-orange-500 text-orange-600">
                        Pending
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm">
                          <User className="w-4 h-4 text-muted-foreground" />
                          <span className="text-muted-foreground">Created by:</span>
                          <span className="font-medium">
                            {activity.creator.displayName || `${activity.creator.firstName} ${activity.creator.lastName}`}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <DollarSign className="w-4 h-4 text-muted-foreground" />
                          <span className="text-muted-foreground">Requested Price:</span>
                          <span className="font-semibold text-foreground">${activity.pricePerPerson}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Users className="w-4 h-4 text-muted-foreground" />
                          <span className="text-muted-foreground">Max Attendees:</span>
                          <span className="font-medium">{activity.maxAttendees}</span>
                        </div>
                        {activity.location && (
                          <div className="flex items-center gap-2 text-sm">
                            <MapPin className="w-4 h-4 text-muted-foreground" />
                            <span className="text-muted-foreground">{activity.location}</span>
                          </div>
                        )}
                        {activity.startTime && (
                          <div className="flex items-center gap-2 text-sm">
                            <Calendar className="w-4 h-4 text-muted-foreground" />
                            <span className="text-muted-foreground">
                              {new Date(activity.startTime).toLocaleDateString('en-US', {
                                weekday: 'short',
                                month: 'short',
                                day: 'numeric',
                                hour: 'numeric',
                                minute: '2-digit',
                              })}
                            </span>
                          </div>
                        )}
                      </div>

                      <div className="flex gap-2 pt-3 border-t border-border">
                        <Button
                          variant="outline"
                          className="flex-1 border-green-500 text-green-600 hover:bg-green-50"
                          onClick={() => openApprovalDialog(activity, 'approve')}
                        >
                          <CheckCircle2 className="w-4 h-4 mr-2" />
                          Approve
                        </Button>
                        <Button
                          variant="outline"
                          className="flex-1 border-red-500 text-red-600 hover:bg-red-50"
                          onClick={() => openApprovalDialog(activity, 'reject')}
                        >
                          <XCircle className="w-4 h-4 mr-2" />
                          Reject
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="approved" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {vibes.map((vibe) => (
              <Card 
                key={vibe.id}
                className="cursor-pointer hover:shadow-lg transition-shadow"
                onClick={() => navigate(`/vibes/${vibe.id}`)}
              >
                <CardHeader>
                  <CardTitle>{vibe.title}</CardTitle>
                  <CardDescription>{vibe.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm">
                        <Calendar className="w-4 h-4 text-muted-foreground" />
                        <span>{vibe.date} at {vibe.time}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <MapPin className="w-4 h-4 text-muted-foreground" />
                        <span>{vibe.location}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Users className="w-4 h-4 text-muted-foreground" />
                        <span>{vibe.currentParticipants}/{vibe.maxParticipants} participants</span>
                      </div>
                    </div>
                    
                    {/* Tickets Preview */}
                    <div className="pt-3 border-t border-border">
                      <div className="flex items-center gap-2">
                        <Ticket className="w-4 h-4 text-primary" />
                        <span className="text-sm font-semibold">Tickets ({vibe.tickets?.length || 0})</span>
                      </div>
                      {vibe.tickets && vibe.tickets.length > 0 && (
                        <div className="mt-2 space-y-1">
                          {vibe.tickets.slice(0, 2).map((ticket) => (
                            <div key={ticket.id} className="flex items-center justify-between text-xs">
                              <span className="text-muted-foreground">
                                {ticket.type === 'paid' ? `$${ticket.price}` : 'Free'}
                              </span>
                              <span className="text-muted-foreground">
                                {ticket.sold} / {ticket.available} sold
                              </span>
                            </div>
                          ))}
                          {vibe.tickets.length > 2 && (
                            <p className="text-xs text-muted-foreground">+{vibe.tickets.length - 2} more</p>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Approval Dialog */}
      <Dialog open={showApprovalDialog} onOpenChange={setShowApprovalDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {approvalAction === 'approve' ? 'Approve Activity' : 'Reject Activity'}
            </DialogTitle>
            <DialogDescription>
              {approvalAction === 'approve' 
                ? 'Review the activity and set the final price'
                : 'Provide a reason for rejection'}
            </DialogDescription>
          </DialogHeader>

          {selectedActivity && (
            <div className="space-y-4">
              <div className="p-4 rounded-lg bg-muted">
                <h3 className="font-semibold mb-2">{selectedActivity.title}</h3>
                <p className="text-sm text-muted-foreground mb-3">{selectedActivity.description}</p>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Requested Price:</span>
                    <span className="font-medium">${selectedActivity.pricePerPerson || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Max Attendees:</span>
                    <span className="font-medium">{selectedActivity.maxAttendees}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Created by:</span>
                    <span className="font-medium">
                      {selectedActivity.creator.displayName || `${selectedActivity.creator.firstName} ${selectedActivity.creator.lastName}`}
                    </span>
                  </div>
                </div>
              </div>

              {approvalAction === 'approve' ? (
                <div className="space-y-2">
                  <Label>Final Price per Person</Label>
                  <Input
                    type="number"
                    placeholder="Enter price"
                    value={approvedPrice}
                    onChange={(e) => setApprovedPrice(e.target.value)}
                    min="0"
                    step="0.01"
                  />
                  <p className="text-xs text-muted-foreground">
                    You can change the price from the user's requested ${selectedActivity.pricePerPerson || 0}
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  <Label>Rejection Reason</Label>
                  <Textarea
                    placeholder="Explain why this activity is being rejected..."
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    rows={4}
                  />
                </div>
              )}

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowApprovalDialog(false);
                    setSelectedActivity(null);
                    setApprovedPrice('');
                    setRejectionReason('');
                  }}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleApprove}
                  disabled={loading || (approvalAction === 'approve' && !approvedPrice) || (approvalAction === 'reject' && !rejectionReason.trim())}
                  className={`flex-1 ${approvalAction === 'approve' ? 'bg-green-600 hover:bg-green-700' : 'bg-destructive'}`}
                >
                  {loading ? 'Processing...' : approvalAction === 'approve' ? 'Approve' : 'Reject'}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
