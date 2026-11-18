export const ROLE_IDS = ["ADMIN", "MANAGER", "MARKETING", "SALE", "DEV"] as const;
export type RoleId = (typeof ROLE_IDS)[number];

export const LEAD_STATUSES = ["new", "contacting", "qualified", "proposal", "won", "lost"] as const;
export type LeadStatus = (typeof LEAD_STATUSES)[number];

export const DUPLICATE_STATUSES = [
  "NONE",
  "PENDING_REVIEW",
  "MERGED",
  "CONFIRMED_SEPARATE",
] as const;
export type DuplicateStatus = (typeof DUPLICATE_STATUSES)[number];

export const ACTIVITY_TYPES = [
  "CREATED",
  "TOUCHPOINT_ADDED",
  "DUPLICATE_FLAGGED",
  "MERGED",
  "CALL",
  "ZALO",
  "EMAIL",
  "MEETING",
  "NOTE",
  "STATUS_CHANGED",
  "ASSIGNED",
  "FOLLOW_UP_SET",
] as const;
export type ActivityType = (typeof ACTIVITY_TYPES)[number];

export const POST_STATUSES = ["DRAFT", "PUBLISHED", "SCHEDULED", "ARCHIVED"] as const;
export type PostStatus = (typeof POST_STATUSES)[number];

export const STORAGE_PROVIDERS = ["r2", "local"] as const;
export type StorageProviderType = (typeof STORAGE_PROVIDERS)[number];

export const PERMISSIONS = {
  LEADS_READ_ALL: "leads:read_all",
  LEADS_READ_ASSIGNED: "leads:read_assigned",
  LEADS_WRITE: "leads:write",
  LEADS_ASSIGN: "leads:assign",
  LEADS_MERGE: "leads:merge",
  LEADS_DELETE: "leads:delete",
  CRM_MASTER_MANAGE: "crm:master:manage",
  CAMPAIGNS_MANAGE: "campaigns:manage",
  ANALYTICS_READ: "analytics:read",
  BLOG_CREATE: "blog:create",
  BLOG_EDIT: "blog:edit",
  BLOG_PUBLISH: "blog:publish",
  BLOG_DELETE: "blog:delete",
  MEDIA_UPLOAD: "media:upload",
  MEDIA_MANAGE: "media:manage",
  USERS_MANAGE: "users:manage",
  INTEGRATIONS_MANAGE: "integrations:manage",
  INTEGRATIONS_READ: "integrations:read",
  SYSTEM_VIEW: "system:view",
} as const;
export type PermissionId = (typeof PERMISSIONS)[keyof typeof PERMISSIONS];
