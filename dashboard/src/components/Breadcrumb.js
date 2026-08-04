import React from "react";
import { useLocation } from "react-router-dom";

const TITLES = {
  "/dashboard": "Overview",
  "/alerts": "Alerts",
  "/fingerprints": "Device Fingerprints",
  "/utils/maps": "Threat Map",
  "/utils/tokens": "Deploy Token",
  "/utils/track": "Deployed Tokens",
  "/utils/category": "Categories",
  "/utils/logs": "Event Log",
  "/team": "Team",
};

export const Breadcrumb = () => {
  const { pathname } = useLocation();
  const title =
    TITLES[pathname] ||
    TITLES[Object.keys(TITLES).find((p) => pathname.startsWith(p))] ||
    "HoneyGuard";

  return <h1 className="text-sm font-semibold text-foreground">{title}</h1>;
};

export default Breadcrumb;
