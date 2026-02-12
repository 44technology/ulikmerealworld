/**
 * Parse venue business hours string and check if a date/time falls within open hours.
 * Format: "Mon: 09:00-18:00; Tue: 09:00-18:00; Wed: Closed; ..."
 * getDay(): 0=Sun, 1=Mon, 2=Tue, 3=Wed, 4=Thu, 5=Fri, 6=Sat
 */

const DAY_NAMES: Record<number, string> = {
  0: 'Sun',
  1: 'Mon',
  2: 'Tue',
  3: 'Wed',
  4: 'Thu',
  5: 'Fri',
  6: 'Sat',
};

const DAY_ORDER = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export type ParsedHours = Record<number, { open: string; close: string } | null>;

export function parseBusinessHours(businessHours: string): ParsedHours | null {
  if (!businessHours?.trim()) return null;
  const result: ParsedHours = { 0: null, 1: null, 2: null, 3: null, 4: null, 5: null, 6: null };
  const parts = businessHours.split(';').map((p) => p.trim()).filter(Boolean);
  for (const part of parts) {
    const match = part.match(/^(\w{3})\s*:\s*(.+)$/i);
    if (!match) continue;
    const dayLabel = match[1].charAt(0).toUpperCase() + match[1].slice(1, 3).toLowerCase();
    const value = match[2].trim();
    const dayIndex = DAY_ORDER.indexOf(dayLabel);
    if (dayIndex === -1) continue;
    if (value.toLowerCase() === 'closed') {
      result[dayIndex as keyof ParsedHours] = null;
      continue;
    }
    const timeMatch = value.match(/^(\d{1,2}:\d{2})\s*-\s*(\d{1,2}:\d{2})$/);
    if (timeMatch) {
      const open = timeMatch[1].length === 4 ? '0' + timeMatch[1] : timeMatch[1];
      const close = timeMatch[2].length === 4 ? '0' + timeMatch[2] : timeMatch[2];
      result[dayIndex as keyof ParsedHours] = { open, close };
    }
  }
  return result;
}

function timeToMinutes(t: string): number {
  const [h, m] = t.split(':').map(Number);
  return (h ?? 0) * 60 + (m ?? 0);
}

export function checkVenueHours(
  businessHours: string | undefined,
  startDate: Date,
  endDate?: Date
): { valid: boolean; message?: string } {
  if (!businessHours?.trim()) return { valid: true };

  const parsed = parseBusinessHours(businessHours);
  if (!parsed) return { valid: true };

  const day = startDate.getDay();
  const hours = parsed[day as keyof ParsedHours];
  if (hours === null) {
    return {
      valid: false,
      message: `Venue is closed on ${DAY_NAMES[day]}. Please choose another day.`,
    };
  }

  const startMinutes = startDate.getHours() * 60 + startDate.getMinutes();
  const openMinutes = timeToMinutes(hours.open);
  const closeMinutes = timeToMinutes(hours.close);

  if (startMinutes < openMinutes) {
    return {
      valid: false,
      message: `Venue opens at ${hours.open} on ${DAY_NAMES[day]}. Please choose a time after opening.`,
    };
  }

  if (endDate) {
    const endMinutes = endDate.getHours() * 60 + endDate.getMinutes();
    if (endMinutes > closeMinutes) {
      return {
        valid: false,
        message: `Venue closes at ${hours.close} on ${DAY_NAMES[day]}. Please end before closing.`,
      };
    }
  } else {
    if (startMinutes >= closeMinutes) {
      return {
        valid: false,
        message: `Venue closes at ${hours.close} on ${DAY_NAMES[day]}. Please choose a time before closing.`,
      };
    }
  }

  return { valid: true };
}
