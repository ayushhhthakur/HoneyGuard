import React from "react";
import PropTypes from "prop-types";

/** Minimal trend line — no chart library, just a path built from the
 * values array. Used inside compact widgets where a full chart.js
 * instance would be overkill (e.g. a stat tile's trend indicator). */
export const Sparkline = ({
  values = [],
  width = 100,
  height = 32,
  color = "#22d3ee",
  fill = true,
}) => {
  if (!values || values.length < 2) {
    return <div style={{ width, height }} />;
  }

  const max = Math.max(...values, 1);
  const min = Math.min(...values, 0);
  const range = max - min || 1;
  const stepX = width / (values.length - 1);

  const points = values.map((v, i) => [
    i * stepX,
    height - ((v - min) / range) * height,
  ]);
  const linePath = points
    .map(([x, y], i) => `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`)
    .join(" ");
  const areaPath = `${linePath} L${width},${height} L0,${height} Z`;

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
      {fill && (
        <defs>
          <linearGradient id="hg-spark-fill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.35" />
            <stop offset="100%" stopColor={color} stopOpacity="0" />
          </linearGradient>
        </defs>
      )}
      {fill && <path d={areaPath} fill="url(#hg-spark-fill)" stroke="none" />}
      <path
        d={linePath}
        fill="none"
        stroke={color}
        strokeWidth={1.75}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

Sparkline.propTypes = {
  values: PropTypes.arrayOf(PropTypes.number),
  width: PropTypes.number,
  height: PropTypes.number,
  color: PropTypes.string,
  fill: PropTypes.bool,
};

export default Sparkline;
