/**
 * Venue locations – used when venue has multiple locations.
 * Ads and discounts can be applied to a specific location.
 * In production this would come from API / auth.
 */
export interface VenueLocation {
  id: string;
  name: string;
  address?: string;
}

export const VENUE_LOCATIONS: VenueLocation[] = [
  { id: 'loc-1', name: 'Main Branch', address: '123 Main St' },
  { id: 'loc-2', name: 'Downtown', address: '456 Downtown Ave' },
  { id: 'loc-3', name: 'Airport', address: '789 Airport Blvd' },
];

export function getLocationNameById(id: string): string {
  return VENUE_LOCATIONS.find((l) => l.id === id)?.name ?? id;
}
