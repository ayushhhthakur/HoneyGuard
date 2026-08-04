import {
  LayoutDashboard,
  BellRing,
  Fingerprint,
  MapPin,
  UploadCloud,
  Tag,
  List,
  Users,
} from "lucide-react";

/**
 * Plain data — no CoreUI nav components. The Sidebar renders this directly,
 * grouped by `section`.
 */
const getNav = () => [
  {
    section: null,
    items: [{ name: "Overview", to: "/dashboard", icon: LayoutDashboard }],
  },
  {
    section: "Detection & Response",
    items: [
      { name: "Alerts", to: "/alerts", icon: BellRing },
      { name: "Device Fingerprints", to: "/fingerprints", icon: Fingerprint },
      { name: "Threat Map", to: "/utils/maps", icon: MapPin },
    ],
  },
  {
    section: "Honeytokens",
    items: [
      { name: "Deploy Token", to: "/utils/Tokens", icon: UploadCloud },
      { name: "Deployed Tokens", to: "/utils/track", icon: Fingerprint },
      { name: "Categories", to: "/utils/category", icon: Tag },
      { name: "Event Log", to: "/utils/logs", icon: List },
    ],
  },
  {
    section: "Organization",
    items: [{ name: "Team", to: "/team", icon: Users }],
  },
];

export default getNav;
