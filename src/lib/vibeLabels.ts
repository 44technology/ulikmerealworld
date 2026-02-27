/**
 * Activity type labels: "Activity" or "Event" for the specific type.
 */
export type VibeType = 'activity' | 'event';

export function getVibeTypeLabel(type?: VibeType | string | null): 'Activity' | 'Event' {
  return type === 'event' ? 'Event' : 'Activity';
}

/** Marketing term for the product - use in CTAs and copy */
export const VIBE_MARKETING_TERM = 'activity' as const;
