import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, MapPin, Star, Clock, DollarSign, Heart, Share2, UtensilsCrossed, Tag, Percent, Calendar, GraduationCap, Users, ChevronRight, Sparkles, ExternalLink } from 'lucide-react';
import AppLayout from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { useVenue } from '@/hooks/useVenues';
import { useClasses } from '@/hooks/useClasses';
import { useMeetups } from '@/hooks/useMeetups';
import { getFavouriteVenueIds, isFavouriteVenue, toggleFavouriteVenue } from '@/lib/favouriteVenues';
import { getVibeTypeLabel } from '@/lib/vibeLabels';
import { toast } from 'sonner';
import { format } from 'date-fns';
import ClassCard from '@/components/cards/ClassCard';

// Sample campaigns for venues
const sampleCampaigns = [
  {
    id: 'campaign-1',
    title: 'Happy Hour',
    description: '50% off on all drinks and appetizers',
    discount: '50% OFF',
    icon: '🍹',
    image: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=400',
    time: '5:00 PM - 7:00 PM',
    days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
    type: 'happy-hour',
  },
  {
    id: 'campaign-2',
    title: 'Ladies Night',
    description: 'Free entry and 30% off drinks for ladies',
    discount: '30% OFF',
    icon: '💃',
    image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400',
    time: '8:00 PM - 11:00 PM',
    days: ['Wednesday'],
    type: 'special',
  },
  {
    id: 'campaign-3',
    title: 'Student Discount',
    description: 'Show your student ID and get 25% off',
    discount: '25% OFF',
    icon: '🎓',
    image: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=400',
    time: 'All Day',
    days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
    type: 'discount',
  },
  {
    id: 'campaign-4',
    title: 'Weekend Special',
    description: 'Buy 2 get 1 free on selected items',
    discount: 'Buy 2 Get 1',
    icon: '🎉',
    image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400',
    time: 'All Day',
    days: ['Saturday', 'Sunday'],
    type: 'special',
  },
  {
    id: 'campaign-5',
    title: 'Early Bird',
    description: '20% off for reservations before 6 PM',
    discount: '20% OFF',
    icon: '🌅',
    image: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=400',
    time: '4:00 PM - 6:00 PM',
    days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
    type: 'discount',
  },
  {
    id: 'campaign-6',
    title: 'Free Appetizer',
    description: 'Get a free appetizer with any main course purchase',
    discount: 'FREE',
    icon: '🎁',
    image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400',
    time: 'All Day',
    days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
    type: 'free-item',
  },
  {
    id: 'campaign-7',
    title: 'Free Dessert',
    description: 'Complimentary dessert with dinner orders over $50',
    discount: 'FREE',
    icon: '🍰',
    image: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=400',
    time: '6:00 PM - 10:00 PM',
    days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
    type: 'free-item',
  },
];

const VenueDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [favourite, setFavourite] = useState(false);
  const { data: venue, isLoading, error } = useVenue(id || '');

  useEffect(() => {
    if (id) setFavourite(isFavouriteVenue(id));
  }, [id]);
  
  // Fetch classes and meetups for this venue
  const { data: venueClasses, isLoading: classesLoading } = useClasses(undefined, undefined, 'UPCOMING', id);
  const { data: venueMeetups, isLoading: meetupsLoading } = useMeetups({ 
    status: 'UPCOMING',
  });
  
  // Filter meetups by venue ID
  const upcomingMeetups = venueMeetups?.filter(m => m.venue?.id === id) || [];
  
  // Combine and sort by start time
  const upcomingEvents = [
    ...(venueClasses || []).map(c => ({ ...c, type: 'class' as const })),
    ...upcomingMeetups.map(m => ({ ...m, type: 'vibe' as const })),
  ].sort((a, b) => {
    const dateA = new Date(a.startTime).getTime();
    const dateB = new Date(b.startTime).getTime();
    return dateA - dateB;
  });
  
  // Determine if venue is a restaurant based on amenities or description
  const isRestaurant = venue?.amenities?.some(a => 
    a.toLowerCase().includes('restaurant') || 
    a.toLowerCase().includes('dining') ||
    a.toLowerCase().includes('food')
  ) || venue?.description?.toLowerCase().includes('restaurant') ||
     venue?.description?.toLowerCase().includes('dining') ||
     venue?.name?.toLowerCase().includes('restaurant');

  if (isLoading) {
    return (
      <AppLayout>
        <div className="flex flex-col items-center justify-center min-h-screen p-4">
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </AppLayout>
    );
  }

  if (error || !venue) {
    return (
      <AppLayout>
        <div className="flex flex-col items-center justify-center min-h-screen p-4">
          <p className="text-muted-foreground">Venue not found</p>
          <Button onClick={() => navigate('/home')} className="mt-4">
            Go Back
          </Button>
        </div>
      </AppLayout>
    );
  }
  
  // Format venue data
  const venueImage = venue.image || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400';
  const venueRating = 4.5; // Default rating (no rating field from API)
  const venueReviewCount = venue._count?.meetups || 0;
  const venuePriceRange = '$$'; // Default (no priceRange from API)
  const venueDistance = '0.5 mi'; // Default (no distance from API)
  const venueCategory = venue.description || 'Venue';
  const venueIsOpen = true; // Default (no isOpen from API)

  // Separate campaigns and free items
  const campaigns = sampleCampaigns.filter(c => c.type !== 'free-item');
  const freeItems = sampleCampaigns.filter(c => c.type === 'free-item');

  return (
    <AppLayout>
      {/* Header */}
      <div className="sticky top-0 z-40 glass safe-top">
        <div className="flex items-center gap-4 px-4 py-3">
          <motion.button
            onClick={() => navigate('/home')}
            className="p-2 -ml-2"
            whileTap={{ scale: 0.9 }}
          >
            <ArrowLeft className="w-6 h-6 text-foreground" />
          </motion.button>
          <h1 className="text-xl font-bold text-foreground flex-1 line-clamp-1">{venue.name}</h1>
          <div className="flex gap-2">
            <motion.button
              className="p-2 rounded-full bg-muted"
              whileTap={{ scale: 0.9 }}
            >
              <Share2 className="w-5 h-5 text-foreground" />
            </motion.button>
            <motion.button
              className="p-2 rounded-full bg-muted"
              whileTap={{ scale: 0.9 }}
              onClick={() => {
                if (!id) return;
                const nowFav = toggleFavouriteVenue(id);
                setFavourite(nowFav);
                toast.success(nowFav ? 'Venue added to favourites. Their stories will appear in your story ring.' : 'Venue removed from favourites.');
              }}
              aria-label={favourite ? 'Remove from favourites' : 'Add to favourites'}
            >
              <Heart className={`w-5 h-5 ${favourite ? 'fill-red-500 text-red-500' : 'text-foreground'}`} />
            </motion.button>
          </div>
        </div>
      </div>

      <div className="pb-4">
        {/* Image */}
        <div className="relative h-64 w-full">
          <img src={venueImage} alt={venue.name} className="w-full h-full object-cover" />
          <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-card/90 backdrop-blur-sm">
              <Star className="w-4 h-4 fill-secondary text-secondary" />
              <span className="text-sm font-medium text-card">{venueRating}</span>
              {venueReviewCount > 0 && (
                <span className="text-xs text-card/80">({venueReviewCount})</span>
              )}
            </div>
            <div className="px-3 py-1 rounded-full bg-card/90 backdrop-blur-sm">
              <span className={`text-xs font-medium ${venueIsOpen ? 'text-friendme' : 'text-destructive'}`}>
                {venueIsOpen ? 'Open' : 'Closed'}
              </span>
            </div>
          </div>
        </div>

        <div className="px-4 space-y-4 mt-4">
          {/* Basic Info */}
          <div>
            <h2 className="text-2xl font-bold text-foreground mb-1">{venue.name}</h2>
            <p className="text-muted-foreground">{venueCategory}</p>
          </div>

          {/* Quick Info */}
          <div className="grid grid-cols-2 gap-3">
            <div className="flex items-center gap-2 p-3 rounded-xl bg-muted">
              <MapPin className="w-4 h-4 text-primary" />
              <span className="text-sm text-foreground line-clamp-1">{venue.address}</span>
            </div>
            {venuePriceRange && (
              <div className="flex items-center gap-2 p-3 rounded-xl bg-muted">
                <DollarSign className="w-4 h-4 text-primary" />
                <span className="text-sm text-foreground">{venuePriceRange}</span>
              </div>
            )}
          </div>
          
          {/* Address Details */}
          <div className="space-y-1">
            <p className="text-sm text-foreground">{venue.address}</p>
            <p className="text-sm text-muted-foreground">{venue.city}{venue.state ? `, ${venue.state}` : ''} {venue.zipCode || ''}</p>
            {venue.phone && (
              <p className="text-sm text-primary">{venue.phone}</p>
            )}
            {venue.website && (
              <a 
                href={venue.website} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-sm text-primary hover:underline"
              >
                {venue.website}
              </a>
            )}
            {venue.menuUrl && (
              <a 
                href={venue.menuUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-sm text-primary hover:underline"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                View menu
              </a>
            )}
          </div>

          {/* Upcoming Events Section */}
          {upcomingEvents.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-primary" />
                  <h3 className="font-semibold text-foreground text-lg">Upcoming</h3>
                </div>
                {upcomingEvents.length > 3 && (
                  <motion.button
                    onClick={() => navigate(`/venues`)}
                    className="text-primary text-sm font-medium flex items-center gap-1"
                    whileTap={{ scale: 0.95 }}
                  >
                    View All
                    <ChevronRight className="w-4 h-4" />
                  </motion.button>
                )}
              </div>
              <div className="space-y-3">
                {upcomingEvents.slice(0, 3).map((event: any, index: number) => (
                  <motion.div
                    key={event.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    onClick={() => {
                      if (event.type === 'class') {
                        navigate(`/class/${event.id}`);
                      } else {
                        navigate(`/vibe/${event.id}`);
                      }
                    }}
                    className="card-elevated p-4 rounded-2xl cursor-pointer hover:border-primary/40 transition-all"
                  >
                    <div className="flex gap-3">
                      <div className="relative w-20 h-20 rounded-xl overflow-hidden flex-shrink-0">
                        {event.image ? (
                          <img src={event.image} alt={event.title} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
                            {event.type === 'class' ? (
                              <GraduationCap className="w-8 h-8 text-primary" />
                            ) : (
                              <Calendar className="w-8 h-8 text-primary" />
                            )}
                          </div>
                        )}
                        <div className="absolute top-1 right-1 w-6 h-6 rounded-full bg-primary/90 flex items-center justify-center">
                          {event.type === 'class' ? (
                            <GraduationCap className="w-3 h-3 text-primary-foreground" />
                          ) : (
                            <Calendar className="w-3 h-3 text-primary-foreground" />
                          )}
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                            event.type === 'class' 
                              ? 'bg-primary/10 text-primary' 
                              : event.type === 'event'
                              ? 'bg-violet-500/10 text-violet-600 dark:text-violet-400'
                              : 'bg-secondary/10 text-secondary'
                          }`}>
                            {event.type === 'class' ? 'Class' : getVibeTypeLabel(event.type)}
                          </span>
                          {(event.price !== undefined && event.price !== null) || event.pricePerPerson != null ? (
                            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                              (event.price === 0 || event.pricePerPerson === 0 || event.isFree) ? 'bg-green-500/10 text-green-600 dark:text-green-400' : 'bg-muted text-foreground'
                            }`}>
                              {(event.price === 0 || event.pricePerPerson === 0 || event.isFree) ? 'Free' : 'Paid'}
                            </span>
                          ) : null}
                          {event.isPremium && (
                            <span className="text-xs px-2 py-0.5 rounded-full bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-500/30 text-yellow-600 dark:text-yellow-400 font-bold">
                              Premium
                            </span>
                          )}
                          {event.isExclusive && (
                            <span className="text-xs px-2 py-0.5 rounded-full bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30 text-purple-600 dark:text-purple-400 font-bold">
                              Exclusive
                            </span>
                          )}
                        </div>
                        <h4 className="font-bold text-foreground mb-1 line-clamp-1">{event.title}</h4>
                        {event.description && (
                          <p className="text-xs text-muted-foreground line-clamp-1 mb-2">{event.description}</p>
                        )}
                        <div className="flex items-center gap-3 text-xs text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            <span>{format(new Date(event.startTime), 'MMM d, h:mm a')}</span>
                          </div>
                          {event.type === 'class' && event._count && (
                            <div className="flex items-center gap-1">
                              <Users className="w-3 h-3" />
                              <span>{event._count.enrollments || 0} enrolled</span>
                            </div>
                          )}
                          {event.type === 'vibe' && event._count && (
                            <div className="flex items-center gap-1">
                              <Users className="w-3 h-3" />
                              <span>{event._count.members || 0} joined</span>
                            </div>
                          )}
                          {event.price !== undefined && event.price !== null && (
                            <div className="flex items-center gap-1">
                              <DollarSign className="w-3 h-3" />
                              <span>{event.price === 0 ? 'Free' : `$${event.price}`}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {/* Campaigns Section - Horizontal Scroll */}
          {campaigns.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Tag className="w-5 h-5 text-primary" />
                <h3 className="font-semibold text-foreground text-lg">Campaigns & Offers</h3>
              </div>
              <div className="overflow-x-auto -mx-4 px-4 pb-2 scrollbar-hide">
                <div className="flex gap-3" style={{ width: 'max-content' }}>
                  {campaigns.map((campaign) => {
                    const currentDay = new Date().toLocaleDateString('en-US', { weekday: 'long' });
                    const isActive = campaign.days.includes(currentDay);
                    const currentHour = new Date().getHours();
                    const campaignStartHour = campaign.time === 'All Day' ? 0 : parseInt(campaign.time.split(' - ')[0]?.split(':')[0] || '0');
                    const campaignEndHour = campaign.time === 'All Day' ? 23 : parseInt(campaign.time.split(' - ')[1]?.split(':')[0] || '23');
                    const isTimeValid = campaign.time === 'All Day' || (currentHour >= campaignStartHour && currentHour < campaignEndHour);
                    
                    return (
                      <motion.div
                        key={campaign.id}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className={`card-elevated p-4 rounded-2xl border-2 flex-shrink-0 w-80 ${
                          isActive && isTimeValid ? 'border-primary/50 bg-primary/5' : 'border-border'
                        }`}
                      >
                        <div className="flex flex-col gap-3">
                          <div className="relative w-full h-32 rounded-xl overflow-hidden">
                            <img src={campaign.image} alt={campaign.title} className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end justify-center pb-2">
                              <span className="text-3xl">{campaign.icon}</span>
                            </div>
                            <div className="absolute top-2 right-2">
                              <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                                campaign.discount.includes('%')
                                  ? 'bg-primary/90 text-white'
                                  : campaign.discount.includes('FREE') || campaign.discount.includes('Free')
                                  ? 'bg-friendme/90 text-white'
                                  : 'bg-secondary/90 text-white'
                              }`}>
                                {campaign.discount}
                              </span>
                            </div>
                          </div>
                          <div className="space-y-2">
                            <h4 className="font-semibold text-foreground text-base">{campaign.title}</h4>
                            <p className="text-sm text-muted-foreground line-clamp-2">{campaign.description}</p>
                            <div className="flex flex-col gap-1 text-xs">
                              <div className="flex items-center gap-1 text-muted-foreground">
                                <Clock className="w-3 h-3" />
                                <span>{campaign.time}</span>
                              </div>
                              <div className="flex items-center gap-1 text-muted-foreground">
                                <Calendar className="w-3 h-3" />
                                <span className="line-clamp-1">{campaign.days.join(', ')}</span>
                              </div>
                            </div>
                            {isActive && isTimeValid && (
                              <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-primary/20 text-primary text-xs font-medium"
                              >
                                <Sparkles className="w-3 h-3" />
                                Active Now
                              </motion.div>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Free Items Section - Horizontal Scroll */}
          {freeItems.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-friendme" />
                <h3 className="font-semibold text-foreground text-lg">Free Items</h3>
              </div>
              <div className="overflow-x-auto -mx-4 px-4 pb-2 scrollbar-hide">
                <div className="flex gap-3" style={{ width: 'max-content' }}>
                  {freeItems.map((item) => {
                    const currentDay = new Date().toLocaleDateString('en-US', { weekday: 'long' });
                    const isActive = item.days.includes(currentDay);
                    const currentHour = new Date().getHours();
                    const itemStartHour = item.time === 'All Day' ? 0 : parseInt(item.time.split(' - ')[0]?.split(':')[0] || '0');
                    const itemEndHour = item.time === 'All Day' ? 23 : parseInt(item.time.split(' - ')[1]?.split(':')[0] || '23');
                    const isTimeValid = item.time === 'All Day' || (currentHour >= itemStartHour && currentHour < itemEndHour);
                    
                    return (
                      <motion.div
                        key={item.id}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className={`card-elevated p-4 rounded-2xl border-2 flex-shrink-0 w-72 ${
                          isActive && isTimeValid ? 'border-friendme/50 bg-friendme/5' : 'border-border'
                        }`}
                      >
                        <div className="flex flex-col gap-3">
                          <div className="relative w-full h-28 rounded-xl overflow-hidden">
                            <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end justify-center pb-2">
                              <span className="text-3xl">{item.icon}</span>
                            </div>
                            <div className="absolute top-2 right-2">
                              <span className="px-2 py-1 rounded-full text-xs font-bold bg-friendme/90 text-white">
                                {item.discount}
                              </span>
                            </div>
                          </div>
                          <div className="space-y-1">
                            <h4 className="font-semibold text-foreground text-base">{item.title}</h4>
                            <p className="text-sm text-muted-foreground line-clamp-2">{item.description}</p>
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                              <Clock className="w-3 h-3" />
                              <span>{item.time}</span>
                            </div>
                            {isActive && isTimeValid && (
                              <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-friendme/20 text-friendme text-xs font-medium"
                              >
                                <Sparkles className="w-3 h-3" />
                                Active Now
                              </motion.div>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Tabs */}
          <Tabs defaultValue="ambiance" className="w-full">
            <TabsList className="grid w-full grid-cols-2 bg-muted rounded-xl p-1 h-12">
              <TabsTrigger value="ambiance" className="rounded-lg">Ambiance</TabsTrigger>
              <TabsTrigger value="menu" className="rounded-lg">
                {isRestaurant ? 'Menu' : 'Services'}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="ambiance" className="mt-4 space-y-4">
              <div className="card-elevated p-4">
                <h3 className="font-semibold text-foreground mb-3">Ambiance</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Atmosphere</span>
                    <span className="text-sm font-medium text-foreground">Cozy & Modern</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Music</span>
                    <span className="text-sm font-medium text-foreground">Live Jazz (Weekends)</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Lighting</span>
                    <span className="text-sm font-medium text-foreground">Warm & Dim</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Crowd</span>
                    <span className="text-sm font-medium text-foreground">Mixed Ages</span>
                  </div>
                </div>
              </div>

              {/* Photo Gallery */}
              <div>
                <h3 className="font-semibold text-foreground mb-3">Photo Gallery</h3>
                <div className="grid grid-cols-2 gap-2">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="aspect-square rounded-xl overflow-hidden">
                      <img
                        src={`https://images.unsplash.com/photo-${1550000000000 + i}?w=400`}
                        alt={`Gallery ${i}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="menu" className="mt-4 space-y-4">
              {isRestaurant ? (
                <div className="card-elevated p-4">
                  <h3 className="font-semibold text-foreground mb-3">Menu</h3>
                  {venue.menuUrl ? (
                    <a
                      href={venue.menuUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-primary hover:underline font-medium"
                    >
                      <ExternalLink className="w-4 h-4" />
                      View menu online
                    </a>
                  ) : (
                    <p className="text-sm text-muted-foreground">No menu link provided.</p>
                  )}
                </div>
              ) : (
                <div className="card-elevated p-4">
                  <h3 className="font-semibold text-foreground mb-3">Services</h3>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <UtensilsCrossed className="w-5 h-5 text-primary" />
                      <span className="text-foreground">Full Bar Service</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Clock className="w-5 h-5 text-primary" />
                      <span className="text-foreground">Live Music Events</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Share2 className="w-5 h-5 text-primary" />
                      <span className="text-foreground">Private Event Booking</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Heart className="w-5 h-5 text-primary" />
                      <span className="text-foreground">VIP Lounge Access</span>
                    </div>
                  </div>
                </div>
              )}
            </TabsContent>
          </Tabs>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button
              variant="outline"
              className="flex-1 h-12"
              onClick={() => navigate('/home')}
            >
              Back
            </Button>
            <Button
              className="flex-1 h-12 bg-gradient-primary"
              onClick={() => toast.success('Venue saved!')}
            >
              Save Venue
            </Button>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default VenueDetailPage;
