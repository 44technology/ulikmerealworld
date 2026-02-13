import { Response, NextFunction } from 'express';
import prisma from '../config/database.js';
import { AppError } from '../middleware/errorHandler.js';
import { AuthRequest } from '../middleware/auth.js';

const COMMISSION_KEY = 'ulikme_commission_percent';

/**
 * GET /api/settings/platform
 * Returns platform-wide settings (e.g. Ulikme commission %). Used by app and admin.
 */
export const getPlatformSettings = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const setting = await prisma.platformSetting.findUnique({
      where: { key: COMMISSION_KEY },
    });
    const ulikmeCommissionPercent = setting ? Number(setting.value) : 4;
    res.json({
      success: true,
      data: { ulikmeCommissionPercent },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * PATCH /api/settings/platform
 * Update platform settings (admin). E.g. { ulikmeCommissionPercent: 4 }
 */
export const updatePlatformSettings = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { ulikmeCommissionPercent } = req.body as { ulikmeCommissionPercent?: number };
    if (ulikmeCommissionPercent == null || typeof ulikmeCommissionPercent !== 'number') {
      throw new AppError('ulikmeCommissionPercent (number) is required', 400);
    }
    if (ulikmeCommissionPercent < 0 || ulikmeCommissionPercent > 100) {
      throw new AppError('ulikmeCommissionPercent must be between 0 and 100', 400);
    }
    const value = String(ulikmeCommissionPercent);
    await prisma.platformSetting.upsert({
      where: { key: COMMISSION_KEY },
      create: { key: COMMISSION_KEY, value },
      update: { value },
    });
    res.json({
      success: true,
      data: { ulikmeCommissionPercent: Number(value) },
    });
  } catch (error) {
    next(error);
  }
};
