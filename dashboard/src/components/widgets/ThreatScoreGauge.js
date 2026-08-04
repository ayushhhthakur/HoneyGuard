import React from "react";
import PropTypes from "prop-types";
import { AnimatedNumber } from "./AnimatedNumber";

const LEVEL_COLOR = {
  critical: "#dc2626",
  high: "#d97706",
  medium: "#ca8a04",
  low: "#2563eb",
};

/** A radial gauge (0-100) tinted by severity level — the dashboard's
 * headline "Threat Score" widget. Pure SVG, no chart library. */
export const ThreatScoreGauge = ({ score = 0, level = "low", size = 108 }) => {
  const stroke = 8;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const pct = Math.max(0, Math.min(100, score)) / 100;
  const dashOffset = circumference * (1 - pct);
  const color = LEVEL_COLOR[level] || LEVEL_COLOR.low;

  return (
    <div
      className="relative flex items-center justify-center"
      style={{ width: size, height: size }}
    >
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="hsl(var(--muted))"
          strokeWidth={stroke}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={dashOffset}
          style={{
            transition: "stroke-dashoffset 0.9s cubic-bezier(0.16,1,0.3,1)",
          }}
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        <div
          className="font-bold leading-none"
          style={{ fontSize: size * 0.24, color }}
        >
          <AnimatedNumber value={score} />
        </div>
        <div className="mt-1 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
          {level} risk
        </div>
      </div>
    </div>
  );
};

ThreatScoreGauge.propTypes = {
  score: PropTypes.number,
  level: PropTypes.oneOf(["critical", "high", "medium", "low"]),
  size: PropTypes.number,
};

export default ThreatScoreGauge;
