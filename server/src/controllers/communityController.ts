import { Response, NextFunction } from 'express';
import prisma from '../config/database.js';
import { AppError } from '../middleware/errorHandler.js';
import { AuthRequest } from '../middleware/auth.js';

const communityInclude = {
  creator: {
    select: {
      id: true,
      firstName: true,
      lastName: true,
      displayName: true,
      avatar: true,
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
  _count: { select: { members: true } },
};

export const getCommunities = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const communities = await prisma.community.findMany({
      include: communityInclude,
      orderBy: { createdAt: 'desc' },
    });
    const data = communities.map((c) => ({
      ...c,
      memberCount: c._count.members,
      _count: undefined,
    }));
    return res.json(data);
  } catch (e) {
    next(e);
  }
};

export const getCommunity = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const community = await prisma.community.findUnique({
      where: { id },
      include: communityInclude,
    });
    if (!community) throw new AppError('Community not found', 404);
    const currentUserId = req.userId;
    const membership = community.members.find((m) => m.userId === currentUserId);
    const data = {
      ...community,
      memberCount: community._count.members,
      _count: undefined,
      isMember: !!membership,
      isOwner: community.creatorId === currentUserId,
      currentUserRole: membership?.role ?? null,
    };
    return res.json(data);
  } catch (e) {
    next(e);
  }
};

export const createCommunity = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { name, description, image, isPublic } = req.body;
    const userId = req.userId!;
    const community = await prisma.community.create({
      data: {
        name: name || 'Unnamed Community',
        description: description || null,
        image: image || null,
        isPublic: isPublic !== undefined ? isPublic : true,
        creatorId: userId,
      },
      include: communityInclude,
    });
    await prisma.communityMember.create({
      data: {
        communityId: community.id,
        userId,
        role: 'owner',
      },
    });
    const withMemberCount = await prisma.community.findUnique({
      where: { id: community.id },
      include: { ...communityInclude, _count: { select: { members: true } } },
    });
    return res.status(201).json({
      ...withMemberCount,
      memberCount: withMemberCount!._count.members,
      _count: undefined,
    });
  } catch (e) {
    next(e);
  }
};

export const joinCommunity = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const userId = req.userId!;
    const community = await prisma.community.findUnique({ where: { id } });
    if (!community) throw new AppError('Community not found', 404);
    const existing = await prisma.communityMember.findUnique({
      where: { communityId_userId: { communityId: id, userId } },
    });
    if (existing) throw new AppError('Already a member', 400);
    const member = await prisma.communityMember.create({
      data: { communityId: id, userId, role: 'member' },
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
    return res.status(201).json(member);
  } catch (e) {
    next(e);
  }
};

export const leaveCommunity = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const userId = req.userId!;
    const community = await prisma.community.findUnique({ where: { id } });
    if (!community) throw new AppError('Community not found', 404);
    if (community.creatorId === userId) {
      throw new AppError('Owner cannot leave; transfer ownership or delete community', 400);
    }
    await prisma.communityMember.deleteMany({
      where: { communityId: id, userId },
    });
    return res.json({ success: true });
  } catch (e) {
    next(e);
  }
};

// Member requests to become admin (moderator). Only members can request.
export const requestAdmin = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const userId = req.userId!;
    const community = await prisma.community.findUnique({
      where: { id },
      include: { members: true, adminRequests: true },
    });
    if (!community) throw new AppError('Community not found', 404);
    const membership = community.members.find((m) => m.userId === userId);
    if (!membership) throw new AppError('You must be a member to request admin', 403);
    if (membership.role === 'owner' || membership.role === 'moderator') {
      throw new AppError('You are already an admin', 400);
    }
    const existing = community.adminRequests.find(
      (r) => r.userId === userId && r.status === 'PENDING'
    );
    if (existing) throw new AppError('You already have a pending admin request', 400);
    const request = await prisma.communityAdminRequest.create({
      data: { communityId: id, userId, status: 'PENDING' },
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
    return res.status(201).json(request);
  } catch (e) {
    next(e);
  }
};

// List pending admin requests. Only owner or moderators.
export const getAdminRequests = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const userId = req.userId!;
    const community = await prisma.community.findUnique({
      where: { id },
      include: { members: true, adminRequests: true },
    });
    if (!community) throw new AppError('Community not found', 404);
    const membership = community.members.find((m) => m.userId === userId);
    const isOwner = community.creatorId === userId;
    const isModerator = membership?.role === 'moderator';
    if (!isOwner && !isModerator) {
      throw new AppError('Only owner or admins can view admin requests', 403);
    }
    const pending = await prisma.communityAdminRequest.findMany({
      where: { communityId: id, status: 'PENDING' },
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
      orderBy: { requestedAt: 'desc' },
    });
    return res.json(pending);
  } catch (e) {
    next(e);
  }
};

// Owner or moderator approves an admin request.
export const approveAdminRequest = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id, requestId } = req.params;
    const userId = req.userId!;
    const community = await prisma.community.findUnique({
      where: { id },
      include: { members: true },
    });
    if (!community) throw new AppError('Community not found', 404);
    if (community.creatorId !== userId) {
      const membership = community.members.find((m) => m.userId === userId);
      if (membership?.role !== 'moderator') {
        throw new AppError('Only owner or admins can approve requests', 403);
      }
    }
    const adminRequest = await prisma.communityAdminRequest.findFirst({
      where: { id: requestId, communityId: id, status: 'PENDING' },
    });
    if (!adminRequest) throw new AppError('Admin request not found or already handled', 404);
    await prisma.$transaction([
      prisma.communityAdminRequest.update({
        where: { id: requestId },
        data: { status: 'APPROVED', respondedAt: new Date(), respondedBy: userId },
      }),
      prisma.communityMember.update({
        where: {
          communityId_userId: { communityId: id, userId: adminRequest.userId },
        },
        data: { role: 'moderator' },
      }),
    ]);
    return res.json({ success: true, message: 'User is now a community admin' });
  } catch (e) {
    next(e);
  }
};

// Owner or moderator rejects an admin request.
export const rejectAdminRequest = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id, requestId } = req.params;
    const userId = req.userId!;
    const community = await prisma.community.findUnique({
      where: { id },
      include: { members: true },
    });
    if (!community) throw new AppError('Community not found', 404);
    if (community.creatorId !== userId) {
      const membership = community.members.find((m) => m.userId === userId);
      if (membership?.role !== 'moderator') {
        throw new AppError('Only owner or admins can reject requests', 403);
      }
    }
    const adminRequest = await prisma.communityAdminRequest.findFirst({
      where: { id: requestId, communityId: id, status: 'PENDING' },
    });
    if (!adminRequest) throw new AppError('Admin request not found or already handled', 404);
    await prisma.communityAdminRequest.update({
      where: { id: requestId },
      data: { status: 'REJECTED', respondedAt: new Date(), respondedBy: userId },
    });
    return res.json({ success: true, message: 'Admin request rejected' });
  } catch (e) {
    next(e);
  }
};

// Owner assigns a member as admin (moderator) or demotes to member. Only owner can assign.
export const setMemberRole = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id, userId: targetUserId } = req.params;
    const { role } = req.body; // 'moderator' | 'member'
    const userId = req.userId!;
    const community = await prisma.community.findUnique({
      where: { id },
      include: { members: true },
    });
    if (!community) throw new AppError('Community not found', 404);
    if (community.creatorId !== userId) {
      throw new AppError('Only the community owner can assign admins', 403);
    }
    if (role !== 'moderator' && role !== 'member') {
      throw new AppError('Role must be moderator or member', 400);
    }
    const targetMember = community.members.find((m) => m.userId === targetUserId);
    if (!targetMember) throw new AppError('User is not a member of this community', 404);
    if (targetMember.role === 'owner') {
      throw new AppError('Cannot change owner role', 400);
    }
    await prisma.communityMember.update({
      where: {
        communityId_userId: { communityId: id, userId: targetUserId },
      },
      data: { role },
    });
    // If approving a pending admin request for this user, mark it approved
    await prisma.communityAdminRequest.updateMany({
      where: { communityId: id, userId: targetUserId, status: 'PENDING' },
      data: { status: 'APPROVED', respondedAt: new Date(), respondedBy: userId },
    });
    return res.json({ success: true, role });
  } catch (e) {
    next(e);
  }
};

// Get my pending admin request for this community (for UI: show "Request pending")
export const getMyAdminRequest = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const userId = req.userId!;
    const request = await prisma.communityAdminRequest.findUnique({
      where: {
        communityId_userId: { communityId: id, userId },
      },
    });
    return res.json(request || null);
  } catch (e) {
    next(e);
  }
};
