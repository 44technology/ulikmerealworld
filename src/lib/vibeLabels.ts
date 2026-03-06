/**
 * Activity type labels: "Activity" or "Event" for the specific type.
 * Event label when type === 'event' OR maxAttendees >= 15 (no standalone event creation).
 */
export type VibeType = 'activity' | 'event';

export function getVibeTypeLabel(type?: VibeType | string | null, maxAttendees?: number | null): 'Activity' | 'Event' {
  if (type === 'event') return 'Event';
  if (maxAttendees != null && maxAttendees >= 15) return 'Event';
  return 'Activity';
}

/** Marketing term for the product - use in CTAs and copy */
export const VIBE_MARKETING_TERM = 'activity' as const;
