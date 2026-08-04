// Mirrors backend/src/config/constants.js — kept intentionally simple (not
// imported cross-project) since frontend/backend are deployed and versioned
// independently, but the values must stay in sync with the API's enums.
// Values are Badge component variants: default | secondary | outline | success | warning | destructive
export const ROLE_COLORS = {
  owner: "warning",
  admin: "default",
  analyst: "success",
  viewer: "secondary",
};

export const SEVERITY_COLORS = {
  low: "secondary",
  medium: "default",
  high: "warning",
  critical: "destructive",
};

export const ALERT_STATUS_COLORS = {
  open: "destructive",
  acknowledged: "warning",
  resolved: "success",
};

export const ROLES = ["viewer", "analyst", "admin", "owner"];
export const INVITABLE_ROLES = ["viewer", "analyst", "admin"];
