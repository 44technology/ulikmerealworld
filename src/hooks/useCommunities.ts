import { useQuery } from '@tanstack/react-query';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export interface Community {
  id: string;
  name: string;
  description?: string;
  image?: string;
  isPublic: boolean;
  memberCount: number;
  creator: {
    id: string;
    displayName: string;
    avatar?: string;
  };
}

const MOCK_COMMUNITIES: Community[] = [
  {
    id: 'comm-1',
    name: 'Startup Founders',
    description: 'Build, ship, and scale together.',
    image: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=400',
    isPublic: true,
    memberCount: 1240,
    creator: { id: 'c1', displayName: 'Alex Chen' },
  },
  {
    id: 'comm-2',
    name: 'Yoga & Mindfulness',
    description: 'Daily practice and mindful living.',
    image: 'https://images.unsplash.com/photo-1545205597-3d9d02c29597?w=400',
    isPublic: true,
    memberCount: 892,
    creator: { id: 'c2', displayName: 'Sarah Kim' },
  },
  {
    id: 'comm-3',
    name: 'Design Thinkers',
    description: 'UX, product and visual design.',
    image: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=400',
    isPublic: true,
    memberCount: 2103,
    creator: { id: 'c3', displayName: 'Jordan Lee' },
  },
  {
    id: 'comm-4',
    name: 'Language Exchange',
    description: 'Practice languages with native speakers.',
    image: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=400',
    isPublic: true,
    memberCount: 567,
    creator: { id: 'c4', displayName: 'Maria Garcia' },
  },
  {
    id: 'comm-5',
    name: 'Photography Club',
    description: 'Share shots and get feedback.',
    image: 'https://images.unsplash.com/photo-1452587925148-ce544e77e70d?w=400',
    isPublic: true,
    memberCount: 734,
    creator: { id: 'c5', displayName: 'David Park' },
  },
];

const MOCK_STORAGE_KEY = 'ulikme_mock_communities';

function getStoredCommunities(): Community[] {
  try {
    const raw = localStorage.getItem(MOCK_STORAGE_KEY);
    if (!raw) return [];
    const list = JSON.parse(raw);
    return Array.isArray(list) ? list : [];
  } catch {
    return [];
  }
}

function normalizeCommunity(c: any): Community {
  return {
    id: c.id,
    name: c.name || c.title || 'Community',
    description: c.description,
    image: c.image || c.imageUrl,
    isPublic: c.isPublic ?? true,
    memberCount: c.memberCount ?? c._count?.members ?? 0,
    creator: {
      id: c.creator?.id ?? c.userId ?? '',
      displayName: c.creator?.displayName ?? c.creator?.firstName ?? 'Creator',
      avatar: c.creator?.avatar,
    },
  };
}

async function fetchCommunities(): Promise<Community[]> {
  const stored = getStoredCommunities().map(normalizeCommunity);
  try {
    const token = localStorage.getItem('authToken');
    const res = await fetch(`${API_BASE}/api/communities`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    if (!res.ok) return [...stored, ...MOCK_COMMUNITIES];
    const data = await res.json();
    const list = Array.isArray(data) ? data : data?.data ?? data?.communities ?? [];
    const fromApi = list.length > 0 ? list.map((c: any) => normalizeCommunity(c)) : MOCK_COMMUNITIES;
    return [...stored, ...fromApi];
  } catch {
    return [...stored, ...MOCK_COMMUNITIES];
  }
}

export function useCommunities() {
  return useQuery({
    queryKey: ['communities'],
    queryFn: fetchCommunities,
    staleTime: 60 * 1000,
  });
}

const USER_COMMUNITIES_KEY = (userId: string) => `ulikme_user_communities_${userId}`;
const DEFAULT_CURRENT_USER_IDS = ['comm-1', 'comm-2', 'comm-3'];
const DEFAULT_OTHER_USER_IDS = ['comm-1', 'comm-2'];

export function getUserCommunityIds(userId: string): string[] {
  if (!userId) return [];
  try {
    const raw = localStorage.getItem(USER_COMMUNITIES_KEY(userId));
    if (raw) {
      const list = JSON.parse(raw);
      return Array.isArray(list) ? list : [];
    }
  } catch (_) {}
  if (userId === 'current-user') return DEFAULT_CURRENT_USER_IDS;
  return DEFAULT_OTHER_USER_IDS;
}

export function setUserCommunityIds(userId: string, communityIds: string[]): void {
  if (!userId) return;
  try {
    localStorage.setItem(USER_COMMUNITIES_KEY(userId), JSON.stringify(communityIds));
  } catch (_) {}
}

export function addUserToCommunity(userId: string, communityId: string): void {
  const ids = getUserCommunityIds(userId);
  if (ids.includes(communityId)) return;
  setUserCommunityIds(userId, [...ids, communityId]);
}

// Join requests: user requests to join, creator approves/rejects
const JOIN_REQUESTS_KEY = 'ulikme_community_join_requests';

export interface JoinRequest {
  userId: string;
  displayName: string;
  avatar?: string;
  requestedAt: string;
}

function getStoredJoinRequests(): Record<string, JoinRequest[]> {
  try {
    const raw = localStorage.getItem(JOIN_REQUESTS_KEY);
    if (!raw) return {};
    const obj = JSON.parse(raw);
    return typeof obj === 'object' && obj !== null ? obj : {};
  } catch {
    return {};
  }
}

function setStoredJoinRequests(requests: Record<string, JoinRequest[]>): void {
  try {
    localStorage.setItem(JOIN_REQUESTS_KEY, JSON.stringify(requests));
  } catch (_) {}
}

export function getCommunityJoinRequests(communityId: string): JoinRequest[] {
  if (!communityId) return [];
  const all = getStoredJoinRequests();
  const list = all[communityId];
  return Array.isArray(list) ? list : [];
}

export function addCommunityJoinRequest(
  communityId: string,
  user: { id: string | undefined; displayName?: string | null; firstName?: string | null; lastName?: string | null; avatar?: string | null }
): void {
  if (!communityId || !user.id) return;
  const all = getStoredJoinRequests();
  const list = all[communityId] ?? [];
  if (list.some((r) => r.userId === user.id)) return;
  const displayName =
    user.displayName ||
    [user.firstName, user.lastName].filter(Boolean).join(' ') ||
    'User';
  list.push({
    userId: user.id,
    displayName,
    avatar: user.avatar ?? undefined,
    requestedAt: new Date().toISOString(),
  });
  setStoredJoinRequests({ ...all, [communityId]: list });
}

export function removeCommunityJoinRequest(communityId: string, userId: string): void {
  if (!communityId || !userId) return;
  const all = getStoredJoinRequests();
  const list = (all[communityId] ?? []).filter((r) => r.userId !== userId);
  if (list.length === 0) {
    const next = { ...all };
    delete next[communityId];
    setStoredJoinRequests(next);
  } else {
    setStoredJoinRequests({ ...all, [communityId]: list });
  }
}

export function hasUserRequestedCommunity(userId: string | undefined, communityId: string | undefined): boolean {
  if (!userId || !communityId) return false;
  const list = getCommunityJoinRequests(communityId);
  return list.some((r) => r.userId === userId);
}

/** Community IDs where the user has a pending join request (not yet approved) */
export function getCommunityIdsWithPendingRequest(userId: string | undefined): string[] {
  if (!userId) return [];
  const all = getStoredJoinRequests();
  return Object.keys(all).filter((communityId) =>
    (all[communityId] ?? []).some((r) => r.userId === userId)
  );
}
