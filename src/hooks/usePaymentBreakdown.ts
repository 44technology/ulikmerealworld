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
  const enabled = Boolean(opts && opts.grossAmount > 0 && (opts.classId || opts.meetupId));
  return useQuery({
    queryKey: ['paymentBreakdown', opts === null ? 'off' : opts.classId, opts === null ? 'off' : opts.meetupId, opts === null ? 0 : opts.grossAmount],
    queryFn: async (): Promise<PaymentBreakdown> => {
      const o = opts!;
      const params = new URLSearchParams();
      params.set('grossAmount', String(o.grossAmount));
      if (o.classId) params.set('classId', o.classId);
      if (o.meetupId) params.set('meetupId', o.meetupId);
      const url = `${API_ENDPOINTS.PAYMENTS.BREAKDOWN}?${params.toString()}`;
      const res = await apiRequest<{ success: boolean; data: PaymentBreakdown }>(url);
      return res.data;
    },
    enabled,
  });
}
