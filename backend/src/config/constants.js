// RBAC role hierarchy. Higher number = more privilege. Used by
// requireOrgRole.atLeast() so a route can say "analyst or above" without
// hardcoding the exact role list.
export const ROLES = Object.freeze({
  VIEWER: 'viewer',
  ANALYST: 'analyst',
  ADMIN: 'admin',
  OWNER: 'owner',
});

export const ROLE_RANK = Object.freeze({
  [ROLES.VIEWER]: 1,
  [ROLES.ANALYST]: 2,
  [ROLES.ADMIN]: 3,
  [ROLES.OWNER]: 4,
});

export const TOKEN_CATEGORIES = Object.freeze({
  IMAGE: 'image',
  AWS: 'aws',
  FINANCIAL: 'financial',
  HEALTHCARE: 'healthcare',
});

export const LOG_EVENTS = Object.freeze({
  VERIFY: 'VERIFY',
  IMAGE_ACCESS: 'IMAGE_ACCESS',
  AWS_ACCESS: 'AWS_ACCESS',
  FINANCIAL_ACCESS: 'FINANCIAL_ACCESS',
  HEALTHCARE_ACCESS: 'HEALTHCARE_ACCESS',
  SUSPICIOUS: 'suspicious',
  FINGERPRINT: 'FINGERPRINT',
});

// Which log events are serious enough to open an alert when they succeed.
export const SUSPICIOUS_EVENTS = new Set([
  LOG_EVENTS.IMAGE_ACCESS,
  LOG_EVENTS.AWS_ACCESS,
  LOG_EVENTS.FINANCIAL_ACCESS,
  LOG_EVENTS.HEALTHCARE_ACCESS,
  LOG_EVENTS.SUSPICIOUS,
]);

export const ALERT_STATUSES = Object.freeze({
  OPEN: 'open',
  ACKNOWLEDGED: 'acknowledged',
  RESOLVED: 'resolved',
});

export const ALERT_SEVERITIES = Object.freeze({
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  CRITICAL: 'critical',
});

// Heuristic mapping from a honeytoken event type to the MITRE ATT&CK
// tactic it most resembles. This is a simplification for the dashboard's
// MITRE widget, not a claim of certified technique detection — HoneyGuard
// observes a token being touched, not the full kill chain around it. Kept
// as an explicit, documented mapping (not fabricated per-technique data)
// so it's honest about what it represents: which category of adversary
// behavior a given honeytoken category tends to signal.
export const EVENT_MITRE_TACTIC = Object.freeze({
  [LOG_EVENTS.VERIFY]: 'Discovery',
  [LOG_EVENTS.IMAGE_ACCESS]: 'Collection',
  [LOG_EVENTS.AWS_ACCESS]: 'Credential Access',
  [LOG_EVENTS.FINANCIAL_ACCESS]: 'Collection',
  [LOG_EVENTS.HEALTHCARE_ACCESS]: 'Collection',
  [LOG_EVENTS.SUSPICIOUS]: 'Initial Access',
  [LOG_EVENTS.FINGERPRINT]: 'Reconnaissance',
});

// Audit log action names — kept as constants so services/repositories can't
// silently drift into inconsistent free-text action strings.
export const AUDIT_ACTIONS = Object.freeze({
  TOKEN_CREATED: 'token.created',
  TOKEN_DELETED: 'token.deleted',
  TOKEN_ROTATED: 'token.rotated',
  TOKEN_EXPIRED: 'token.expired',
  TOKEN_REVOKED: 'token.revoked',
  TOKEN_TAGGED: 'token.tagged',
  TOKENS_EXPORTED: 'tokens.exported',
  CATEGORY_CREATED: 'category.created',
  CATEGORY_DELETED: 'category.deleted',
  ALERT_STATUS_CHANGED: 'alert.status_changed',
  ORG_CREATED: 'org.created',
  MEMBER_ROLE_CHANGED: 'org.member.role_changed',
  MEMBER_REMOVED: 'org.member.removed',
  INVITE_CREATED: 'org.invite.created',
  INVITE_REVOKED: 'org.invite.revoked',
  INVITE_ACCEPTED: 'org.invite.accepted',
});
