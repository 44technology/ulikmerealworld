const STORAGE_KEY = 'ulikme_favourite_venue_ids';

export function getFavouriteVenueIds(): string[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function setFavouriteVenueIds(ids: string[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
}

export function isFavouriteVenue(venueId: string): boolean {
  return getFavouriteVenueIds().includes(venueId);
}

export function toggleFavouriteVenue(venueId: string): boolean {
  const ids = getFavouriteVenueIds();
  const has = ids.includes(venueId);
  if (has) {
    setFavouriteVenueIds(ids.filter((id) => id !== venueId));
    return false;
  }
  setFavouriteVenueIds([...ids, venueId]);
  return true;
}
