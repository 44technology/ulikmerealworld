/**
 * Payment Service (4.7)
 * Handles payment processing and payouts.
 * - Ulikme takes 5% commission on paid class/activity/community activities.
 * - Initially paid_activities_enabled is false (everything free); when enabled, commission applies.
 * - Example: $50 payment → $2.50 Ulikme, remainder to venue/instructor after Stripe fee.
 */

import type { PrismaClient } from '@prisma/client';

const STRIPE_FEE_PERCENTAGE = 0.029; // Stripe ~2.9%
const STRIPE_FEE_FIXED_CENTS = 30;   // Stripe $0.30 per transaction

export const ULIKME_COMMISSION_PERCENT_DEFAULT = 5;
export const PAID_ACTIVITIES_ENABLED_KEY = 'paid_activities_enabled';
export const ULIKME_COMMISSION_PERCENT_KEY = 'ulikme_commission_percent';

export interface PaymentSettings {
  ulikmeCommissionPercent: number;
  paidActivitiesEnabled: boolean;
}

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
 * Get platform payment settings from DB (commission %, paid mode on/off).
 */
export async function getPaymentSettings(prisma: PrismaClient): Promise<PaymentSettings> {
  const [commissionSetting, paidSetting] = await Promise.all([
    prisma.platformSetting.findUnique({ where: { key: ULIKME_COMMISSION_PERCENT_KEY } }),
    prisma.platformSetting.findUnique({ where: { key: PAID_ACTIVITIES_ENABLED_KEY } }),
  ]);
  const ulikmeCommissionPercent = commissionSetting
    ? Number(commissionSetting.value)
    : ULIKME_COMMISSION_PERCENT_DEFAULT;
  const paidActivitiesEnabled =
    paidSetting?.value === 'true' || paidSetting?.value === '1';
  return { ulikmeCommissionPercent, paidActivitiesEnabled };
}

/**
 * Get payment breakdown for display and creation.
 * Ulikme commission: configurable % (default 5%) of gross. Rest goes to venue/instructor after Stripe.
 */
export async function getPaymentBreakdown(
  prisma: PrismaClient,
  opts: { grossAmount: number; classId?: string; meetupId?: string }
): Promise<PaymentBreakdownDisplay & PaymentCalculation> {
  const { grossAmount } = opts;
  const roundedGross = Math.round(grossAmount * 100) / 100;

  const { ulikmeCommissionPercent } = await getPaymentSettings(prisma);

  // Venue rent: for now always $0 per 30 min
  const venueRent = 0;
  const venueRentLabel = '$0 per 30 min';

  // Ulikme commission: e.g. 5% of gross → $50 → $2.50
  const ulikmeCommission = Math.round(
    (roundedGross * (ulikmeCommissionPercent / 100)) * 100
  ) / 100;

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
 * Calculate payment breakdown (sync fallback). Uses default 5% Ulikme commission.
 */
export function calculatePaymentBreakdown(grossAmount: number): PaymentCalculation {
  const roundedGross = Math.round(grossAmount * 100) / 100;
  const stripeFee = Math.round((roundedGross * STRIPE_FEE_PERCENTAGE + STRIPE_FEE_FIXED_CENTS / 100) * 100) / 100;
  const netAmount = Math.round((roundedGross - stripeFee) * 100) / 100;
  const platformFee = Math.round(
    (roundedGross * (ULIKME_COMMISSION_PERCENT_DEFAULT / 100)) * 100
  ) / 100;
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
 * Example (5% commission):
 * calculatePaymentBreakdown(50) →
 *   grossAmount: 50, platformFee: 2.50 (5%), payoutAmount: ~46.05 (after Stripe)
 */
