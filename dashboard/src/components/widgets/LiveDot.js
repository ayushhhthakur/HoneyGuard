import React from "react";
import PropTypes from "prop-types";
import { cn } from "@/lib/utils";

const DOT_CLASS = {
  accent: "bg-primary",
  critical: "bg-destructive",
  safe: "bg-success",
};
const TEXT_CLASS = {
  accent: "text-primary",
  critical: "text-destructive",
  safe: "text-success",
};

export const LiveDot = ({ color = "accent", label }) => (
  <span className="inline-flex items-center gap-1.5">
    <span className="relative flex h-1.5 w-1.5">
      <span
        className={cn(
          "absolute inline-flex h-full w-full animate-ping rounded-full opacity-60",
          DOT_CLASS[color],
        )}
      />
      <span
        className={cn(
          "relative inline-flex h-1.5 w-1.5 rounded-full",
          DOT_CLASS[color],
        )}
      />
    </span>
    {label && (
      <span
        className={cn(
          "text-[11px] font-semibold uppercase tracking-wide",
          TEXT_CLASS[color],
        )}
      >
        {label}
      </span>
    )}
  </span>
);

LiveDot.propTypes = {
  color: PropTypes.oneOf(["accent", "critical", "safe"]),
  label: PropTypes.string,
};

export default LiveDot;
