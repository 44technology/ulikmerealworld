/**
 * Payment Service
 * Handles payment processing and payouts.
 * No Ulikme commission: payment goes directly to instructor/host. Only Stripe fee (and optional venue rent) is deducted.
 */

import type { PrismaClient } from '@prisma/client';

const STRIPE_FEE_PERCENTAGE = 0.029; // Stripe ~2.9%
const STRIPE_FEE_FIXED_CENTS = 30;   // Stripe $0.30 per transaction

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
 * No Ulikme commission: full amount goes to instructor/host after Stripe fee (and optional venue rent).
 */
export async function getPaymentBreakdown(
  _prisma: PrismaClient,
  opts: { grossAmount: number; classId?: string; meetupId?: string }
): Promise<PaymentBreakdownDisplay & PaymentCalculation> {
  const { grossAmount } = opts;
  const roundedGross = Math.round(grossAmount * 100) / 100;

  // Venue rent: for now always $0 per 30 min
  const venueRent = 0;
  const venueRentLabel = '$0 per 30 min';

  // No Ulikme commission — payment goes directly to instructor/host
  const ulikmeCommissionPercent = 0;
  const ulikmeCommission = 0;

  const stripeFee = Math.round((roundedGross * STRIPE_FEE_PERCENTAGE + STRIPE_FEE_FIXED_CENTS / 100) * 100) / 100;
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
 * Calculate payment breakdown (sync fallback). No Ulikme commission.
 */
export function calculatePaymentBreakdown(grossAmount: number): PaymentCalculation {
  const roundedGross = Math.round(grossAmount * 100) / 100;
  const stripeFee = Math.round((roundedGross * STRIPE_FEE_PERCENTAGE + STRIPE_FEE_FIXED_CENTS / 100) * 100) / 100;
  const netAmount = Math.round((roundedGross - stripeFee) * 100) / 100;
  const platformFee = 0; // No Ulikme commission
  const venueRent = 0;
  const payoutAmount = Math.round((roundedGross - stripeFee - platformFee - venueRent) * 100) / 100;
  return {
    grossAmount: roundedGross,
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
