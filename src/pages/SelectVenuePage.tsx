import { useState, useEffect, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, MapPin, Search, Navigation } from 'lucide-react';
import AppLayout from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useVenues } from '@/hooks/useVenues';
import type { Venue } from '@/hooks/useVenues';

const DEFAULT_LAT = 25.7617;
const DEFAULT_LON = -80.1918;

function haversineKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
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

const RADIUS_OPTIONS_KM = [5, 10, 25, 50];

export default function SelectVenuePage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const returnTo = searchParams.get('returnTo') || 'create-vibe';

  const [userLat, setUserLat] = useState<number | null>(null);
  const [userLon, setUserLon] = useState<number | null>(null);
  const [radiusKm, setRadiusKm] = useState(25);
  const [search, setSearch] = useState('');

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
    latitude: lat,
    longitude: lon,
    radius: radiusKm,
    search: search.trim() || undefined,
  });

  const venuesWithDistance = useMemo(() => {
    const list = Array.isArray(venuesData) ? venuesData : [];
    return list
      .map((v: Venue) => ({
        ...v,
        distanceKm: haversineKm(lat, lon, v.latitude ?? lat, v.longitude ?? lon),
      }))
      .sort((a, b) => a.distanceKm - b.distanceKm);
  }, [venuesData, lat, lon]);

  const handleSelect = (venue: Venue & { distanceKm?: number }) => {
    const payload = {
      id: venue.id,
      name: venue.name,
      address: [venue.address, venue.city, venue.state, venue.country].filter(Boolean).join(', '),
      city: venue.city,
      addressOnly: venue.address,
    };
    if (returnTo === 'create-class') {
      navigate('/create-class', { state: { selectedVenue: payload } });
    } else {
      navigate('/create', { state: { selectedVenue: payload } });
    }
  };

  return (
    <AppLayout hideNav>
      <div className="min-h-screen flex flex-col bg-background">
        <div className="sticky top-0 z-40 glass safe-top border-b border-border">
          <div className="flex items-center justify-between gap-3 px-4 py-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate(-1)}
              className="-ml-2"
            >
              <ArrowLeft className="w-6 h-6" />
            </Button>
            <h1 className="font-bold text-foreground">Select Venue</h1>
            <div className="w-10" />
          </div>
          <div className="px-4 pb-3 space-y-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                placeholder="Search venues..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 h-12 rounded-xl"
              />
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm text-muted-foreground flex items-center gap-1">
                <Navigation className="w-4 h-4" />
                Distance:
              </span>
              {RADIUS_OPTIONS_KM.map((km) => (
                <Button
                  key={km}
                  variant={radiusKm === km ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setRadiusKm(km)}
                >
                  {km} km
                </Button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex-1 px-4 py-4 overflow-y-auto">
          {isLoading ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">Loading venues near you...</p>
            </div>
          ) : venuesWithDistance.length === 0 ? (
            <div className="text-center py-12">
              <MapPin className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
              <p className="text-foreground font-medium">No venues in this range</p>
              <p className="text-sm text-muted-foreground mt-1">
                Try a larger distance or different search
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {venuesWithDistance.map((venue: Venue & { distanceKm?: number }) => (
                <div
                  key={venue.id}
                  className="p-4 rounded-xl border border-border bg-card flex items-start gap-3"
                >
                  <div className="w-14 h-14 rounded-lg bg-muted overflow-hidden flex-shrink-0">
                    {venue.image ? (
                      <img
                        src={venue.image}
                        alt={venue.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <MapPin className="w-6 h-6 text-muted-foreground" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-foreground truncate">{venue.name}</p>
                    <p className="text-sm text-muted-foreground truncate">
                      {venue.address}
                      {venue.city ? `, ${venue.city}` : ''}
                    </p>
                    {venue.distanceKm != null && (
                      <p className="text-xs text-muted-foreground mt-1">
                        {venue.distanceKm < 1
                          ? `${Math.round(venue.distanceKm * 1000)} m away`
                          : `${venue.distanceKm.toFixed(1)} km away`}
                      </p>
                    )}
                  </div>
                  <Button
                    size="sm"
                    onClick={() => handleSelect(venue)}
                    className="shrink-0"
                  >
                    Select
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
