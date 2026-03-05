import { useQuery } from '@tanstack/react-query';
import { apiRequest, API_ENDPOINTS } from '@/lib/api';

export interface PlatformSettings {
  ulikmeCommissionPercent: number;
  paidActivitiesEnabled: boolean;
}

/**
 * 4.7: Platform payment settings.
 * - paidActivitiesEnabled: false = all activities/classes/communities are free; true = paid allowed, 5% Ulikme commission.
 * - ulikmeCommissionPercent: e.g. 5 → $50 payment → $2.50 Ulikme, rest to venue/instructor.
 */
export function usePlatformSettings() {
  return useQuery({
    queryKey: ['platformSettings'],
    queryFn: async (): Promise<PlatformSettings> => {
      const res = await apiRequest<{ success: boolean; data: PlatformSettings }>(
        API_ENDPOINTS.SETTINGS.PLATFORM
      );
      return res.data;
    },
  });
}
