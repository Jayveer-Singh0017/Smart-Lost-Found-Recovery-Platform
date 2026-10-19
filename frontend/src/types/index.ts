export type ItemType = 'LOST' | 'FOUND';
export type ItemStatus = 'OPEN' | 'CLAIM_PENDING' | 'RESOLVED' | 'WITHDRAWN';
export type ModerationStatus = 'APPROVED' | 'PENDING_MODERATION' | 'REJECTED';
export type ClaimStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'WITHDRAWN';
export type NotificationType =
  | 'POTENTIAL_MATCH'
  | 'CLAIM_SUBMITTED'
  | 'CLAIM_STATUS_UPDATE'
  | 'ITEM_RESOLVED'
  | 'MODERATION_ALERT';

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  timestamp: string;
}

export interface PagedResponse<T> {
  content: T[];
  pageNumber: number;
  pageSize: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
}

export interface UserProfileDto {
  id: number;
  email: string;
  fullName: string;
  phoneNumber?: string;
  role: 'ROLE_USER' | 'ROLE_ADMIN';
  enabled: boolean;
  createdAt: string;
}

export interface AuthResponse {
  token: string;
  tokenType: string;
  userId: number;
  email: string;
  fullName: string;
  role: 'ROLE_USER' | 'ROLE_ADMIN';
}

export interface CategoryDto {
  id: number;
  name: string;
  description?: string;
  icon?: string;
  active: boolean;
}

export interface ItemImageDto {
  id: number;
  imageUrl: string;
  originalFileName: string;
  fileSizeBytes: number;
}

export interface ItemSummaryResponse {
  id: number;
  title: string;
  type: ItemType;
  categoryId: number;
  categoryName: string;
  categoryIcon: string;
  city: string;
  locationAddress: string;
  incidentDate: string;
  status: ItemStatus;
  primaryImageUrl?: string;
  createdAt: string;
}

export interface ItemReportResponse {
  id: number;
  title: string;
  type: ItemType;
  categoryId: number;
  categoryName: string;
  categoryIcon: string;
  userId: number;
  reporterName: string;
  description: string;
  distinguishingCharacteristics?: string;
  city: string;
  locationAddress: string;
  incidentDate: string;
  status: ItemStatus;
  moderationStatus: ModerationStatus;
  contactEmail?: string;
  contactPhone?: string;
  images: ItemImageDto[];
  owner: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ItemReportUpdateRequest {
  title: string;
  categoryId: number;
  description: string;
  distinguishingCharacteristics?: string;
  city: string;
  locationAddress: string;
  incidentDate: string;
  contactEmail?: string;
  contactPhone?: string;
}

export interface ClaimResponse {
  id: number;
  itemReportId: number;
  itemTitle: string;
  itemType: ItemType;
  claimantId: number;
  claimantName: string;
  proofDescription: string;
  secretIdentifiers?: string;
  contactPhone?: string;
  status: ClaimStatus;
  reviewerId?: number;
  reviewerName?: string;
  reviewerNotes?: string;
  resolvedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface MatchExplanationDto {
  categoryScore: number;
  textScore: number;
  locationScore: number;
  dateProximityScore: number;
  totalScore: number;
  matchedKeywords: string[];
  matchReasons: string[];
}

export interface MatchResultDto {
  sourceItemId: number;
  matchedItem: ItemSummaryResponse;
  score: number;
  explanation: MatchExplanationDto;
}

export interface NotificationDto {
  id: number;
  title: string;
  message: string;
  type: NotificationType;
  referenceId?: number;
  referenceType?: string;
  isRead: boolean;
  createdAt: string;
}

export interface AdminDashboardStatsDto {
  totalUsers: number;
  totalLostReports: number;
  totalFoundReports: number;
  totalOpenReports: number;
  totalResolvedReports: number;
  pendingClaimsCount: number;
  pendingModerationCount: number;
}

export interface ModerationReportDto {
  id: number;
  itemReportId: number;
  itemTitle: string;
  itemType: ItemType;
  reporterId: number;
  reporterName: string;
  reason: string;
  details?: string;
  status: 'PENDING' | 'DISMISSED' | 'ACTIONED';
  createdAt: string;
}

export interface UserAdminDto {
  id: number;
  email: string;
  fullName: string;
  phoneNumber?: string;
  role: string;
  enabled: boolean;
  createdAt: string;
}

export interface AuditLogDto {
  id: number;
  action: string;
  entityName: string;
  entityId: number;
  performedBy: string;
  details?: string;
  ipAddress?: string;
  createdAt: string;
}
