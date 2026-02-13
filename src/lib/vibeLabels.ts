/**
 * Vibe type labels: use "Activity" or "Event" for the specific type.
 * For marketing, the main term is always "vibe" (e.g. "Join vibe", "Create Vibe").
 */
export type VibeType = 'activity' | 'event';

export function getVibeTypeLabel(type?: VibeType | string | null): 'Activity' | 'Event' {
  return type === 'event' ? 'Event' : 'Activity';
}

/** Marketing term for the product - use in CTAs and copy */
export const VIBE_MARKETING_TERM = 'vibe' as const;
