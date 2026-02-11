import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Calendar, MapPin, Users, Clock, AlertCircle, CheckCircle2, XCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import AppLayout from '@/components/layout/AppLayout';
import BottomNav from '@/components/layout/BottomNav';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import UserAvatar from '@/components/ui/UserAvatar';
import { useMeetups } from '@/hooks/useMeetups';
import { useAuth } from '@/contexts/AuthContext';

const upcomingMeetups = [
  {
    id: '1',
    title: 'Saturday Morning Coffee',
    venue: 'Panther Coffee, Wynwood',
    date: 'Jan 25, 2024',
    time: '10:00 AM',
    attendees: 4,
    maxAttendees: 6,
    image: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=400',
    isHost: true,
  },
  {
    id: '2',
    title: 'Beach Volleyball',
    venue: 'South Beach',
    date: 'Jan 27, 2024',
    time: '4:00 PM',
    attendees: 8,
    maxAttendees: 12,
    image: 'https://images.unsplash.com/photo-1612872087720-bb876e2e67d1?w=400',
    isHost: false,
  },
];

const pastMeetups = [
  {
    id: '3',
    title: 'Yoga in the Park',
    venue: 'Bayfront Park',
    date: 'Jan 15, 2024',
    time: '8:00 AM',
    attendees: 10,
    maxAttendees: 15,
    image: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=400',
    isHost: false,
  },
  {
    id: '4',
    title: 'Networking Brunch',
    venue: 'Zuma Miami',
    date: 'Jan 10, 2024',
    time: '11:00 AM',
    attendees: 6,
    maxAttendees: 8,
    image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400',
    isHost: true,
  },
];

const MeetupItem = ({ meetup, showApprovalStatus }: { meetup: typeof upcomingMeetups[0] & { approvalStatus?: string; venueApprovedPrice?: number; venueRejectionReason?: string }; showApprovalStatus?: boolean }) => {
  const navigate = useNavigate();
  
  const getApprovalBadge = () => {
    if (!showApprovalStatus || !meetup.approvalStatus) return null;
    
    if (meetup.approvalStatus === 'pending') {
      return (
        <Badge variant="outline" className="border-orange-500 text-orange-600 bg-orange-50">
          <Clock className="w-3 h-3 mr-1" />
          Pending Approval
        </Badge>
      );
    }
    if (meetup.approvalStatus === 'approved') {
      return (
        <Badge variant="outline" className="border-green-500 text-green-600 bg-green-50">
          <CheckCircle2 className="w-3 h-3 mr-1" />
          Approved
        </Badge>
      );
    }
    if (meetup.approvalStatus === 'rejected') {
      return (
        <Badge variant="outline" className="border-red-500 text-red-600 bg-red-50">
          <XCircle className="w-3 h-3 mr-1" />
          Rejected
        </Badge>
      );
    }
    return null;
  };
  
  return (
    <motion.div
      className="card-elevated overflow-hidden cursor-pointer"
      whileTap={{ scale: 0.98 }}
      onClick={() => navigate(`/meetup/${meetup.id}`)}
    >
      <div className="relative h-32">
        <img src={meetup.image} alt={meetup.title} className="w-full h-full object-cover" />
        <div className="absolute top-2 left-2 flex flex-col gap-1">
          {meetup.isHost ? (
            <span className="px-2 py-1 rounded-full bg-primary text-primary-foreground text-xs font-medium">
              Host
            </span>
          ) : (
            <span className="px-2 py-1 rounded-full bg-secondary text-secondary-foreground text-xs font-medium">
              Guest
            </span>
          )}
          {getApprovalBadge()}
        </div>
      </div>
      <div className="p-4">
        <h3 className="font-semibold text-foreground">{meetup.title}</h3>
        {showApprovalStatus && meetup.approvalStatus === 'pending' && (
          <div className="mt-2 p-2 rounded-lg bg-orange-50 border border-orange-200">
            <p className="text-xs text-orange-800 flex items-center gap-1">
              <AlertCircle className="w-3 h-3" />
              Waiting for venue approval
            </p>
          </div>
        )}
        {showApprovalStatus && meetup.approvalStatus === 'rejected' && meetup.venueRejectionReason && (
          <div className="mt-2 p-2 rounded-lg bg-red-50 border border-red-200">
            <p className="text-xs text-red-800 font-medium mb-1">Rejection Reason:</p>
            <p className="text-xs text-red-700">{meetup.venueRejectionReason}</p>
          </div>
        )}
        {showApprovalStatus && meetup.approvalStatus === 'approved' && meetup.venueApprovedPrice && (
          <div className="mt-2 p-2 rounded-lg bg-green-50 border border-green-200">
            <p className="text-xs text-green-800">
              Approved price: <span className="font-semibold">${meetup.venueApprovedPrice}</span>
            </p>
          </div>
        )}
        <div className="mt-2 space-y-1">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <MapPin className="w-4 h-4" />
            <span>{meetup.venue}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="w-4 h-4" />
            <span>{meetup.date}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="w-4 h-4" />
            <span>{meetup.time}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Users className="w-4 h-4" />
            <span>{meetup.attendees}/{meetup.maxAttendees} attending</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

const MyMeetupsPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  // Fetch user's meetups
  const { data: allMeetups, isLoading, error } = useMeetups();
  
  // Filter meetups by user (created or joined)
  const userMeetups = allMeetups?.filter(meetup => {
    if (!user?.id) return false;
    // Check if user is creator
    if (meetup.creator?.id === user.id) return true;
    // Check if user is a member
    if (meetup.members?.some(m => m.user?.id === user.id)) return true;
    return false;
  }) || [];
  
  // Separate meetups by status and time
  const now = new Date();
  
  // Pending approval meetups (only user-created ones)
  const pendingApprovalMeetups = userMeetups.filter(meetup => {
    if (meetup.creator?.id !== user?.id) return false;
    return meetup.status === 'PENDING_APPROVAL' || meetup.venueApprovalStatus === 'pending';
  }).map(meetup => ({
    id: meetup.id,
    title: meetup.title || 'Untitled Vibe',
    venue: meetup.venue?.name || meetup.location || 'Location TBD',
    date: meetup.startTime ? new Date(meetup.startTime).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'TBD',
    time: meetup.startTime ? new Date(meetup.startTime).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }) : 'TBD',
    attendees: meetup._count?.members || meetup.members?.length || 0,
    maxAttendees: meetup.maxAttendees || 10,
    image: meetup.image || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400',
    isHost: true,
    approvalStatus: meetup.venueApprovalStatus || (meetup.status === 'PENDING_APPROVAL' ? 'pending' : undefined),
    venueApprovedPrice: meetup.venueApprovedPrice,
    venueRejectionReason: meetup.venueRejectionReason,
  }));
  
  // Rejected meetups (only user-created ones)
  const rejectedMeetups = userMeetups.filter(meetup => {
    if (meetup.creator?.id !== user?.id) return false;
    return meetup.status === 'REJECTED' || meetup.venueApprovalStatus === 'rejected';
  }).map(meetup => ({
    id: meetup.id,
    title: meetup.title || 'Untitled Vibe',
    venue: meetup.venue?.name || meetup.location || 'Location TBD',
    date: meetup.startTime ? new Date(meetup.startTime).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'TBD',
    time: meetup.startTime ? new Date(meetup.startTime).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }) : 'TBD',
    attendees: meetup._count?.members || meetup.members?.length || 0,
    maxAttendees: meetup.maxAttendees || 10,
    image: meetup.image || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400',
    isHost: true,
    approvalStatus: 'rejected',
    venueApprovedPrice: meetup.venueApprovedPrice,
    venueRejectionReason: meetup.venueRejectionReason,
  }));
  
  // Upcoming meetups (approved or no venue)
  const upcomingMeetups = userMeetups.filter(meetup => {
    if (!meetup.startTime) return false;
    const startTime = new Date(meetup.startTime);
    if (startTime < now) return false;
    // Exclude pending and rejected
    if (meetup.status === 'PENDING_APPROVAL' || meetup.status === 'REJECTED') return false;
    if (meetup.venueApprovalStatus === 'pending' || meetup.venueApprovalStatus === 'rejected') return false;
    return true;
  }).map(meetup => ({
    id: meetup.id,
    title: meetup.title || 'Untitled Vibe',
    venue: meetup.venue?.name || meetup.location || 'Location TBD',
    date: meetup.startTime ? new Date(meetup.startTime).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'TBD',
    time: meetup.startTime ? new Date(meetup.startTime).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }) : 'TBD',
    attendees: meetup._count?.members || meetup.members?.length || 0,
    maxAttendees: meetup.maxAttendees || 10,
    image: meetup.image || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400',
    isHost: meetup.creator?.id === user?.id,
    approvalStatus: meetup.venueApprovalStatus === 'approved' ? 'approved' : undefined,
    venueApprovedPrice: meetup.venueApprovedPrice,
  }));
  
  // Past meetups
  const pastMeetups = userMeetups.filter(meetup => {
    if (!meetup.startTime) return false;
    const startTime = new Date(meetup.startTime);
    return startTime < now;
  }).map(meetup => ({
    id: meetup.id,
    title: meetup.title || 'Untitled Vibe',
    venue: meetup.venue?.name || meetup.location || 'Location TBD',
    date: meetup.startTime ? new Date(meetup.startTime).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'TBD',
    time: meetup.startTime ? new Date(meetup.startTime).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }) : 'TBD',
    attendees: meetup._count?.members || meetup.members?.length || 0,
    maxAttendees: meetup.maxAttendees || 10,
    image: meetup.image || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400',
    isHost: meetup.creator?.id === user?.id,
  }));

  return (
    <AppLayout>
      {/* Header */}
      <div className="sticky top-0 z-40 glass safe-top">
        <div className="flex items-center gap-3 px-4 py-3">
          <motion.button
            onClick={() => navigate('/home')}
            className="p-2 -ml-2"
            whileTap={{ scale: 0.9 }}
          >
            <ArrowLeft className="w-6 h-6 text-foreground" />
          </motion.button>
          <h1 className="text-xl font-bold text-foreground">My Vibes</h1>
        </div>
      </div>

      <div className="px-4 pb-4">
        <Tabs defaultValue="pending" className="mt-2">
          <TabsList className="grid w-full grid-cols-3 bg-muted rounded-xl p-1 h-12">
            <TabsTrigger value="pending" className="rounded-lg data-[state=active]:bg-card data-[state=active]:shadow-sm text-xs">
              Pending
              {pendingApprovalMeetups.length > 0 && (
                <Badge variant="destructive" className="ml-1 h-4 px-1 text-[10px]">
                  {pendingApprovalMeetups.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="upcoming" className="rounded-lg data-[state=active]:bg-card data-[state=active]:shadow-sm text-xs">
              Upcoming
            </TabsTrigger>
            <TabsTrigger value="past" className="rounded-lg data-[state=active]:bg-card data-[state=active]:shadow-sm text-xs">
              Past
            </TabsTrigger>
          </TabsList>

          <TabsContent value="pending" className="mt-4 space-y-4">
            {isLoading ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">Loading...</p>
              </div>
            ) : pendingApprovalMeetups.length > 0 ? (
              <>
                {pendingApprovalMeetups.map((meetup) => (
                  <MeetupItem key={meetup.id} meetup={meetup} showApprovalStatus={true} />
                ))}
                {rejectedMeetups.length > 0 && (
                  <div className="mt-6">
                    <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                      <XCircle className="w-4 h-4 text-red-500" />
                      Rejected Activities
                    </h3>
                    {rejectedMeetups.map((meetup) => (
                      <MeetupItem key={meetup.id} meetup={meetup} showApprovalStatus={true} />
                    ))}
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-12">
                <Clock className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
                <p className="text-muted-foreground">No pending approvals</p>
                <p className="text-xs text-muted-foreground mt-2">
                  Activities waiting for venue approval will appear here
                </p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="upcoming" className="mt-4 space-y-4">
            {isLoading ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">Loading...</p>
              </div>
            ) : error ? (
              <div className="text-center py-12">
                <Calendar className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
                <p className="text-muted-foreground">Error loading vibes</p>
                <p className="text-xs text-muted-foreground mt-2">{String(error)}</p>
              </div>
            ) : upcomingMeetups.length > 0 ? (
              upcomingMeetups.map((meetup) => (
                <MeetupItem key={meetup.id} meetup={meetup} showApprovalStatus={meetup.approvalStatus === 'approved'} />
              ))
            ) : (
              <div className="text-center py-12">
                <Calendar className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
                <p className="text-muted-foreground">No upcoming vibes</p>
                {allMeetups && allMeetups.length > 0 && (
                  <p className="text-xs text-muted-foreground mt-2">
                    Found {allMeetups.length} total meetups, but none match your filters
                  </p>
                )}
              </div>
            )}
          </TabsContent>

          <TabsContent value="past" className="mt-4 space-y-4">
            {isLoading ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">Loading...</p>
              </div>
            ) : pastMeetups.length > 0 ? (
              pastMeetups.map((meetup) => (
                <MeetupItem key={meetup.id} meetup={meetup} />
              ))
            ) : (
              <div className="text-center py-12">
                <Calendar className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
                <p className="text-muted-foreground">No past vibes</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      <BottomNav />
    </AppLayout>
  );
};

export default MyMeetupsPage;
