import { Response, NextFunction } from 'express';
import prisma from '../config/database.js';
import { AppError } from '../middleware/errorHandler.js';
import { AuthRequest } from '../middleware/auth.js';
import { uploadToCloudinary } from '../utils/upload.js';
import { getBoundingBox, calculateDistance } from '../utils/geolocation.js';

export const createMeetup = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const {
      title,
      description,
      startTime,
      endTime,
      maxAttendees,
      category,
      tags,
      venueId,
      latitude,
      longitude,
      location,
      isPublic,
      isFree,
      pricePerPerson,
      isBlindMeet,
    } = req.body;

    let imageUrl = null;
    if (req.file) {
      imageUrl = await uploadToCloudinary(req.file);
    }

    // If venueId is provided, status should be PENDING_APPROVAL
    const status = venueId ? 'PENDING_APPROVAL' : 'UPCOMING';
    const venueApprovalStatus = venueId ? 'pending' : null;

    const meetup = await prisma.meetup.create({
      data: {
        title,
        description,
        image: imageUrl,
        startTime: new Date(startTime),
        endTime: endTime ? new Date(endTime) : null,
        maxAttendees,
        category,
        tags: tags || [],
        creatorId: req.userId!,
        venueId: venueId || null,
        latitude: latitude || null,
        longitude: longitude || null,
        location: location || null,
        isPublic: isPublic !== undefined ? isPublic : true,
        isFree: isFree !== undefined ? isFree : true,
        pricePerPerson: pricePerPerson || null,
        isBlindMeet: isBlindMeet || false,
        status,
        venueApprovalStatus,
      },
      include: {
        creator: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            displayName: true,
            avatar: true,
          },
        },
        venue: true,
        members: {
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
      },
    });

    res.status(201).json({
      success: true,
      data: meetup,
      message: venueId 
        ? 'Activity created! Waiting for venue approval.' 
        : 'Activity created successfully!',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Approve or reject meetup by venue
 * PUT /api/meetups/:id/venue-approval
 */
export const approveMeetupByVenue = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const { action, approvedPrice, rejectionReason } = req.body; // action: 'approve' | 'reject'

    if (!action || !['approve', 'reject'].includes(action)) {
      throw new AppError('Invalid action. Must be "approve" or "reject"', 400);
    }

    const meetup = await prisma.meetup.findUnique({
      where: { id },
      include: {
        venue: true,
        creator: true,
      },
    });

    if (!meetup) {
      throw new AppError('Meetup not found', 404);
    }

    // Verify that the requester is the venue owner
    if (meetup.venueId !== req.userId) {
      throw new AppError('Unauthorized: Only venue owner can approve/reject', 403);
    }

    if (meetup.status !== 'PENDING_APPROVAL') {
      throw new AppError('Meetup is not pending approval', 400);
    }

    if (action === 'approve') {
      // If approvedPrice is provided, use it; otherwise use user's requested price
      const finalPrice = approvedPrice !== undefined ? approvedPrice : meetup.pricePerPerson;

      const updatedMeetup = await prisma.meetup.update({
        where: { id },
        data: {
          status: 'UPCOMING',
          venueApprovalStatus: 'approved',
          venueApprovedPrice: finalPrice,
          pricePerPerson: finalPrice, // Update the actual price
        },
        include: {
          creator: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              displayName: true,
              avatar: true,
            },
          },
          venue: true,
        },
      });

      // TODO: Send notification to creator that activity was approved
      // await sendNotification(meetup.creatorId, {
      //   type: 'ACTIVITY_APPROVED',
      //   message: `Your activity "${meetup.title}" has been approved by ${meetup.venue?.name}`,
      //   meetupId: id,
      // });

      res.json({
        success: true,
        data: updatedMeetup,
        message: 'Activity approved successfully',
      });
    } else {
      // Reject
      const updatedMeetup = await prisma.meetup.update({
        where: { id },
        data: {
          status: 'REJECTED',
          venueApprovalStatus: 'rejected',
          venueRejectionReason: rejectionReason || null,
        },
        include: {
          creator: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              displayName: true,
              avatar: true,
            },
          },
          venue: true,
        },
      });

      // TODO: Send notification to creator that activity was rejected
      // await sendNotification(meetup.creatorId, {
      //   type: 'ACTIVITY_REJECTED',
      //   message: `Your activity "${meetup.title}" was rejected by ${meetup.venue?.name}`,
      //   meetupId: id,
      //   reason: rejectionReason,
      // });

      res.json({
        success: true,
        data: updatedMeetup,
        message: 'Activity rejected',
      });
    }
  } catch (error) {
    next(error);
  }
};

/**
 * Get pending meetups for venue
 * GET /api/meetups/venue/pending
 */
export const getPendingMeetupsForVenue = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const venueId = req.userId; // Assuming venue user ID

    const pendingMeetups = await prisma.meetup.findMany({
      where: {
        venueId,
        status: 'PENDING_APPROVAL',
        venueApprovalStatus: 'pending',
      },
      include: {
        creator: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            displayName: true,
            avatar: true,
          },
        },
        venue: {
          select: {
            id: true,
            name: true,
            address: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    res.json({
      success: true,
      data: pendingMeetups,
    });
  } catch (error) {
    next(error);
  }
};

export const getMeetup = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;

    const meetup = await prisma.meetup.findUnique({
      where: { id },
      include: {
        creator: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            displayName: true,
            avatar: true,
          },
        },
        venue: {
          select: {
            id: true,
            name: true,
            address: true,
            city: true,
            image: true,
            rating: true,
            reviewCount: true,
          },
        },
        members: {
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
            members: true,
          },
        },
      },
    });

    if (!meetup) {
      throw new AppError('Meetup not found', 404);
    }

    res.json({
      success: true,
      data: meetup,
    });
  } catch (error) {
    next(error);
  }
};

export const getMeetups = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { category, status, search, latitude, longitude, radius } = req.query;

    const where: any = {};

    // Filter by category
    if (category) {
      where.category = category as string;
    }

    // Filter by status (exclude pending/rejected for regular users)
    if (status) {
      where.status = status as string;
    } else {
      // Default: only show approved/upcoming meetups
      where.status = {
        in: ['UPCOMING', 'ONGOING'],
      };
    }

    // Search by title or description
    if (search) {
      where.OR = [
        { title: { contains: search as string, mode: 'insensitive' } },
        { description: { contains: search as string, mode: 'insensitive' } },
      ];
    }

    // Filter by location if coordinates provided
    if (latitude && longitude && radius) {
      const lat = parseFloat(latitude as string);
      const lng = parseFloat(longitude as string);
      const rad = parseFloat(radius as string);

      const box = getBoundingBox(lat, lng, rad);

      where.latitude = {
        gte: box.minLat,
        lte: box.maxLat,
      };
      where.longitude = {
        gte: box.minLng,
        lte: box.maxLng,
      };
    }

    const meetups = await prisma.meetup.findMany({
      where,
      include: {
        creator: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            displayName: true,
            avatar: true,
          },
        },
        venue: {
          select: {
            id: true,
            name: true,
            address: true,
            city: true,
            image: true,
            rating: true,
            reviewCount: true,
          },
        },
        _count: {
          select: {
            members: true,
          },
        },
      },
      orderBy: {
        startTime: 'asc',
      },
    });

    // Calculate distance if coordinates provided
    let meetupsWithDistance = meetups;
    if (latitude && longitude) {
      const lat = parseFloat(latitude as string);
      const lng = parseFloat(longitude as string);

      meetupsWithDistance = meetups.map((meetup) => {
        if (meetup.latitude && meetup.longitude) {
          const distance = calculateDistance(
            lat,
            lng,
            meetup.latitude,
            meetup.longitude
          );
          return { ...meetup, distance };
        }
        return meetup;
      });

      // Sort by distance
      meetupsWithDistance.sort((a: any, b: any) => {
        if (!a.distance) return 1;
        if (!b.distance) return -1;
        return a.distance - b.distance;
      });
    }

    res.json({
      success: true,
      data: meetupsWithDistance,
    });
  } catch (error) {
    next(error);
  }
};

export const getNearbyMeetups = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { latitude, longitude, radius = '10' } = req.query;

    if (!latitude || !longitude) {
      throw new AppError('Latitude and longitude are required', 400);
    }

    const lat = parseFloat(latitude as string);
    const lng = parseFloat(longitude as string);
    const rad = parseFloat(radius as string);

    const box = getBoundingBox(lat, lng, rad);

    const meetups = await prisma.meetup.findMany({
      where: {
        latitude: {
          gte: box.minLat,
          lte: box.maxLat,
        },
        longitude: {
          gte: box.minLng,
          lte: box.maxLng,
        },
        status: {
          in: ['UPCOMING', 'ONGOING'],
        },
      },
      include: {
        creator: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            displayName: true,
            avatar: true,
          },
        },
        venue: {
          select: {
            id: true,
            name: true,
            address: true,
            city: true,
            image: true,
            rating: true,
            reviewCount: true,
          },
        },
        _count: {
          select: {
            members: true,
          },
        },
      },
      orderBy: {
        startTime: 'asc',
      },
    });

    // Calculate distance and sort
    const meetupsWithDistance = meetups.map((meetup) => {
      if (meetup.latitude && meetup.longitude) {
        const distance = calculateDistance(
          lat,
          lng,
          meetup.latitude,
          meetup.longitude
        );
        return { ...meetup, distance };
      }
      return meetup;
    });

    meetupsWithDistance.sort((a: any, b: any) => {
      if (!a.distance) return 1;
      if (!b.distance) return -1;
      return a.distance - b.distance;
    });

    res.json({
      success: true,
      data: meetupsWithDistance,
    });
  } catch (error) {
    next(error);
  }
};

export const updateMeetup = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const {
      title,
      description,
      startTime,
      endTime,
      maxAttendees,
      category,
      tags,
      latitude,
      longitude,
      location,
      isPublic,
      isFree,
      pricePerPerson,
      isBlindMeet,
    } = req.body;

    const meetup = await prisma.meetup.findUnique({
      where: { id },
    });

    if (!meetup) {
      throw new AppError('Meetup not found', 404);
    }

    // Only creator can update
    if (meetup.creatorId !== req.userId) {
      throw new AppError('Unauthorized', 403);
    }

    // If updating price and venueId exists, reset approval status
    let updateData: any = {};
    if (pricePerPerson !== undefined && meetup.venueId) {
      updateData.venueApprovalStatus = 'pending';
      updateData.status = 'PENDING_APPROVAL';
    }

    let imageUrl = meetup.image;
    if (req.file) {
      imageUrl = await uploadToCloudinary(req.file);
    }

    const updatedMeetup = await prisma.meetup.update({
      where: { id },
      data: {
        ...updateData,
        title: title || meetup.title,
        description: description !== undefined ? description : meetup.description,
        image: imageUrl,
        startTime: startTime ? new Date(startTime) : meetup.startTime,
        endTime: endTime !== undefined ? (endTime ? new Date(endTime) : null) : meetup.endTime,
        maxAttendees: maxAttendees !== undefined ? maxAttendees : meetup.maxAttendees,
        category: category !== undefined ? category : meetup.category,
        tags: tags !== undefined ? tags : meetup.tags,
        latitude: latitude !== undefined ? latitude : meetup.latitude,
        longitude: longitude !== undefined ? longitude : meetup.longitude,
        location: location !== undefined ? location : meetup.location,
        isPublic: isPublic !== undefined ? isPublic : meetup.isPublic,
        isFree: isFree !== undefined ? isFree : meetup.isFree,
        pricePerPerson: pricePerPerson !== undefined ? pricePerPerson : meetup.pricePerPerson,
        isBlindMeet: isBlindMeet !== undefined ? isBlindMeet : meetup.isBlindMeet,
      },
      include: {
        creator: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            displayName: true,
            avatar: true,
          },
        },
        venue: true,
        members: {
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
      },
    });

    res.json({
      success: true,
      data: updatedMeetup,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteMeetup = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;

    const meetup = await prisma.meetup.findUnique({
      where: { id },
    });

    if (!meetup) {
      throw new AppError('Meetup not found', 404);
    }

    // Only creator can delete
    if (meetup.creatorId !== req.userId) {
      throw new AppError('Unauthorized', 403);
    }

    await prisma.meetup.delete({
      where: { id },
    });

    res.json({
      success: true,
      message: 'Meetup deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

export const joinMeetup = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const { status = 'going' } = req.body;

    const meetup = await prisma.meetup.findUnique({
      where: { id },
      include: {
        members: true,
      },
    });

    if (!meetup) {
      throw new AppError('Meetup not found', 404);
    }

    // Check if meetup is approved
    if (meetup.status === 'PENDING_APPROVAL') {
      throw new AppError('This activity is pending venue approval', 400);
    }

    if (meetup.status === 'REJECTED') {
      throw new AppError('This activity was rejected by the venue', 400);
    }

    // Check if already a member
    const existingMember = meetup.members.find(
      (m) => m.userId === req.userId
    );

    if (existingMember) {
      // Update status
      const updated = await prisma.meetupMember.update({
        where: { id: existingMember.id },
        data: { status },
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

      return res.json({
        success: true,
        data: updated,
      });
    }

    // Check max attendees
    if (meetup.maxAttendees && meetup.members.length >= meetup.maxAttendees) {
      throw new AppError('Meetup is full', 400);
    }

    const member = await prisma.meetupMember.create({
      data: {
        meetupId: id,
        userId: req.userId!,
        status,
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

    // Generate QR code ticket if meetup has physical location (venue or coordinates)
    // Ticket is needed for onsite events/activities that require check-in
    const hasPhysicalLocation = meetup.venueId || (meetup.latitude && meetup.longitude) || meetup.location;
    let ticket = null;
    
    if (hasPhysicalLocation) {
      const { generateQRCodeData, generateTicketNumber } = await import('../utils/qrCodeGenerator.js');
      
      const qrCodeData = generateQRCodeData(
        null,
        member.id,
        null,
        meetup.id,
        req.userId!
      );

      // Calculate expiration date (meetup end date + 24 hours, or 30 days default)
      const expiresAt = meetup.endTime
        ? new Date(new Date(meetup.endTime).getTime() + 24 * 60 * 60 * 1000)
        : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

      ticket = await prisma.ticket.create({
        data: {
          ticketNumber: generateTicketNumber(),
          qrCode: qrCodeData,
          userId: req.userId!,
          meetupId: meetup.id,
          price: meetup.venueApprovedPrice || meetup.pricePerPerson || 0,
          expiresAt,
          status: 'ACTIVE',
        },
      });
    }

    res.status(201).json({
      success: true,
      data: {
        ...member,
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

export const leaveMeetup = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;

    const meetup = await prisma.meetup.findUnique({
      where: { id },
      include: {
        members: true,
      },
    });

    if (!meetup) {
      throw new AppError('Meetup not found', 404);
    }

    const member = meetup.members.find((m) => m.userId === req.userId);

    if (!member) {
      throw new AppError('You are not a member of this meetup', 404);
    }

    await prisma.meetupMember.delete({
      where: { id: member.id },
    });

    res.json({
      success: true,
      message: 'Left meetup successfully',
    });
  } catch (error) {
    next(error);
  }
};
