import { Response, NextFunction } from 'express';
import prisma from '../config/database.js';
import { AppError } from '../middleware/errorHandler.js';
import { AuthRequest } from '../middleware/auth.js';
import { uploadToCloudinary } from '../utils/upload.js';
import { getBoundingBox, calculateDistance } from '../utils/geolocation.js';

export const createClass = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const {
      title,
      description,
      skill,
      category,
      startTime,
      endTime,
      maxStudents,
      price,
      schedule,
      venueId,
      latitude,
      longitude,
    } = req.body;

    let venue: { latitude: number | null; longitude: number | null } | null = null;
    if (venueId) {
      venue = await prisma.venue.findUnique({
        where: { id: venueId },
        select: { latitude: true, longitude: true },
      });
      if (!venue) {
        throw new AppError('Venue not found', 404);
      }
    }

    let imageUrl = null;
    if (req.file) {
      imageUrl = await uploadToCloudinary(req.file);
    }

    const classItem = await prisma.class.create({
      data: {
        title,
        description,
        skill,
        category: category || null,
        image: imageUrl,
        startTime: new Date(startTime),
        endTime: endTime ? new Date(endTime) : null,
        maxStudents: maxStudents ? parseInt(maxStudents) : null,
        price: price ? parseFloat(price) : null,
        schedule: schedule || null,
        venueId: venueId || null,
        latitude: latitude ?? venue?.latitude ?? null,
        longitude: longitude ?? venue?.longitude ?? null,
      },
      include: {
        venue: {
          select: {
            id: true,
            name: true,
            address: true,
            city: true,
            image: true,
          },
        },
        enrollments: {
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
        },
        _count: {
          select: {
            enrollments: true,
          },
        },
      },
    });

    res.status(201).json({
      success: true,
      data: classItem,
    });
  } catch (error) {
    next(error);
  }
};

export const getClasses = async (
  req: AuthRequest,
  res: Response, next: NextFunction
) => {
  try {
    const { skill, category, status, venueId, enrolled, limit = 20, offset = 0 } = req.query;

    // If enrolled filter is true, only show classes where user is enrolled
    const enrolledFilter = enrolled === 'true' && req.userId
      ? {
          enrollments: {
            some: {
              userId: req.userId,
              status: 'enrolled',
            },
          },
        }
      : {};

    const classes = await prisma.class.findMany({
      where: {
        ...(skill && { skill: { contains: skill as string, mode: 'insensitive' } }),
        ...(category && { category: category as string }),
        ...(status && { status: status as any }),
        ...(venueId && { venueId: venueId as string }),
        ...enrolledFilter,
      },
      include: {
        venue: {
          select: {
            id: true,
            name: true,
            address: true,
            city: true,
            image: true,
          },
        },
        enrollments: req.userId ? {
          where: {
            userId: req.userId,
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
        } : false,
        _count: {
          select: {
            enrollments: true,
          },
        },
      },
      orderBy: {
        startTime: 'asc',
      },
      take: Number(limit),
      skip: Number(offset),
    });

    res.json({
      success: true,
      data: classes,
    });
  } catch (error) {
    next(error);
  }
};

export const getNearbyClasses = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { latitude, longitude, radius = 10, limit = 20 } = req.query;

    const lat = Number(latitude);
    const lon = Number(longitude);
    const radiusKm = Number(radius);

    if (!lat || !lon) {
      throw new AppError('Latitude and longitude are required', 400);
    }

    const bbox = getBoundingBox(lat, lon, radiusKm);

    const classes = await prisma.class.findMany({
      where: {
        AND: [
          {
            latitude: {
              gte: bbox.minLat,
              lte: bbox.maxLat,
            },
          },
          {
            longitude: {
              gte: bbox.minLon,
              lte: bbox.maxLon,
            },
          },
          {
            status: {
              in: ['UPCOMING', 'ONGOING'],
            },
          },
        ],
      },
      include: {
        venue: {
          select: {
            id: true,
            name: true,
            address: true,
            city: true,
            image: true,
          },
        },
        _count: {
          select: {
            enrollments: true,
          },
        },
      },
      take: Number(limit),
    });

    // Calculate distances and sort
    const classesWithDistance = classes
      .map((classItem) => {
        if (!classItem.latitude || !classItem.longitude) return null;
        const distance = calculateDistance(
          lat,
          lon,
          classItem.latitude,
          classItem.longitude
        );
        return { ...classItem, distance };
      })
      .filter((c) => c !== null && c.distance <= radiusKm)
      .sort((a, b) => a!.distance - b!.distance);

    res.json({
      success: true,
      data: classesWithDistance,
    });
  } catch (error) {
    next(error);
  }
};

export const getClass = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;

    const classItem = await prisma.class.findUnique({
      where: { id },
      include: {
        venue: {
          select: {
            id: true,
            name: true,
            address: true,
            city: true,
            state: true,
            country: true,
            image: true,
            phone: true,
            website: true,
          },
        },
        enrollments: {
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
          orderBy: {
            enrolledAt: 'desc',
          },
        },
        _count: {
          select: {
            enrollments: true,
          },
        },
      },
    });

    if (!classItem) {
      throw new AppError('Class not found', 404);
    }

    res.json({
      success: true,
      data: classItem,
    });
  } catch (error) {
    next(error);
  }
};

export const enrollInClass = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;

    const classItem = await prisma.class.findUnique({
      where: { id },
      include: {
        enrollments: true,
      },
    });

    if (!classItem) {
      throw new AppError('Class not found', 404);
    }

    if (classItem.status !== 'UPCOMING' && classItem.status !== 'ONGOING') {
      throw new AppError('Class is not available for enrollment', 400);
    }

    // Check if already enrolled
    const existingEnrollment = classItem.enrollments.find(
      (e) => e.userId === req.userId
    );

    if (existingEnrollment) {
      throw new AppError('Already enrolled in this class', 409);
    }

    // Check max students
    if (classItem.maxStudents && classItem.enrollments.length >= classItem.maxStudents) {
      throw new AppError('Class is full', 400);
    }

    const enrollment = await prisma.classEnrollment.create({
      data: {
        classId: id,
        userId: req.userId!,
        status: 'enrolled',
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
        class: {
          include: {
            venue: {
              select: {
                id: true,
                name: true,
                address: true,
                city: true,
              },
            },
          },
        },
      },
    });

    // Generate QR code ticket if class has physical location (onsite or hybrid)
    // Check if class has venue (venueId is required in schema, so this is always true)
    // OR has latitude/longitude coordinates
    const hasPhysicalLocation = classItem.venueId || (classItem.latitude && classItem.longitude);
    let ticket = null;
    
    if (hasPhysicalLocation) {
      const { generateQRCodeData, generateTicketNumber } = await import('../utils/qrCodeGenerator.js');
      
      const qrCodeData = generateQRCodeData(
        enrollment.id,
        null,
        classItem.id,
        null,
        req.userId!
      );

      // Calculate expiration date (class end date + 24 hours, or 30 days default)
      const expiresAt = classItem.endTime
        ? new Date(new Date(classItem.endTime).getTime() + 24 * 60 * 60 * 1000)
        : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

      ticket = await prisma.ticket.create({
        data: {
          ticketNumber: generateTicketNumber(),
          qrCode: qrCodeData,
          userId: req.userId!,
          classId: classItem.id,
          enrollmentId: enrollment.id,
          price: classItem.price || 0,
          expiresAt,
          status: 'ACTIVE',
        },
      });
    }

    res.status(201).json({
      success: true,
      data: {
        ...enrollment,
        ticket: ticket ? {
          id: ticket.id,
          ticketNumber: ticket.ticketNumber,
          qrCode: ticket.qrCode,
          qrCodeImage: ticket.qrCodeImage,
          status: ticket.status,
        } : null,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const cancelEnrollment = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;

    const enrollment = await prisma.classEnrollment.findFirst({
      where: {
        classId: id,
        userId: req.userId!,
      },
    });

    if (!enrollment) {
      throw new AppError('Not enrolled in this class', 404);
    }

    await prisma.classEnrollment.delete({
      where: { id: enrollment.id },
    });

    res.json({
      success: true,
      message: 'Enrollment cancelled successfully',
    });
  } catch (error) {
    next(error);
  }
};

export const getMyClasses = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const enrollments = await prisma.classEnrollment.findMany({
      where: {
        userId: req.userId!,
      },
      include: {
        class: {
          include: {
            venue: {
              select: {
                id: true,
                name: true,
                address: true,
                city: true,
                image: true,
              },
            },
            _count: {
              select: {
                enrollments: true,
              },
            },
          },
        },
      },
      orderBy: {
        enrolledAt: 'desc',
      },
    });

    res.json({
      success: true,
      data: enrollments,
    });
  } catch (error) {
    next(error);
  }
};
