import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import { 
  X, ChevronRight, MapPin, Calendar, Clock, Users, 
  Coffee, UtensilsCrossed, Dumbbell, Film, Heart, 
  Palette, PartyPopper, Briefcase, Sparkles, Camera,
  Globe, Lock, DollarSign, Search, Info, Star, Phone, ExternalLink,
  Shield, Share2, CheckCircle2, ArrowRight, Ticket, Users2, Gift, Navigation, Check
} from 'lucide-react';
import AppLayout from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useVenues, useVenue } from '@/hooks/useVenues';
import { checkVenueHours } from '@/lib/venueHours';
import { useCommunities } from '@/hooks/useCommunities';
import { useCreateMeetup } from '@/hooks/useMeetups';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';

const categoryOptions = [
  { id: 'coffee', icon: Coffee, label: 'Coffee', emoji: '☕', venueTypes: ['café', 'coffee', 'cafe'] },
  { id: 'dining', icon: UtensilsCrossed, label: 'Dining', emoji: '🍽️', venueTypes: ['restaurant', 'dining', 'food'] },
  { id: 'sports', icon: Dumbbell, label: 'Sports', emoji: '🎾', venueTypes: ['sports', 'gym', 'stadium'] },
  { id: 'cinema', icon: Film, label: 'Cinema', emoji: '🎬', venueTypes: ['cinema', 'theater', 'entertainment'] },
  { id: 'wellness', icon: Heart, label: 'Wellness', emoji: '🧘', venueTypes: ['wellness', 'spa', 'yoga', 'fitness'] },
  { id: 'activities', icon: Palette, label: 'Activities', emoji: '🎨', venueTypes: ['activities', 'art', 'museum', 'gallery'] },
  { id: 'events', icon: PartyPopper, label: 'Events', emoji: '🎉', venueTypes: ['events', 'venue', 'hall', 'club'] },
  { id: 'networking', icon: Briefcase, label: 'Networking', emoji: '💼', venueTypes: ['networking', 'coworking', 'business'] },
  { id: 'custom', icon: Sparkles, label: 'Custom', emoji: '✨', venueTypes: [] },
];

const visibilityOptions = [
  { id: 'public', label: 'Public', description: 'Anyone can see and join', icon: Globe },
  { id: 'private', label: 'Private', description: 'Invite only event', icon: Lock },
];

const pricingOptions = [
  { id: 'free', label: 'Free', description: 'No cost to attend' },
  { id: 'paid', label: 'Paid', description: 'Set a price per person' },
];

const groupSizeOptions = [
  { id: '1-1', label: '1-on-1', icon: '👥', value: 2 },
  { id: '2-4', label: '2-4 people', icon: '👥👥', value: 4 },
  { id: '4+', label: '4+ people', icon: '👥👥👥', value: 10 },
  { id: 'custom', label: 'Custom', icon: '✏️', value: null },
];

// Mock venues for fallback with venue types
const suggestedVenues = [
  { id: '1', name: 'Panther Coffee, Wynwood', address: '2390 NW 2nd Ave, Miami', city: 'Miami', rating: 4.8, phone: '(305) 555-0123', website: 'https://panthercoffee.com', image: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=400', priceRange: '$$', reviewCount: 342, category: 'Café', venueType: 'café' },
  { id: '4', name: 'Zuma Miami', address: '270 Biscayne Blvd Way, Miami', city: 'Miami', rating: 4.9, phone: '(305) 555-0126', website: 'https://zumarestaurant.com', image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400', priceRange: '$$$', reviewCount: 512, category: 'Japanese', venueType: 'restaurant' },
  { id: '5', name: 'Joe\'s Stone Crab', address: '11 Washington Ave, Miami Beach', city: 'Miami Beach', rating: 4.6, phone: '(305) 555-0127', website: 'https://joesstonecrab.com', image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400', priceRange: '$$$', reviewCount: 892, category: 'Restaurant', venueType: 'restaurant' },
  { id: '6', name: 'Versailles Restaurant', address: '3555 SW 8th St, Miami', city: 'Miami', rating: 4.4, phone: '(305) 555-0128', website: '', image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400', priceRange: '$$', reviewCount: 1245, category: 'Restaurant', venueType: 'restaurant' },
];

// Sample menu items for restaurants
const sampleMenuItems = [
  {
    id: '1',
    name: 'Grilled Salmon',
    description: 'Fresh Atlantic salmon with lemon butter sauce',
    price: 28,
    image: 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=400',
    ingredients: ['Salmon', 'Lemon', 'Butter', 'Herbs', 'Olive Oil'],
    calories: 420,
    category: 'Main Course',
  },
  {
    id: '2',
    name: 'Caesar Salad',
    description: 'Crisp romaine lettuce with parmesan and croutons',
    price: 16,
    image: 'https://images.unsplash.com/photo-1546793665-c74683f339c1?w=400',
    ingredients: ['Romaine Lettuce', 'Parmesan', 'Croutons', 'Caesar Dressing'],
    calories: 280,
    category: 'Salad',
  },
  {
    id: '3',
    name: 'Chocolate Lava Cake',
    description: 'Warm chocolate cake with molten center',
    price: 12,
    image: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=400',
    ingredients: ['Dark Chocolate', 'Butter', 'Eggs', 'Sugar', 'Flour'],
    calories: 450,
    category: 'Dessert',
  },
];

const CreateVibePage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const communityIdFromQuery = searchParams.get('communityId') || '';
  const [category, setCategory] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [venue, setVenue] = useState('');
  const [venueAddress, setVenueAddress] = useState('');
  const [selectedVenueId, setSelectedVenueId] = useState<string | null>(null);
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [groupSize, setGroupSize] = useState('2-4');
  const [customGroupSize, setCustomGroupSize] = useState('');
  const [visibility, setVisibility] = useState('public');
  const [pricing, setPricing] = useState('free');
  const [pricePerPerson, setPricePerPerson] = useState('');
  const [searchVenue, setSearchVenue] = useState('');
  const [showVenueDetail, setShowVenueDetail] = useState(false);
  const [selectedVenueDetail, setSelectedVenueDetail] = useState<any>(null);
  const [eventType, setEventType] = useState<'activity' | 'event'>('activity');
  const [showTypeRecommendationModal, setShowTypeRecommendationModal] = useState(false);
  const [communityId, setCommunityId] = useState(communityIdFromQuery);
  const [recommendedType, setRecommendedType] = useState<'activity' | 'event' | null>(null);
  const [recommendedMaxAttendees, setRecommendedMaxAttendees] = useState<number>(0);
  const [skillLevel, setSkillLevel] = useState<string>('');
  const [showFeeTypePicker, setShowFeeTypePicker] = useState(false);
  const [showSkillPicker, setShowSkillPicker] = useState(false);
  const dateInputRef = useRef<HTMLInputElement>(null);
  const timeInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (communityIdFromQuery) setCommunityId(communityIdFromQuery);
  }, [communityIdFromQuery]);

  useEffect(() => {
    const fromState = (location.state as any)?.selectedVenue;
    if (fromState?.id) {
      setVenue(fromState.name);
      setVenueAddress(fromState.address || fromState.addressOnly || '');
      setSelectedVenueId(fromState.id);
      window.history.replaceState({}, '', location.pathname + (location.search || ''));
    }
  }, [location.state, location.pathname, location.search]);

  const { data: communities = [] } = useCommunities();
  // Fetch venues from backend
  const { data: venuesData, isLoading: venuesLoading } = useVenues({
    search: searchVenue || undefined,
  });
  
  // Fetch detailed venue data when a venue is selected for detail view
  const { data: venueDetailData } = useVenue(selectedVenueId || '');
  
  const createMeetup = useCreateMeetup();
  
  // Get selected category's venue types
  const selectedCategory = categoryOptions.find(c => c.id === category);
  const venueTypeFilters = selectedCategory?.venueTypes || [];
  
  // Use backend venues if available, otherwise use mock data
  const allVenues = venuesData && venuesData.length > 0 
    ? venuesData.map(v => {
        // Try to determine venue type from amenities or description
        const venueType = v.amenities?.find((a: string) => 
          ['restaurant', 'café', 'cafe', 'dining', 'food'].some(type => 
            a.toLowerCase().includes(type.toLowerCase())
          )
        ) ? 'restaurant' : 
        v.amenities?.find((a: string) => 
          ['café', 'cafe', 'coffee'].some(type => 
            a.toLowerCase().includes(type.toLowerCase())
          )
        ) ? 'café' : 'venue';
        
        return {
          id: v.id,
          name: v.name,
          address: v.address,
          city: v.city,
          rating: 4.5, // Default rating
          phone: v.phone,
          website: v.website,
          image: v.image,
          priceRange: '$$', // Default
          reviewCount: v._count?.meetups || 0,
          category: v.description || 'Venue',
          venueType,
          pricePerHalfHour: (v as { pricePerHalfHour?: number }).pricePerHalfHour ?? 0,
        };
      })
    : suggestedVenues;
  
  // Filter venues by category if category is selected
  const venues = category && venueTypeFilters.length > 0
    ? allVenues.filter(v => {
        const venueType = (v.venueType || v.category?.toLowerCase() || '').toLowerCase();
        const venueName = (v.name || '').toLowerCase();
        return venueTypeFilters.some(vt => 
          venueType.includes(vt.toLowerCase()) || 
          venueName.includes(vt.toLowerCase())
        );
      })
    : allVenues;

  const handleCreateVibe = async () => {
    try {
      if (!title || !title.trim()) {
        toast.error('Please enter a title');
        return;
      }
      
      if (!date || !time) {
        toast.error('Please select both date and time');
        return;
      }
      
      // Combine date and time - ensure proper ISO format
      // Date format: YYYY-MM-DD, Time format: HH:MM
      const dateTimeString = `${date}T${time}:00`;
      const startTimeDate = new Date(dateTimeString);
      
      // Validate date
      if (isNaN(startTimeDate.getTime())) {
        toast.error('Invalid date or time');
        return;
      }
      
      // Ensure future date
      if (startTimeDate < new Date()) {
        toast.error('Please select a future date and time');
        return;
      }

      // Check venue open hours when a venue is selected
      const venueHours = selectedVenueId && venueDetailData?.businessHours
        ? checkVenueHours(venueDetailData.businessHours, startTimeDate)
        : { valid: true };
      if (!venueHours.valid) {
        toast.error(venueHours.message);
        return;
      }
      
      const startTime = startTimeDate.toISOString();
      
      // Parse group size to maxAttendees
      let maxAttendees: number;
      if (groupSize === 'custom' && customGroupSize) {
        const customValue = parseInt(customGroupSize);
        if (isNaN(customValue) || customValue < 1) {
          toast.error('Please enter a valid number for custom group size');
          return;
        }
        maxAttendees = customValue;
      } else {
        const selectedOption = groupSizeOptions.find(opt => opt.id === groupSize);
        maxAttendees = selectedOption?.value || 4;
      }
      
      const meetupData: any = {
        title: title.trim(),
        description: description?.trim() || undefined,
        startTime,
        category: category || undefined,
        maxAttendees,
        isPublic: visibility === 'public',
        isFree: pricing === 'free',
        location: venueAddress || venue || undefined,
        type: eventType, // 'activity' or 'event'
        communityId: communityId || undefined,
      };
      
      if (pricing === 'paid') {
        if (!pricePerPerson || pricePerPerson.trim() === '') {
          toast.error('Please enter a price for paid vibes');
          return;
        }
        const price = parseFloat(pricePerPerson);
        if (isNaN(price) || price < 0) {
          toast.error('Price cannot be negative');
          return;
        }
        if (price < 10) {
          toast.error('Paid vibes must be at least $10');
          return;
        }
        meetupData.pricePerPerson = price;
      }
      
      // Only add venueId if it's a valid UUID format
      if (selectedVenueId) {
        // Check if it's a valid UUID format (8-4-4-4-12 hex digits)
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
        if (uuidRegex.test(selectedVenueId)) {
          meetupData.venueId = selectedVenueId;
        }
        // If it's not a UUID (mock data), don't send venueId - silently skip
      }
      
      const response = await createMeetup.mutateAsync(meetupData);
      
      // Show appropriate message based on venue approval status
      if (selectedVenueId && meetupData.venueId) {
        toast.success('Activity created! Waiting for venue approval. You will be notified once approved.', {
          duration: 5000,
        });
      } else {
        toast.success('Vibe created successfully!');
      }
      
      if (communityId) {
        navigate(`/community/${communityId}`);
      } else {
        navigate('/my-meetups');
      }
    } catch (error: any) {
      console.error('Create vibe error:', error);
      // Try to get detailed error message
      let errorMessage = 'Failed to create vibe';
      if (error.response?.data?.errors) {
        const errors = error.response.data.errors;
        errorMessage = errors.map((e: any) => `${e.path}: ${e.message}`).join(', ');
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }
      toast.error(errorMessage);
    }
  };
  
  const handleVenueSelect = (venueItem: any) => {
    setVenue(venueItem.name);
    setVenueAddress(venueItem.address);
    setSelectedVenueId(venueItem.id);
    setShowVenueDetail(false);
  };
  
  const handleVenueDetailClick = (venueItem: any) => {
    setSelectedVenueDetail(venueItem);
    if (venueItem.id) {
      setSelectedVenueId(venueItem.id);
    }
    setShowVenueDetail(true);
  };
  
  // Use detailed venue data if available, otherwise use the selected venue item
  const displayVenue = venueDetailData || selectedVenueDetail;
  const isRestaurant = displayVenue?.venueType === 'restaurant' ||
                       displayVenue?.category?.toLowerCase().includes('restaurant') || 
                       displayVenue?.category?.toLowerCase().includes('dining') ||
                       displayVenue?.category?.toLowerCase().includes('food') ||
                       displayVenue?.name?.toLowerCase().includes('restaurant');

  const handleBack = () => navigate('/home');

  const canSubmit = () => {
    if (!title.trim()) return false;
    if (!date || !time) return false;
    const groupSizeValid = groupSize !== 'custom' || (!!customGroupSize && parseInt(customGroupSize) > 0);
    const pricingValid = pricing === 'free' || (pricing === 'paid' && !!pricePerPerson);
    return groupSizeValid && pricingValid;
  };

  const selectedCategoryData = categoryOptions.find(c => c.id === category);

  const filteredVenues = venues.filter(v => 
    v.name.toLowerCase().includes(searchVenue.toLowerCase()) ||
    v.address.toLowerCase().includes(searchVenue.toLowerCase())
  );

  const skillLevelOptions = ['Beginner', 'Intermediate', 'Advanced', 'Any'];

  const formatDisplayDate = (d: string) => {
    if (!d) return null;
    const x = new Date(d + 'T12:00:00');
    return isNaN(x.getTime()) ? null : x.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });
  };
  const formatDisplayTime = (t: string) => {
    if (!t) return null;
    const [h, m] = t.split(':');
    const hour = parseInt(h, 10);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const h12 = hour % 12 || 12;
    return `${h12}:${m || '00'} ${ampm}`;
  };

  return (
    <AppLayout hideNav>
      <div className="min-h-screen flex flex-col bg-background">
        {/* Header - back, title, checkmark submit */}
        <div className="sticky top-0 z-40 glass safe-top border-b border-border/50">
          <div className="flex items-center justify-between px-4 py-3">
            <motion.button
              onClick={handleBack}
              className="p-2 -ml-2 rounded-lg hover:bg-muted/80"
              whileTap={{ scale: 0.9 }}
            >
              <X className="w-6 h-6 text-foreground" />
            </motion.button>
            <h1 className="font-bold text-foreground text-lg">Create Vibe</h1>
            <motion.button
              onClick={() => canSubmit() && handleCreateVibe()}
              disabled={!canSubmit() || createMeetup.isPending}
              className="p-2 rounded-lg disabled:opacity-40 hover:bg-muted/80"
              whileTap={{ scale: 0.9 }}
            >
              <Check className="w-6 h-6 text-primary" />
            </motion.button>
          </div>
        </div>

        {/* Single-page scrollable form */}
        <div className="flex-1 overflow-y-auto px-4 py-6 pb-32">
          {/* Cover photo */}
          <motion.button
            type="button"
            className="w-full aspect-[4/3] max-h-48 rounded-2xl border-2 border-dashed border-border bg-muted/50 flex flex-col items-center justify-center gap-2 mb-6"
            whileTap={{ scale: 0.98 }}
          >
            <Camera className="w-10 h-10 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Add cover photo</span>
          </motion.button>

          {/* Activity Name */}
          <div className="space-y-2 mb-4">
            <Input
              placeholder="Activity Name"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="h-12 rounded-xl text-base"
            />
          </div>

          {/* Activity Description */}
          <div className="mb-6">
            <Textarea
              placeholder="Tell everyone about your activity..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="rounded-xl min-h-[100px] resize-none text-base"
            />
          </div>

          {/* Row items: Date, Time, Fee Type, Location */}
          <div className="space-y-2 mb-6">
            <label className="text-sm font-medium text-muted-foreground px-1">Details</label>
            <div className="rounded-2xl border border-border bg-card overflow-hidden divide-y divide-border">
              {/* Date */}
              <button
                type="button"
                onClick={() => dateInputRef.current?.showPicker?.() ?? dateInputRef.current?.click()}
                className="flex items-center gap-3 px-4 py-3.5 w-full hover:bg-muted/50 transition-colors text-left"
              >
                <span className="text-xl" role="img" aria-hidden>📅</span>
                <span className="flex-1 text-foreground">{formatDisplayDate(date) || 'Date'}</span>
                <span className="text-sm text-muted-foreground">{date ? '' : 'Select Date'}</span>
                <ChevronRight className="w-5 h-5 text-muted-foreground" />
              </button>
              <input
                ref={dateInputRef}
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="absolute opacity-0 pointer-events-none w-0 h-0"
                aria-hidden
              />
              {/* Time */}
              <button
                type="button"
                onClick={() => timeInputRef.current?.showPicker?.() ?? timeInputRef.current?.click()}
                className="flex items-center gap-3 px-4 py-3.5 w-full hover:bg-muted/50 transition-colors text-left"
              >
                <span className="text-xl" role="img" aria-hidden>⏰</span>
                <span className="flex-1 text-foreground">{formatDisplayTime(time) || 'Time'}</span>
                <span className="text-sm text-muted-foreground">{time ? '' : 'Select Time'}</span>
                <ChevronRight className="w-5 h-5 text-muted-foreground" />
              </button>
              <input
                ref={timeInputRef}
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="absolute opacity-0 pointer-events-none w-0 h-0"
                aria-hidden
              />
              {/* Fee Type */}
              <button
                type="button"
                onClick={() => setShowFeeTypePicker(true)}
                className="flex items-center gap-3 px-4 py-3.5 w-full hover:bg-muted/50 transition-colors text-left"
              >
                <span className="text-xl" role="img" aria-hidden>$</span>
                <span className="flex-1 text-foreground">{pricing === 'free' ? 'Free' : 'Paid'}</span>
                <span className="text-sm text-muted-foreground">Fee Type</span>
                <ChevronRight className="w-5 h-5 text-muted-foreground" />
              </button>
              {/* Location */}
              <button
                type="button"
                onClick={() => navigate('/select-venue?returnTo=create-vibe')}
                className="flex items-center gap-3 px-4 py-3.5 w-full hover:bg-muted/50 transition-colors text-left"
              >
                <span className="text-xl" role="img" aria-hidden>📍</span>
                <span className="flex-1 text-foreground truncate">{venue || venueAddress || 'Location'}</span>
                <span className="text-sm text-muted-foreground shrink-0">{venue ? '' : 'Add Location'}</span>
                <ChevronRight className="w-5 h-5 text-muted-foreground shrink-0" />
              </button>
            </div>
            {venue && selectedVenueId && (
              <div className="mt-3 p-3 rounded-xl bg-blue-500/10 border border-blue-500/20">
                <div className="flex items-start gap-2">
                  <Shield className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                  <p className="text-xs text-blue-700">This activity will be sent to the venue for approval. You'll be notified once they respond.</p>
                </div>
              </div>
            )}
          </div>

          {/* Participant Limit, Joining Fee, Skill Level */}
          <div className="space-y-4 mb-6">
            <div className="flex items-center justify-between gap-4">
              <label className="text-sm font-medium text-foreground">Participant Limit</label>
              <Input
                type="number"
                placeholder="e.g., 10"
                min={1}
                value={groupSize === 'custom' ? customGroupSize : String(groupSizeOptions.find(o => o.id === groupSize)?.value ?? '')}
                onChange={(e) => {
                  const v = e.target.value;
                  setCustomGroupSize(v);
                  if (v) setGroupSize('custom');
                  const num = parseInt(v, 10);
                  if (!isNaN(num) && num >= 15 && eventType === 'activity') {
                    setRecommendedType('event');
                    setRecommendedMaxAttendees(num);
                    setShowTypeRecommendationModal(true);
                  }
                }}
                className="h-10 w-24 rounded-xl text-right"
              />
            </div>
            <div className="flex items-center justify-between gap-3 p-3 rounded-xl border border-border bg-muted/30">
              <p className="text-sm text-muted-foreground">Planning an event with 15+ people?</p>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="rounded-xl gap-1.5 shrink-0"
                onClick={() => {
                  setRecommendedType('event');
                  setRecommendedMaxAttendees(15);
                  setShowTypeRecommendationModal(true);
                }}
              >
                <Ticket className="w-4 h-4" />
                Event (15+)
              </Button>
            </div>
            {pricing === 'paid' && (
              <div className="flex items-center justify-between gap-4">
                <label className="text-sm font-medium text-foreground">Joining Fee (If Paid)</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                  <Input
                    type="number"
                    placeholder="eg., 10"
                    min={0}
                    value={pricePerPerson}
                    onChange={(e) => {
                      const v = e.target.value;
                      if (v === '' || v === '.') setPricePerPerson(v);
                      else { const n = parseFloat(v); if (!isNaN(n) && n < 0) setPricePerPerson('0'); else setPricePerPerson(v); }
                    }}
                    className="h-10 w-24 rounded-xl pl-6 text-right"
                  />
                </div>
              </div>
            )}
            <div className="flex items-center justify-between gap-4">
              <label className="text-sm font-medium text-foreground">Required Skill Level</label>
              <button
                type="button"
                onClick={() => setShowSkillPicker(true)}
                className="px-4 py-2 rounded-xl bg-muted text-sm text-foreground hover:bg-muted/80"
              >
                {skillLevel || 'Select Skill'}
              </button>
            </div>
          </div>

          {/* Make Activity Public */}
          <div className="flex items-center justify-between p-4 rounded-2xl border border-border bg-card mb-6">
            <div>
              <p className="font-medium text-foreground">Make Activity Public</p>
              <p className="text-xs text-muted-foreground mt-0.5">Anyone on FriendMe can see this.</p>
            </div>
            <Switch
              checked={visibility === 'public'}
              onCheckedChange={(checked) => setVisibility(checked ? 'public' : 'private')}
            />
          </div>

          {/* Invite Friends */}
          <div className="flex items-center justify-between p-4 rounded-2xl border border-border bg-card">
            <div className="flex items-center gap-3">
              <div className="flex -space-x-2">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="w-9 h-9 rounded-full bg-muted border-2 border-background flex items-center justify-center text-xs font-medium text-muted-foreground">
                    ?
                  </div>
                ))}
                <div className="w-9 h-9 rounded-full bg-muted/80 border-2 border-background flex items-center justify-center text-xs font-medium text-muted-foreground">
                  +3
                </div>
              </div>
              <span className="text-sm font-medium text-foreground">Invite Friends</span>
            </div>
            <Button type="button" variant="outline" size="sm" className="rounded-xl gap-1.5">
              <Users2 className="w-4 h-4" />
              Invite Friends
            </Button>
          </div>

          {/* Inline venue search when no venue selected - compact */}
          {!venue && (
            <div className="mt-6 space-y-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search for a venue..."
                  value={searchVenue}
                  onChange={(e) => setSearchVenue(e.target.value)}
                  className="h-11 pl-9 rounded-xl"
                />
              </div>
              {venuesLoading ? (
                <p className="text-sm text-muted-foreground">Loading venues...</p>
              ) : filteredVenues.length > 0 ? (
                <div className="space-y-2">
                  {filteredVenues.slice(0, 3).map((place) => (
                    <button
                      key={place.id || place.name}
                      type="button"
                      onClick={() => handleVenueSelect(place)}
                      className="w-full flex items-center gap-3 p-3 rounded-xl border border-border bg-card hover:bg-muted/50 text-left"
                    >
                      <MapPin className="w-4 h-4 text-primary shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-foreground text-sm truncate">{place.name}</p>
                        <p className="text-xs text-muted-foreground truncate">{place.address}</p>
                      </div>
                      <ChevronRight className="w-4 h-4 text-muted-foreground" />
                    </button>
                  ))}
                </div>
              ) : null}
            </div>
          )}

          {/* Custom address */}
          <div className="mt-4">
            <label className="text-xs text-muted-foreground mb-1 block">Or enter custom address</label>
            <Input
              placeholder="Enter address..."
              value={venueAddress}
              onChange={(e) => {
                setVenueAddress(e.target.value);
                if (!venue) setVenue('Custom Location');
              }}
              className="h-11 rounded-xl"
            />
          </div>

          {/* Community (optional) - collapsed */}
          <div className="mt-6">
            <label className="text-xs text-muted-foreground mb-1 block">Community (optional)</label>
            <select
              value={communityId}
              onChange={(e) => setCommunityId(e.target.value)}
              className="w-full h-11 px-3 rounded-xl bg-muted border-0 text-foreground text-sm"
            >
              <option value="">None</option>
              {communities.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Fee Type Picker Dialog */}
        <Dialog open={showFeeTypePicker} onOpenChange={setShowFeeTypePicker}>
          <DialogContent className="max-w-sm rounded-2xl">
            <DialogHeader>
              <DialogTitle>Fee Type</DialogTitle>
            </DialogHeader>
            <div className="space-y-2">
              {pricingOptions.map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => { setPricing(opt.id); setShowFeeTypePicker(false); }}
                  className={`w-full p-4 rounded-xl text-left font-medium transition-colors ${
                    pricing === opt.id ? 'bg-primary/15 border-2 border-primary text-primary' : 'bg-muted/50 hover:bg-muted'
                  }`}
                >
                  {opt.label} — {opt.description}
                </button>
              ))}
            </div>
          </DialogContent>
        </Dialog>

        {/* Skill Level Picker Dialog */}
        <Dialog open={showSkillPicker} onOpenChange={setShowSkillPicker}>
          <DialogContent className="max-w-sm rounded-2xl">
            <DialogHeader>
              <DialogTitle>Required Skill Level</DialogTitle>
            </DialogHeader>
            <div className="space-y-2">
              {skillLevelOptions.map((opt) => (
                <button
                  key={opt}
                  type="button"
                  onClick={() => { setSkillLevel(opt); setShowSkillPicker(false); }}
                  className={`w-full p-4 rounded-xl text-left font-medium transition-colors ${
                    skillLevel === opt ? 'bg-primary/15 border-2 border-primary text-primary' : 'bg-muted/50 hover:bg-muted'
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Venue Detail Dialog */}
      <Dialog open={showVenueDetail} onOpenChange={setShowVenueDetail}>
        <DialogContent className="max-w-md mx-4 rounded-2xl max-h-[90vh] overflow-hidden flex flex-col p-0">
          {displayVenue && (
            <>
              {/* Image Header */}
              <div className="relative h-48 w-full">
                <img 
                  src={displayVenue.image || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400'} 
                  alt={displayVenue.name} 
                  className="w-full h-full object-cover" 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-foreground/60 to-transparent" />
                <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
                  <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-card/90 backdrop-blur-sm">
                    <Star className="w-4 h-4 fill-secondary text-secondary" />
                    <span className="text-sm font-medium text-card">{displayVenue.rating || 4.5}</span>
                    {displayVenue.reviewCount && (
                      <span className="text-xs text-card/80">({displayVenue.reviewCount})</span>
                    )}
                  </div>
                  {displayVenue.priceRange && (
                    <div className="px-3 py-1 rounded-full bg-card/90 backdrop-blur-sm">
                      <span className="text-xs font-medium text-card">{displayVenue.priceRange}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex-1 overflow-y-auto px-4 pb-4">
                <DialogHeader className="pt-4">
                  <DialogTitle className="text-2xl">{displayVenue.name}</DialogTitle>
                  <p className="text-muted-foreground mt-1">{displayVenue.category || displayVenue.city}</p>
                </DialogHeader>

                {/* Quick Info */}
                <div className="grid grid-cols-2 gap-3 mt-4">
                  <div className="flex items-center gap-2 p-3 rounded-xl bg-muted">
                    <MapPin className="w-4 h-4 text-primary" />
                    <span className="text-sm text-foreground line-clamp-1">{displayVenue.address}</span>
                  </div>
                  {displayVenue.phone && (
                    <div className="flex items-center gap-2 p-3 rounded-xl bg-muted">
                      <Phone className="w-4 h-4 text-primary" />
                      <a href={`tel:${displayVenue.phone}`} className="text-sm text-primary hover:underline line-clamp-1">
                        {displayVenue.phone}
                      </a>
                    </div>
                  )}
                </div>

                {/* Tabs */}
                <Tabs defaultValue="ambiance" className="w-full mt-4">
                  <TabsList className="grid w-full grid-cols-3 bg-muted rounded-xl p-1 h-12">
                    <TabsTrigger value="ambiance" className="rounded-lg">Ambiance</TabsTrigger>
                    <TabsTrigger value="menu" className="rounded-lg">
                      {isRestaurant ? 'Menu' : 'Services'}
                    </TabsTrigger>
                    <TabsTrigger value="safety" className="rounded-lg">Safety</TabsTrigger>
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
                        <h3 className="font-semibold text-foreground mb-4">Menu</h3>
                        <div className="space-y-4">
                          {sampleMenuItems.map((item) => (
                            <div
                              key={item.id}
                              className="border-b border-border pb-4 last:border-0 last:pb-0"
                            >
                              <div className="flex gap-4">
                                <div className="relative w-24 h-24 rounded-xl overflow-hidden flex-shrink-0">
                                  <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                                </div>
                                <div className="flex-1">
                                  <div className="flex items-start justify-between mb-1">
                                    <div>
                                      <h4 className="font-semibold text-foreground">{item.name}</h4>
                                      <p className="text-xs text-muted-foreground">{item.category}</p>
                                    </div>
                                    <span className="text-lg font-bold text-primary">${item.price}</span>
                                  </div>
                                  <p className="text-sm text-muted-foreground mb-2">{item.description}</p>
                                  
                                  {/* Ingredients */}
                                  <div className="flex flex-wrap gap-1 mb-2">
                                    {item.ingredients.map((ingredient, idx) => (
                                      <span
                                        key={idx}
                                        className="px-2 py-0.5 rounded-full bg-muted text-xs text-foreground"
                                      >
                                        {ingredient}
                                      </span>
                                    ))}
                                  </div>

                                  {/* Calories */}
                                  <div className="flex items-center gap-2">
                                    <span className="text-xs text-muted-foreground">Calories:</span>
                                    <span className="text-xs font-medium text-foreground">{item.calories} kcal</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
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

                  <TabsContent value="safety" className="mt-4">
                    <div className="card-elevated p-4 space-y-4">
                      <h3 className="font-semibold text-foreground mb-3">Safety & Health</h3>
                      
                      <div className="space-y-3">
                        <div className="flex items-start gap-3">
                          <Shield className="w-5 h-5 text-primary mt-0.5" />
                          <div>
                            <p className="font-medium text-foreground">Security</p>
                            <p className="text-sm text-muted-foreground">24/7 security staff on premises</p>
                          </div>
                        </div>
                        
                        <div className="flex items-start gap-3">
                          <Shield className="w-5 h-5 text-primary mt-0.5" />
                          <div>
                            <p className="font-medium text-foreground">Health Protocols</p>
                            <p className="text-sm text-muted-foreground">Regular sanitization and health checks</p>
                          </div>
                        </div>
                        
                        <div className="flex items-start gap-3">
                          <Shield className="w-5 h-5 text-primary mt-0.5" />
                          <div>
                            <p className="font-medium text-foreground">Emergency Contacts</p>
                            <p className="text-sm text-muted-foreground">On-site medical assistance available</p>
                          </div>
                        </div>
                        
                        <div className="flex items-start gap-3">
                          <Shield className="w-5 h-5 text-primary mt-0.5" />
                          <div>
                            <p className="font-medium text-foreground">Accessibility</p>
                            <p className="text-sm text-muted-foreground">Wheelchair accessible facilities</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 px-4 pb-4 pt-4 border-t border-border">
                <Button
                  variant="outline"
                  onClick={() => setShowVenueDetail(false)}
                  className="flex-1"
                >
                  Close
                </Button>
                <Button
                  onClick={() => {
                    handleVenueSelect(selectedVenueDetail);
                    setShowVenueDetail(false);
                  }}
                  className="flex-1 bg-gradient-primary"
                >
                  Select Venue
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Activity/Event Recommendation Modal */}
      <Dialog open={showTypeRecommendationModal} onOpenChange={setShowTypeRecommendationModal}>
        <DialogContent className="max-w-md mx-4 rounded-2xl p-0 overflow-hidden">
          <DialogHeader className="p-6 pb-4">
            <div className="text-center mb-4">
              <div className={`w-16 h-16 rounded-full mx-auto flex items-center justify-center mb-3 ${
                recommendedType === 'event' 
                  ? 'bg-primary/20' 
                  : 'bg-secondary/20'
              }`}>
                {recommendedType === 'event' ? (
                  <Ticket className="w-8 h-8 text-primary" />
                ) : (
                  <Users2 className="w-8 h-8 text-secondary" />
                )}
              </div>
            </div>
            <DialogTitle className="text-center text-xl font-bold">
              {recommendedType === 'event' ? 'Event Recommended' : 'Activity Recommended'}
            </DialogTitle>
            <DialogDescription className="text-center">
              {recommendedType === 'event' 
                ? 'Event mode is recommended for this attendance size. Ticket, check-in, and visibility features will be enabled.'
                : 'Activity mode is recommended for this attendance size. A more intimate and flexible gathering.'}
            </DialogDescription>
          </DialogHeader>
          <div className="px-6 pb-6 space-y-4">

            <div className={`p-4 rounded-xl ${
              recommendedType === 'event' 
                ? 'bg-primary/10 border-2 border-primary/20' 
                : 'bg-secondary/10 border-2 border-secondary/20'
            }`}>
              {recommendedType === 'event' ? (
                <div className="space-y-2">
                  <p className="text-sm text-foreground font-medium">
                    Event is more suitable for this attendance size.
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Ticket, check-in, and visibility features will be enabled.
                  </p>
                  <div className="mt-3 space-y-1.5">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <CheckCircle2 className="w-3.5 h-3.5 text-primary" />
                      <span>Ticket management</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <CheckCircle2 className="w-3.5 h-3.5 text-primary" />
                      <span>QR Check-in</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <CheckCircle2 className="w-3.5 h-3.5 text-primary" />
                      <span>Enhanced visibility</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <p className="text-sm text-foreground font-medium">
                    This is an Activity. A more intimate and flexible gathering.
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Ideal for small groups, a more casual experience.
                  </p>
                </div>
              )}
            </div>

            <div className="flex gap-2 pt-2">
              <Button
                variant="outline"
                onClick={() => {
                  setShowTypeRecommendationModal(false);
                  if (recommendedType === 'event') {
                    setEventType('activity'); // User can choose to keep as activity
                  }
                }}
                className="flex-1"
              >
                {recommendedType === 'event' ? 'Keep as Activity' : 'OK'}
              </Button>
              {recommendedType === 'event' && (
                <Button
                  onClick={() => {
                    setEventType('event');
                    setGroupSize('custom');
                    setCustomGroupSize(String(recommendedMaxAttendees || 15));
                    setShowTypeRecommendationModal(false);
                    toast.success('Event mode activated! Ticket and check-in features are now available.');
                  }}
                  className="flex-1 bg-gradient-primary"
                >
                  Use Event Mode
                  <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
};

export default CreateVibePage;
