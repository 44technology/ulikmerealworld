import { Response, NextFunction } from 'express';
import prisma from '../config/database.js';
import { AppError } from '../middleware/errorHandler.js';
import { AuthRequest } from '../middleware/auth.js';
import { uploadToCloudinary } from '../utils/upload.js';

export const createStory = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    // Check if user is authenticated
    if (!req.userId) {
      throw new AppError('Authentication required', 401);
    }

    if (!req.file) {
      throw new AppError('Image is required for story', 400);
    }

    // Parse body fields (from FormData)
    let venueId, meetupId, classId, communityId;
    if (req.body && typeof req.body === 'object') {
      venueId = req.body.venueId;
      meetupId = req.body.meetupId;
      classId = req.body.classId;
      communityId = req.body.communityId;
    }

    if (classId) {
      const cls = await prisma.class.findUnique({ where: { id: classId } });
      if (!cls) {
        throw new AppError('Class not found', 404);
      }
    }
    if (communityId) {
      const community = await prisma.community.findUnique({ where: { id: communityId } });
      if (!community) {
        throw new AppError('Community not found', 404);
      }
    }

    let imageUrl: string;
    try {
      imageUrl = await uploadToCloudinary(req.file);
    } catch (uploadError: any) {
      console.error('Cloudinary upload error:', uploadError);
      throw new AppError('Failed to upload image: ' + (uploadError.message || 'Unknown error'), 500);
    }
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24); // Stories expire after 24 hours

    const story = await prisma.story.create({
      data: {
        userId: req.userId!,
        image: imageUrl,
        venueId: venueId || null,
        meetupId: meetupId || null,
        classId: classId || null,
        communityId: communityId || null,
        expiresAt,
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
        venue: true,
        meetup: true,
        class: true,
        community: true,
      },
    });

    res.status(201).json({
      success: true,
      data: story,
    });
  } catch (error) {
    next(error);
  }
};

export const getStories = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const stories = await prisma.story.findMany({
      where: {
        expiresAt: {
          gt: new Date(), // Only non-expired stories
        },
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
        venue: true,
        meetup: true,
        _count: {
          select: {
            views: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    res.json({
      success: true,
      data: stories,
    });
  } catch (error) {
    next(error);
  }
};

export const viewStory = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;

    // Check if already viewed
    const existingView = await prisma.storyView.findUnique({
      where: {
        storyId_userId: {
          storyId: id,
          userId: req.userId!,
        },
      },
    });

    if (!existingView) {
      await prisma.storyView.create({
        data: {
          storyId: id,
          userId: req.userId!,
        },
      });
    }

    res.json({
      success: true,
      message: 'Story viewed',
    });
  } catch (error) {
    next(error);
  }
};
