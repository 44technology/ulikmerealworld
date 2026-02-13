import { useQuery } from '@tanstack/react-query';
import { apiRequest, API_ENDPOINTS } from '@/lib/api';

export interface PaymentBreakdown {
  grossAmount: number;
  venueRent: number;
  venueRentLabel: string;
  ulikmeCommissionPercent: number;
  ulikmeCommission: number;
  stripeFee: number;
  payoutAmount: number;
}

export function usePaymentBreakdown(opts: { classId?: string; meetupId?: string; grossAmount: number } | null) {
  return useQuery({
    queryKey: ['paymentBreakdown', opts?.classId, opts?.meetupId, opts?.grossAmount],
    queryFn: async (): Promise<PaymentBreakdown> => {
      const params = new URLSearchParams();
      if (opts!.grossAmount > 0) params.set('grossAmount', String(opts!.grossAmount));
      if (opts!.classId) params.set('classId', opts!.classId);
      if (opts!.meetupId) params.set('meetupId', opts!.meetupId);
      const url = `${API_ENDPOINTS.PAYMENTS.BREAKDOWN}?${params.toString()}`;
      const res = await apiRequest<{ success: boolean; data: PaymentBreakdown }>(url);
      return res.data;
    },
    enabled: !!opts && opts.grossAmount > 0 && (!!opts.classId || !!opts.meetupId),
  });
}
