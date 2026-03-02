import { useState, useMemo, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, ArrowLeft, MapPin, ChevronDown, ExternalLink, X } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import AppLayout from '@/components/layout/AppLayout';
import BottomNav from '@/components/layout/BottomNav';
import { venues as mockVenues } from '@/data/mockData';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useVenues } from '@/hooks/useVenues';

const DEFAULT_LAT = 25.7617;
const DEFAULT_LON = -80.1918;

function haversineKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

type SortBy = 'distance' | 'rating' | 'name';

const RADIUS_OPTIONS_KM = [5, 10, 25, 50];

export default function VenuesPage() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortBy>('distance');
  const [radiusKm, setRadiusKm] = useState<number>(5);
  const [ratingMin, setRatingMin] = useState<number | null>(4);
  const [veganOnly, setVeganOnly] = useState(false);
  const [userLat, setUserLat] = useState<number | null>(null);
  const [userLon, setUserLon] = useState<number | null>(null);

  useEffect(() => {
    if (!navigator.geolocation) {
      setUserLat(DEFAULT_LAT);
      setUserLon(DEFAULT_LON);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserLat(pos.coords.latitude);
        setUserLon(pos.coords.longitude);
      },
      () => {
        setUserLat(DEFAULT_LAT);
        setUserLon(DEFAULT_LON);
      }
    );
  }, []);

  const lat = userLat ?? DEFAULT_LAT;
  const lon = userLon ?? DEFAULT_LON;

  const { data: venuesData = [], isLoading } = useVenues({
    search: searchQuery.trim() || undefined,
    latitude: lat,
    longitude: lon,
    radius: radiusKm,
  });

  const venuesNormalized = useMemo(() => {
    const fromApi = Array.isArray(venuesData) ? venuesData : [];
    const list = fromApi.length > 0 ? fromApi : mockVenues;
    return list.map((v: any) => {
      const apiVenue = 'latitude' in v && v.latitude != null;
      const distanceKm = apiVenue && v.latitude != null && v.longitude != null
        ? haversineKm(lat, lon, v.latitude, v.longitude)
        : null;
      const distanceDisplay = distanceKm != null
        ? distanceKm < 1
          ? `${Math.round(distanceKm * 1000)} m away`
          : `${distanceKm.toFixed(1)} km away`
        : v.distance || '—';
      const fullAddress = apiVenue && v.address
        ? [v.address, v.city, v.state, v.country].filter(Boolean).join(', ')
        : v.address || `${v.city || ''} ${v.state || ''}`.trim() || 'Address TBD';
      return {
        id: v.id,
        name: v.name || 'Unknown Venue',
        address: fullAddress,
        image: v.image || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400',
        rating: v.rating ?? 4.5,
        distanceKm: distanceKm ?? 0,
        distanceDisplay,
        amenities: (v.amenities || []) as string[],
      };
    });
  }, [venuesData, lat, lon]);

  const filteredAndSorted = useMemo(() => {
    let list = venuesNormalized.filter((v) => {
      const matchesSearch =
        !searchQuery.trim() ||
        v.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (v.address || '').toLowerCase().includes(searchQuery.toLowerCase());
      const matchesRadius = radiusKm === 0 || v.distanceKm <= radiusKm;
      const matchesRating = ratingMin == null || v.rating >= ratingMin;
      const matchesVegan = !veganOnly || (v.amenities || []).some(
        (a: string) => a.toLowerCase().includes('vegan')
      );
      return matchesSearch && matchesRadius && matchesRating && matchesVegan;
    });
    if (sortBy === 'distance') list.sort((a, b) => a.distanceKm - b.distanceKm);
    if (sortBy === 'rating') list.sort((a, b) => b.rating - a.rating);
    if (sortBy === 'name') list.sort((a, b) => a.name.localeCompare(b.name));
    return list;
  }, [venuesNormalized, searchQuery, radiusKm, ratingMin, veganOnly, sortBy]);

  return (
    <AppLayout>
      <div className="min-h-screen flex flex-col bg-background pb-20">
        {/* Header - like image: title + close */}
        <div className="sticky top-0 z-40 bg-background border-b border-border/50 safe-top">
          <div className="flex items-center justify-between gap-3 px-4 py-3">
            <motion.button
              onClick={() => navigate('/home')}
              className="p-2 -ml-2 rounded-full hover:bg-muted/50"
              whileTap={{ scale: 0.9 }}
            >
              <ArrowLeft className="w-5 h-5 text-foreground" />
            </motion.button>
            <h1 className="text-lg font-bold text-foreground flex-1 text-center">Venue list</h1>
            <motion.button
              onClick={() => navigate('/home')}
              className="p-2 rounded-full hover:bg-muted/50 w-10 h-10 flex items-center justify-center"
              whileTap={{ scale: 0.9 }}
              aria-label="Close"
            >
              <X className="w-5 h-5 text-foreground" />
            </motion.button>
          </div>

          {/* Search */}
          <div className="px-4 pb-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-11 pl-10 pr-4 rounded-xl bg-muted border border-border/50 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
          </div>

          {/* Filter chips - Sort By, Within 5km, Rating 4+, Vegan */}
          <div className="px-4 pb-3 flex items-center gap-2 overflow-x-auto hide-scrollbar">
            <Select value={sortBy} onValueChange={(v) => setSortBy(v as SortBy)}>
              <SelectTrigger className="w-[120px] h-9 rounded-full border border-border bg-background text-sm font-medium">
                <SelectValue />
                <ChevronDown className="w-4 h-4 opacity-50 ml-1" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="distance">Distance</SelectItem>
                <SelectItem value="rating">Rating</SelectItem>
                <SelectItem value="name">Name</SelectItem>
              </SelectContent>
            </Select>
            {RADIUS_OPTIONS_KM.map((km) => (
              <motion.button
                key={km}
                onClick={() => setRadiusKm(km)}
                className={`shrink-0 h-9 px-4 rounded-full text-sm font-medium transition-colors ${
                  radiusKm === km ? 'bg-primary text-primary-foreground' : 'bg-muted text-foreground'
                }`}
                whileTap={{ scale: 0.96 }}
              >
                Within {km}km
              </motion.button>
            ))}
            <motion.button
              onClick={() => setRatingMin(ratingMin === 4 ? null : 4)}
              className={`shrink-0 h-9 px-4 rounded-full text-sm font-medium transition-colors ${
                ratingMin === 4 ? 'bg-primary text-primary-foreground' : 'bg-muted text-foreground'
              }`}
              whileTap={{ scale: 0.96 }}
            >
              Rating 4+
            </motion.button>
            <motion.button
              onClick={() => setVeganOnly(!veganOnly)}
              className={`shrink-0 h-9 px-4 rounded-full text-sm font-medium transition-colors ${
                veganOnly ? 'bg-primary text-primary-foreground' : 'bg-muted text-foreground'
              }`}
              whileTap={{ scale: 0.96 }}
            >
              Vegan
            </motion.button>
          </div>
        </div>

        {/* Venue list - cards like image */}
        <div className="flex-1 px-4 py-3 overflow-y-auto">
          {isLoading ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">Loading venues...</p>
            </div>
          ) : filteredAndSorted.length === 0 ? (
            <div className="text-center py-12">
              <MapPin className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
              <p className="font-medium text-foreground">No venues found</p>
              <p className="text-sm text-muted-foreground mt-1">
                Try adjusting search or filters
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredAndSorted.map((venue) => (
                <motion.div
                  key={venue.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center gap-3 p-3 rounded-2xl border border-border bg-card"
                >
                  <div className="w-20 h-20 rounded-xl overflow-hidden flex-shrink-0 bg-muted">
                    <img
                      src={venue.image}
                      alt={venue.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-foreground truncate">{venue.name}</p>
                    <p className="text-sm text-muted-foreground line-clamp-2 mt-0.5">
                      {venue.address}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
                      {venue.distanceDisplay}
                    </p>
                  </div>
                  <Link
                    to={`/venue/${venue.id}`}
                    className="shrink-0 flex items-center gap-1.5 h-9 px-4 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
                  >
                    Details
                    <ExternalLink className="w-4 h-4" />
                  </Link>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>

      <BottomNav />
    </AppLayout>
  );
}
