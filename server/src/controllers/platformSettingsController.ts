import { Response, NextFunction } from 'express';
import prisma from '../config/database.js';
import { AppError } from '../middleware/errorHandler.js';
import { AuthRequest } from '../middleware/auth.js';
import {
  ULIKME_COMMISSION_PERCENT_KEY,
  PAID_ACTIVITIES_ENABLED_KEY,
  ULIKME_COMMISSION_PERCENT_DEFAULT,
  getPaymentSettings,
} from '../services/paymentService.js';

/**
 * GET /api/settings/platform
 * Returns platform-wide settings: Ulikme commission %, paid activities enabled (4.7).
 * Initially paidActivitiesEnabled is false (everything free); when true, 5% commission applies.
 */
export const getPlatformSettings = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const settings = await getPaymentSettings(prisma);
    res.json({
      success: true,
      data: {
        ulikmeCommissionPercent: settings.ulikmeCommissionPercent,
        paidActivitiesEnabled: settings.paidActivitiesEnabled,
      },
    });
  } catch (error) {
    next(error);
  }
};

type UpdateBody = {
  ulikmeCommissionPercent?: number;
  paidActivitiesEnabled?: boolean;
};

/**
 * PATCH /api/settings/platform
 * Update platform settings (admin).
 * - ulikmeCommissionPercent: 0–100 (default 5)
 * - paidActivitiesEnabled: when false, all activities/classes/communities are free; when true, paid + 5% commission
 */
export const updatePlatformSettings = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const body = req.body as UpdateBody;
    const updates: { ulikmeCommissionPercent?: number; paidActivitiesEnabled?: boolean } = {};

    if (body.ulikmeCommissionPercent != null) {
      if (typeof body.ulikmeCommissionPercent !== 'number') {
        throw new AppError('ulikmeCommissionPercent must be a number', 400);
      }
      if (body.ulikmeCommissionPercent < 0 || body.ulikmeCommissionPercent > 100) {
        throw new AppError('ulikmeCommissionPercent must be between 0 and 100', 400);
      }
      await prisma.platformSetting.upsert({
        where: { key: ULIKME_COMMISSION_PERCENT_KEY },
        create: { key: ULIKME_COMMISSION_PERCENT_KEY, value: String(body.ulikmeCommissionPercent) },
        update: { value: String(body.ulikmeCommissionPercent) },
      });
      updates.ulikmeCommissionPercent = body.ulikmeCommissionPercent;
    }

    if (body.paidActivitiesEnabled !== undefined) {
      const value = body.paidActivitiesEnabled === true ? 'true' : 'false';
      await prisma.platformSetting.upsert({
        where: { key: PAID_ACTIVITIES_ENABLED_KEY },
        create: { key: PAID_ACTIVITIES_ENABLED_KEY, value },
        update: { value },
      });
      updates.paidActivitiesEnabled = body.paidActivitiesEnabled;
    }

    const settings = await getPaymentSettings(prisma);
    res.json({
      success: true,
      data: {
        ulikmeCommissionPercent: updates.ulikmeCommissionPercent ?? settings.ulikmeCommissionPercent,
        paidActivitiesEnabled: updates.paidActivitiesEnabled ?? settings.paidActivitiesEnabled,
      },
    });
  } catch (error) {
    next(error);
  }
};
