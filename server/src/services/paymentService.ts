/**
 * Payment Service
 * Handles payment processing, commission calculations, and payouts.
 * Revenue split: Venue rent (per 30 min, for now $0), Ulikme commission %, Stripe fee.
 */

import type { PrismaClient } from '@prisma/client';

const STRIPE_FEE_PERCENTAGE = 0.03; // 3% Stripe processing fee
const COMMISSION_KEY = 'ulikme_commission_percent';

export interface PaymentCalculation {
  grossAmount: number;
  stripeFee: number;
  netAmount: number;
  platformFee: number;   // Ulikme commission amount
  payoutAmount: number;
}

export interface PaymentBreakdownDisplay {
  grossAmount: number;
  venueRent: number;           // For now always 0
  venueRentLabel: string;       // e.g. '$0 per 30 min'
  ulikmeCommissionPercent: number;
  ulikmeCommission: number;
  stripeFee: number;
  payoutAmount: number;
}

/**
 * Get payment breakdown for display and creation.
 * Venue rent is $0 for now (half-hour rent).
 */
export async function getPaymentBreakdown(
  prisma: PrismaClient,
  opts: { grossAmount: number; classId?: string; meetupId?: string }
): Promise<PaymentBreakdownDisplay & PaymentCalculation> {
  const { grossAmount } = opts;
  const roundedGross = Math.round(grossAmount * 100) / 100;

  // Venue rent: for now always $0 per 30 min
  const venueRent = 0;
  const venueRentLabel = '$0 per 30 min';

  // Ulikme commission % from platform settings (default 4)
  let ulikmeCommissionPercent = 4;
  try {
    const setting = await prisma.platformSetting.findUnique({
      where: { key: COMMISSION_KEY },
    });
    if (setting?.value) ulikmeCommissionPercent = Number(setting.value) || 4;
  } catch {
    // keep default
  }
  const ulikmeCommission = Math.round((roundedGross * (ulikmeCommissionPercent / 100)) * 100) / 100;

  const stripeFee = Math.round(roundedGross * STRIPE_FEE_PERCENTAGE * 100) / 100;
  const netAmount = Math.round((roundedGross - stripeFee) * 100) / 100;
  const payoutAmount = Math.round((roundedGross - stripeFee - ulikmeCommission - venueRent) * 100) / 100;

  return {
    grossAmount: roundedGross,
    venueRent,
    venueRentLabel,
    ulikmeCommissionPercent,
    ulikmeCommission,
    stripeFee,
    netAmount,
    platformFee: ulikmeCommission,
    payoutAmount,
  };
}

/**
 * Calculate payment breakdown (sync fallback using default commission %).
 * Prefer getPaymentBreakdown when you have prisma for platform settings.
 */
export function calculatePaymentBreakdown(grossAmount: number): PaymentCalculation {
  const stripeFee = Math.round(grossAmount * STRIPE_FEE_PERCENTAGE * 100) / 100;
  const netAmount = Math.round((grossAmount - stripeFee) * 100) / 100;
  const ulikmeCommissionPercent = 4;
  const platformFee = Math.round(grossAmount * (ulikmeCommissionPercent / 100) * 100) / 100;
  const venueRent = 0;
  const payoutAmount = Math.round((grossAmount - stripeFee - platformFee - venueRent) * 100) / 100;
  return {
    grossAmount: Math.round(grossAmount * 100) / 100,
    stripeFee,
    netAmount,
    platformFee,
    payoutAmount,
  };
}

/**
 * Generate payment number
 */
export function generatePaymentNumber(): string {
  const year = new Date().getFullYear();
  const random = Math.floor(Math.random() * 1000000).toString().padStart(6, '0');
  return `PAY-${year}-${random}`;
}

/**
 * Generate payout number
 */
export function generatePayoutNumber(): string {
  const year = new Date().getFullYear();
  const random = Math.floor(Math.random() * 1000000).toString().padStart(6, '0');
  return `PO-${year}-${random}`;
}

/**
 * Format amount for display
 */
export function formatAmount(amount: number, currency: string = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(amount);
}

/**
 * Example usage:
 * 
 * const breakdown = calculatePaymentBreakdown(100);
 * console.log(breakdown);
 * // {
 * //   grossAmount: 100,
 * //   stripeFee: 3,
 * //   netAmount: 97,
 * //   platformFee: 2.91,
 * //   payoutAmount: 94.09
 * // }
 */
