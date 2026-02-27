import { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Filter, Star, ArrowLeft, MapPin } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import AppLayout from '@/components/layout/AppLayout';
import BottomNav from '@/components/layout/BottomNav';
import VenueCard from '@/components/cards/VenueCard';
import { venues as mockVenues } from '@/data/mockData';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useVenues } from '@/hooks/useVenues';

const VenuesPage = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilterDialog, setShowFilterDialog] = useState(false);
  const [filters, setFilters] = useState({
    distance: '',
    rating: '',
  });

  const radius = filters.distance ? parseFloat(filters.distance) * 1.60934 : undefined;
  const userLat = 25.7617;
  const userLon = -80.1918;

  const { data: venuesData, isLoading: venuesLoading } = useVenues({
    search: searchQuery || undefined,
    latitude: filters.distance ? userLat : undefined,
    longitude: filters.distance ? userLon : undefined,
    radius,
  });

  const venues = venuesData && venuesData.length > 0 ? venuesData : mockVenues;

  return (
    <AppLayout>
      <div className="sticky top-0 z-40 glass safe-top">
        <div className="flex items-center gap-3 px-4 py-3">
          <motion.button onClick={() => navigate('/home')} className="p-2 -ml-2" whileTap={{ scale: 0.9 }}>
            <ArrowLeft className="w-6 h-6 text-foreground" />
          </motion.button>
          <div className="flex-1 min-w-0">
            <h1 className="text-xl font-bold text-foreground mb-1">Venue list</h1>
            <p className="text-sm text-muted-foreground mb-3">Browse places & spaces</p>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search venues..."
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

      <div className="px-4 pb-4 mt-4">
        <div className="grid grid-cols-2 gap-3 items-stretch">
          {venuesLoading ? (
            <div className="text-center py-8 col-span-2">
              <p className="text-muted-foreground">Loading venues...</p>
            </div>
          ) : venues && venues.length > 0 ? (
            venues.map((venue: any) => {
              if (!venue?.id) return null;
              const normalizedVenue = {
                id: venue.id,
                name: venue.name || 'Unknown Venue',
                category: venue.category || venue.amenities?.[0] || 'Venue',
                image: venue.image || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400',
                rating: venue.rating || 4.5,
                reviewCount: venue.reviewCount || venue._count?.meetups || 0,
                distance: venue.distance || `${Math.round(Math.random() * 5 + 0.5)} mi`,
                priceRange: venue.priceRange,
                isOpen: venue.isOpen !== undefined ? venue.isOpen : true,
                hasDeals: venue.hasDeals || false,
              };
              return (
                <Link key={venue.id} to={`/venue/${venue.id}`} className="block min-w-0">
                  <VenueCard {...normalizedVenue} />
                </Link>
              );
            })
          ) : (
            <div className="text-center py-8 col-span-2">
              <p className="text-muted-foreground">No venues found. Try adjusting your filters.</p>
            </div>
          )}
        </div>
      </div>

      <Dialog open={showFilterDialog} onOpenChange={setShowFilterDialog}>
        <DialogContent className="max-w-md mx-4 rounded-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl">Filter Venues</DialogTitle>
            <DialogDescription>Refine your search</DialogDescription>
          </DialogHeader>
          <div className="space-y-6 mt-4">
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
            <Button variant="outline" className="flex-1" onClick={() => setFilters({ distance: '', rating: '' })}>
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

export default VenuesPage;
