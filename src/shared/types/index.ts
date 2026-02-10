export interface Team {
  id: string;
  name: string;
  slug: string;
  description?: string;
  avatarUrl?: string;
  type: TeamType;
  subjects: string[];
  isPublic: boolean;
  isDiscoverable: boolean;
  status: TeamStatus;
  memberCount: number;
  currentUserRole?: MemberRole;
  createdAt: Date;
}

export interface TeamsResponse {
  data: Team[];
  total: number;
  page: number;
  pageSize: number;
}

export interface TeamDetail extends Team {
  createdBy: UserSummary;
  currentUserRole?: MemberRole;
}

export interface CreateTeamDto {
  name: string;
  description?: string;
  type: TeamType;
  subjects: string[];
  languages: laguage[];
  isPublic: boolean;
  isDiscoverable: boolean;
}

export type laguage = 'ENGLISH' | 'SPANISH' | 'FRENCH' | 'GERMAN' | 'CHINESE' | 'JAPANESE' | 'KOREAN' | 'Arabic' | 'OTHER';

export interface TeamMember {
  id: string;
  userId: string;
  user: UserSummary;
  role: MemberRole;
  jobTitle?: string;
  joinedAt: Date;
  invitedBy?: UserSummary;
}

export interface TeamMembersResponse {
  members: TeamMember[];
  total: number;
}

export interface TeamInvitation {
  id: string;
  team: TeamSummary;
  email: string;
  role: MemberRole;
  invitedBy: UserSummary;
  status: InvitationStatus;
  expiresAt: Date;
  createdAt: Date;
}

export interface TeamSummary {
  id: string;
  name: string;
  slug: string;
  avatarUrl?: string;
}

export interface UserSummary {
  id: string;
  name: string;
  avatarUrl?: string;
}

export const TeamType = {
  OPEN: 'OPEN',
  PRIVATE: 'PRIVATE',
  FREELANCE: 'FREELANCE',
  STARTUP: 'STARTUP',
  VOLUNTEER: 'VOLUNTEER',
  ORGANIZATION: 'ORGANIZATION',
} as const;
export type TeamType = typeof TeamType[keyof typeof TeamType];

export const TeamStatus = {
  ACTIVE: 'ACTIVE',
  ARCHIVED: 'ARCHIVED',
  SUSPENDED: 'SUSPENDED',
} as const;
export type TeamStatus = typeof TeamStatus[keyof typeof TeamStatus];

export const MemberRole = {
  LEADER: 'LEADER',
  MEMBER: 'MEMBER',
} as const;
export type MemberRole = typeof MemberRole[keyof typeof MemberRole];

export const InvitationStatus = {
  PENDING: 'PENDING',
  ACCEPTED: 'ACCEPTED',
  DECLINED: 'DECLINED',
  EXPIRED: 'EXPIRED',
  CANCELLED: 'CANCELLED',
} as const;
export type InvitationStatus = typeof InvitationStatus[keyof typeof InvitationStatus];