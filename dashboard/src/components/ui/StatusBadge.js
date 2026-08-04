import React from "react";
import PropTypes from "prop-types";
import { Badge } from "@/components/ui/badge";

/** `<StatusBadge value="high" colorMap={SEVERITY_COLORS} />` — every page
 * that rendered a role/severity/status pill was maintaining its own copy of
 * the color-mapping object; this pulls from constants/badges.js instead. */
export const StatusBadge = ({
  value,
  colorMap,
  fallbackVariant = "secondary",
}) => (
  <Badge variant={colorMap[value] || fallbackVariant} className="capitalize">
    {value}
  </Badge>
);

StatusBadge.propTypes = {
  value: PropTypes.string.isRequired,
  colorMap: PropTypes.object.isRequired,
  fallbackVariant: PropTypes.string,
};

export default StatusBadge;
