import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Search, Filter, Star, ArrowLeft, MapPin, DollarSign } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import AppLayout from '@/components/layout/AppLayout';
import BottomNav from '@/components/layout/BottomNav';
import MeetupCard from '@/components/cards/MeetupCard';
import { meetups as mockMeetups } from '@/data/mockData';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useMeetups, useJoinMeetup } from '@/hooks/useMeetups';
import { useAuth } from '@/contexts/AuthContext';
import { usePersonalization } from '@/hooks/usePersonalization';
import { toast } from 'sonner';

const ActivitiesPage = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const { personalize, trackJoin } = usePersonalization();
  const joinMeetup = useJoinMeetup();
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilterDialog, setShowFilterDialog] = useState(false);
  const [filters, setFilters] = useState({
    category: '',
    distance: '',
    priceRange: '',
    rating: '',
  });

  const radius = filters.distance ? parseFloat(filters.distance) * 1.60934 : undefined;
  const userLat = 25.7617;
  const userLon = -80.1918;

  const { data: meetupsData, isLoading: meetupsLoading } = useMeetups({
    category: filters.category || undefined,
    search: searchQuery || undefined,
    isFree: filters.priceRange === 'free' ? true : undefined,
    latitude: filters.distance ? userLat : undefined,
    longitude: filters.distance ? userLon : undefined,
    radius,
  });

  const rawMeetups = (meetupsData && meetupsData.length > 0) ? meetupsData : (mockMeetups && mockMeetups.length > 0 ? mockMeetups : []);

  const normalizedMeetups = useMemo(() => {
    if (!rawMeetups || rawMeetups.length === 0) return [];
    return rawMeetups.map((meetup: any) => {
      let startTime = meetup.startTime;
      if (!startTime && meetup.date && meetup.time) {
        try {
          const dateObj = new Date(`${meetup.date} ${meetup.time}`);
          startTime = !isNaN(dateObj.getTime()) ? dateObj.toISOString() : new Date().toISOString();
        } catch {
          startTime = new Date().toISOString();
        }
      } else if (!startTime) {
        startTime = new Date().toISOString();
      }
      return {
        ...meetup,
        startTime,
        creator: meetup.creator || (meetup.host ? {
          id: meetup.host.id || 'unknown',
          firstName: meetup.host.name?.split(' ')[0] || 'Unknown',
          lastName: meetup.host.name?.split(' ')[1] || '',
          displayName: meetup.host.name,
          avatar: meetup.host.avatar,
        } : { id: 'unknown', firstName: 'Unknown', lastName: '', displayName: 'Unknown' }),
        venue: meetup.venue && typeof meetup.venue === 'object' ? meetup.venue : (meetup.venue ? {
          id: 'venue-' + meetup.id,
          name: typeof meetup.venue === 'string' ? meetup.venue : meetup.venue.name || 'Location TBD',
          address: meetup.location || '',
          city: meetup.location?.split(',')[1]?.trim() || '',
        } : undefined),
        location: meetup.location || (typeof meetup.venue === 'string' ? meetup.venue : meetup.venue?.name || 'Location TBD'),
        _count: meetup._count || { members: meetup.attendees?.length || 0 },
        members: meetup.members || (meetup.attendees?.map((a: any) => ({
          id: a.id,
          user: { id: a.id, firstName: a.name?.split(' ')[0] || 'User', lastName: a.name?.split(' ')[1] || '', displayName: a.name, avatar: a.avatar },
          status: 'going',
        })) || []),
      };
    });
  }, [rawMeetups]);

  const meetups = useMemo(() => {
    if (!isAuthenticated || !user) return normalizedMeetups;
    if (searchQuery || filters.category || filters.distance || filters.priceRange) return normalizedMeetups;
    return personalize(normalizedMeetups, filters.distance ? { latitude: userLat, longitude: userLon } : undefined);
  }, [normalizedMeetups, isAuthenticated, user, filters, searchQuery, userLat, userLon, personalize]);

  const handleJoinVibe = async (meetupId: string, meetup: any) => {
    if (!isAuthenticated) {
      toast.error('Please login to join an activity');
      navigate('/login');
      return;
    }
    try {
      await joinMeetup.mutateAsync({ meetupId, status: 'going' });
      if (user) trackJoin(meetup);
      toast.success('Joined the activity!');
    } catch (error: any) {
      toast.error(error.message || 'Failed to join activity');
    }
  };

  return (
    <AppLayout>
      <div className="sticky top-0 z-40 glass safe-top">
        <div className="flex items-center gap-3 px-4 py-3">
          <motion.button onClick={() => navigate('/home')} className="p-2 -ml-2" whileTap={{ scale: 0.9 }}>
            <ArrowLeft className="w-6 h-6 text-foreground" />
          </motion.button>
          <div className="flex-1 min-w-0">
            <h1 className="text-xl font-bold text-foreground mb-1">Activities</h1>
            <p className="text-sm text-muted-foreground mb-3">Vibes, meetups & events</p>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search activities..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full h-12 pl-12 pr-4 rounded-2xl bg-muted border-0 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
              <motion.button
                className="h-12 w-12 rounded-2xl bg-muted flex items-center justify-center"
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowFilterDialog(true)}
              >
                <Filter className="w-5 h-5 text-foreground" />
              </motion.button>
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 pb-4 space-y-4 mt-4">
        {meetupsLoading ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">Loading activities...</p>
          </div>
        ) : meetups && meetups.length > 0 ? (
          meetups.map((meetup: any) => (
            <MeetupCard
              key={meetup.id}
              {...meetup}
              onPress={() => navigate(`/meetup/${meetup.id}`)}
              onJoin={() => handleJoinVibe(meetup.id, meetup)}
              showJoinButton={true}
            />
          ))
        ) : (
          <div className="text-center py-8">
            <p className="text-muted-foreground">No activities found. Try adjusting your filters.</p>
          </div>
        )}
      </div>

      <Dialog open={showFilterDialog} onOpenChange={setShowFilterDialog}>
        <DialogContent className="max-w-md mx-4 rounded-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl">Filter Activities</DialogTitle>
            <DialogDescription>Refine your search</DialogDescription>
          </DialogHeader>
          <div className="space-y-6 mt-4">
            <div>
              <label className="text-sm font-semibold text-foreground mb-3 block flex items-center gap-2">
                <MapPin className="w-4 h-4 text-primary" /> Category
              </label>
              <select
                value={filters.category}
                onChange={(e) => setFilters({ ...filters, category: e.target.value })}
                className="w-full h-12 px-4 rounded-xl bg-muted border-0 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
              >
                <option value="">All Categories</option>
                <option value="coffee">Coffee</option>
                <option value="café">Café</option>
                <option value="japanese">Japanese</option>
                <option value="italian">Italian</option>
                <option value="sports">Sports</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-semibold text-foreground mb-3 block flex items-center gap-2">
                <MapPin className="w-4 h-4 text-primary" /> Distance
              </label>
              <select
                value={filters.distance}
                onChange={(e) => setFilters({ ...filters, distance: e.target.value })}
                className="w-full h-12 px-4 rounded-xl bg-muted border-0 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
              >
                <option value="">Any Distance</option>
                <option value="1">Within 1 mile</option>
                <option value="5">Within 5 miles</option>
                <option value="10">Within 10 miles</option>
                <option value="25">Within 25 miles</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-semibold text-foreground mb-3 block flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-primary" /> Price
              </label>
              <select
                value={filters.priceRange}
                onChange={(e) => setFilters({ ...filters, priceRange: e.target.value })}
                className="w-full h-12 px-4 rounded-xl bg-muted border-0 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
              >
                <option value="">Any Price</option>
                <option value="free">Free</option>
                <option value="$">$ - Budget</option>
                <option value="$$">$$ - Moderate</option>
                <option value="$$$">$$$ - Premium</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-semibold text-foreground mb-3 block flex items-center gap-2">
                <Star className="w-4 h-4 text-primary" /> Minimum Rating
              </label>
              <select
                value={filters.rating}
                onChange={(e) => setFilters({ ...filters, rating: e.target.value })}
                className="w-full h-12 px-4 rounded-xl bg-muted border-0 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
              >
                <option value="">Any Rating</option>
                <option value="4">4+ Stars</option>
                <option value="4.5">4.5+ Stars</option>
                <option value="5">5 Stars</option>
              </select>
            </div>
          </div>
          <div className="flex gap-2 pt-4 border-t border-border mt-4">
            <Button variant="outline" className="flex-1" onClick={() => setFilters({ category: '', distance: '', priceRange: '', rating: '' })}>
              Reset
            </Button>
            <Button className="flex-1 bg-gradient-primary text-primary-foreground" onClick={() => setShowFilterDialog(false)}>
              Apply
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <BottomNav />
    </AppLayout>
  );
};

export default ActivitiesPage;
