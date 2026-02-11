import { Request, Response, NextFunction } from 'express';
import prisma from '../config/database.js';
import { AppError } from '../middleware/errorHandler.js';
import { AuthRequest } from '../middleware/auth.js';
import crypto from 'crypto';

/**
 * Scan and validate QR code for check-in
 * POST /api/tickets/scan
 */
export const scanQRCode = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const scannerId = req.userId;
    if (!scannerId) {
      throw new AppError('Unauthorized', 401);
    }

    const { qrCodeData } = req.body;

    if (!qrCodeData) {
      throw new AppError('QR code data is required', 400);
    }

    // Parse QR code data
    let parsedData;
    try {
      parsedData = JSON.parse(qrCodeData);
    } catch (error) {
      throw new AppError('Invalid QR code format', 400);
    }

    // Validate hash
    const secret = process.env.QR_CODE_SECRET || 'default-secret-key-change-in-production';
    const dataString = JSON.stringify({
      enrollmentId: parsedData.enrollmentId,
      meetupMemberId: parsedData.meetupMemberId,
      classId: parsedData.classId,
      meetupId: parsedData.meetupId,
      userId: parsedData.userId,
      timestamp: parsedData.timestamp,
    });
    const expectedHash = crypto
      .createHmac('sha256', secret)
      .update(dataString)
      .digest('hex');

    if (parsedData.hash !== expectedHash) {
      throw new AppError('Invalid QR code', 400);
    }

    // Find ticket by QR code
    const ticket = await prisma.ticket.findUnique({
      where: { qrCode: qrCodeData },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            displayName: true,
            avatar: true,
          },
        },
        class: {
          include: {
            instructor: {
              select: {
                id: true,
                displayName: true,
              },
            },
            venue: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
        meetup: {
          include: {
            host: {
              select: {
                id: true,
                displayName: true,
              },
            },
            venue: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });

    if (!ticket) {
      throw new AppError('Ticket not found', 404);
    }

    // Check if ticket is already used
    if (ticket.status === 'USED') {
      return res.status(400).json({
        success: false,
        error: 'Ticket already used',
        checkedInAt: ticket.usedAt,
      });
    }

    // Check if ticket is expired
    if (ticket.expiresAt && new Date() > ticket.expiresAt) {
      return res.status(400).json({
        success: false,
        error: 'Ticket expired',
      });
    }

    // Check if ticket is cancelled
    if (ticket.status === 'CANCELLED') {
      return res.status(400).json({
        success: false,
        error: 'Ticket cancelled',
      });
    }

    // Verify scanner has permission (is instructor/venue for this class/meetup)
    let hasPermission = false;
    
    if (ticket.classId && ticket.class) {
      // For classes: scanner must be instructor or venue
      hasPermission =
        ticket.class.instructor?.id === scannerId ||
        ticket.class.venue?.id === scannerId;
    } else if (ticket.meetupId && ticket.meetup) {
      // For meetups: scanner must be host or venue
      hasPermission =
        ticket.meetup.host?.id === scannerId ||
        ticket.meetup.venue?.id === scannerId;
    }

    if (!hasPermission) {
      throw new AppError('Unauthorized to check in this ticket', 403);
    }

    // Mark ticket as used
    const updatedTicket = await prisma.ticket.update({
      where: { id: ticket.id },
      data: {
        status: 'USED',
        usedAt: new Date(),
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            displayName: true,
            avatar: true,
          },
        },
      },
    });

    res.json({
      success: true,
      data: {
        ticket: {
          id: updatedTicket.id,
          ticketNumber: updatedTicket.ticketNumber,
          status: updatedTicket.status,
          usedAt: updatedTicket.usedAt,
        },
        user: updatedTicket.user,
        message: 'Check-in successful',
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get ticket by QR code (for validation without check-in)
 * POST /api/tickets/validate
 */
export const validateQRCode = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const scannerId = req.userId;
    if (!scannerId) {
      throw new AppError('Unauthorized', 401);
    }

    const { qrCodeData } = req.body;

    if (!qrCodeData) {
      throw new AppError('QR code data is required', 400);
    }

    // Parse QR code data
    let parsedData;
    try {
      parsedData = JSON.parse(qrCodeData);
    } catch (error) {
      throw new AppError('Invalid QR code format', 400);
    }

    // Validate hash
    const secret = process.env.QR_CODE_SECRET || 'default-secret-key-change-in-production';
    const dataString = JSON.stringify({
      enrollmentId: parsedData.enrollmentId,
      meetupMemberId: parsedData.meetupMemberId,
      classId: parsedData.classId,
      meetupId: parsedData.meetupId,
      userId: parsedData.userId,
      timestamp: parsedData.timestamp,
    });
    const expectedHash = crypto
      .createHmac('sha256', secret)
      .update(dataString)
      .digest('hex');

    if (parsedData.hash !== expectedHash) {
      throw new AppError('Invalid QR code', 400);
    }

    // Find ticket by QR code
    const ticket = await prisma.ticket.findUnique({
      where: { qrCode: qrCodeData },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            displayName: true,
            avatar: true,
          },
        },
        class: {
          select: {
            id: true,
            title: true,
            instructor: {
              select: {
                id: true,
                displayName: true,
              },
            },
            venue: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
        meetup: {
          select: {
            id: true,
            title: true,
            host: {
              select: {
                id: true,
                displayName: true,
              },
            },
            venue: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });

    if (!ticket) {
      throw new AppError('Ticket not found', 404);
    }

    res.json({
      success: true,
      data: {
        ticket: {
          id: ticket.id,
          ticketNumber: ticket.ticketNumber,
          status: ticket.status,
          usedAt: ticket.usedAt,
          expiresAt: ticket.expiresAt,
        },
        user: ticket.user,
        class: ticket.class,
        meetup: ticket.meetup,
      },
    });
  } catch (error) {
    next(error);
  }
};
