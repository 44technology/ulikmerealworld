import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { API_ORIGIN, API_ENDPOINTS, apiRequest } from '@/lib/api';

export interface Community {
  id: string;
  name: string;
  description?: string;
  image?: string;
  isPublic: boolean;
  memberCount: number;
  /** Optional: for discover filtering (e.g. English, Spanish) */
  language?: string;
  /** Optional: area/category (e.g. Startup, Wellness, Design) */
  category?: string;
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
    language: 'English',
    category: 'Startup',
    creator: { id: 'c1', displayName: 'Alex Chen' },
  },
  {
    id: 'comm-2',
    name: 'Yoga & Mindfulness',
    description: 'Daily practice and mindful living.',
    image: 'https://images.unsplash.com/photo-1545205597-3d9d02c29597?w=400',
    isPublic: true,
    memberCount: 892,
    language: 'English',
    category: 'Wellness',
    creator: { id: 'c2', displayName: 'Sarah Kim' },
  },
  {
    id: 'comm-3',
    name: 'Design Thinkers',
    description: 'UX, product and visual design.',
    image: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=400',
    isPublic: true,
    memberCount: 2103,
    language: 'English',
    category: 'Design',
    creator: { id: 'c3', displayName: 'Jordan Lee' },
  },
  {
    id: 'comm-4',
    name: 'Language Exchange',
    description: 'Practice languages with native speakers.',
    image: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=400',
    isPublic: true,
    memberCount: 567,
    language: 'Spanish',
    category: 'Language',
    creator: { id: 'c4', displayName: 'Maria Garcia' },
  },
  {
    id: 'comm-5',
    name: 'Photography Club',
    description: 'Share shots and get feedback.',
    image: 'https://images.unsplash.com/photo-1452587925148-ce544e77e70d?w=400',
    isPublic: true,
    memberCount: 734,
    language: 'English',
    category: 'Photography',
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
    language: c.language,
    category: c.category ?? c.area,
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
    const res = await fetch(`${API_ORIGIN}/api/communities`, {
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

// --- Community detail (with members & roles) and admin requests (API) ---

export interface CommunityMemberWithUser {
  id: string;
  userId: string;
  role: string;
  joinedAt: string;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    displayName: string | null;
    avatar: string | null;
  };
}

export interface CommunityDetail extends Community {
  isMember: boolean;
  isOwner: boolean;
  currentUserRole: string | null;
  members?: CommunityMemberWithUser[];
}

export interface CommunityAdminRequestItem {
  id: string;
  communityId: string;
  userId: string;
  status: string;
  requestedAt: string;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    displayName: string | null;
    avatar: string | null;
  };
}

async function fetchCommunityDetail(id: string): Promise<CommunityDetail | null> {
  try {
    const token = localStorage.getItem('authToken');
    const res = await fetch(`${API_ORIGIN}/api/communities/${id}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    if (!res.ok) return null;
    const data = await res.json();
    return {
      ...normalizeCommunity(data),
      isMember: data.isMember ?? false,
      isOwner: data.isOwner ?? false,
      currentUserRole: data.currentUserRole ?? null,
      members: data.members,
    };
  } catch {
    return null;
  }
}

export function useCommunityDetail(communityId: string | undefined, enabled = true) {
  return useQuery({
    queryKey: ['community', communityId],
    queryFn: () => fetchCommunityDetail(communityId!),
    enabled: !!communityId && enabled,
    staleTime: 30 * 1000,
  });
}

export function useCommunityAdminRequests(communityId: string | undefined, canManage: boolean) {
  return useQuery({
    queryKey: ['community-admin-requests', communityId],
    queryFn: async () => {
      const result = await apiRequest<CommunityAdminRequestItem[] | { data: CommunityAdminRequestItem[] }>(
        API_ENDPOINTS.COMMUNITIES.ADMIN_REQUESTS(communityId!)
      );
      const list = Array.isArray(result) ? result : (result as any)?.data;
      return Array.isArray(list) ? list : [];
    },
    enabled: !!communityId && !!canManage,
    staleTime: 20 * 1000,
  });
}

export function useMyCommunityAdminRequest(communityId: string | undefined) {
  return useQuery({
    queryKey: ['my-admin-request', communityId],
    queryFn: async () => {
      const res = await apiRequest<{ status: string } | null | { data: { status: string } }>(
        API_ENDPOINTS.COMMUNITIES.MY_ADMIN_REQUEST(communityId!)
      );
      if (res && typeof res === 'object' && 'status' in res) return res as { status: string };
      return (res as any)?.data ?? null;
    },
    enabled: !!communityId,
    staleTime: 30 * 1000,
  });
}

export function useRequestCommunityAdmin(communityId: string | undefined) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      return apiRequest(API_ENDPOINTS.COMMUNITIES.ADMIN_REQUEST(communityId!), { method: 'POST' });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['community', communityId] });
      queryClient.invalidateQueries({ queryKey: ['my-admin-request', communityId] });
      queryClient.invalidateQueries({ queryKey: ['communities'] });
    },
  });
}

export function useApproveCommunityAdminRequest(communityId: string | undefined) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (requestId: string) => {
      await apiRequest(API_ENDPOINTS.COMMUNITIES.APPROVE_ADMIN_REQUEST(communityId!, requestId), { method: 'POST' });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['community', communityId] });
      queryClient.invalidateQueries({ queryKey: ['community-admin-requests', communityId] });
      queryClient.invalidateQueries({ queryKey: ['communities'] });
    },
  });
}

export function useRejectCommunityAdminRequest(communityId: string | undefined) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (requestId: string) => {
      await apiRequest(API_ENDPOINTS.COMMUNITIES.REJECT_ADMIN_REQUEST(communityId!, requestId), { method: 'POST' });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['community-admin-requests', communityId] });
    },
  });
}

export function useSetCommunityMemberRole(communityId: string | undefined) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ userId, role }: { userId: string; role: 'moderator' | 'member' }) => {
      await apiRequest(API_ENDPOINTS.COMMUNITIES.SET_MEMBER_ROLE(communityId!, userId), {
        method: 'PATCH',
        body: JSON.stringify({ role }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['community', communityId] });
      queryClient.invalidateQueries({ queryKey: ['community-admin-requests', communityId] });
      queryClient.invalidateQueries({ queryKey: ['communities'] });
    },
  });
}
