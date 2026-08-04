import React, { useEffect, useRef, useState } from "react";
import PropTypes from "prop-types";

/** Animates from its previous value to `value` over `duration` ms whenever
 * `value` changes — gives the dashboard's headline numbers the subtle
 * "ticking up" feel real SOC consoles have instead of a static digit swap. */
export const AnimatedNumber = ({ value, duration = 700, format }) => {
  const [display, setDisplay] = useState(value || 0);
  const fromRef = useRef(value || 0);
  const rafRef = useRef(null);

  useEffect(() => {
    const from = fromRef.current;
    const to = typeof value === "number" ? value : 0;
    const start = performance.now();

    const step = (now) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - (1 - progress) ** 3; // ease-out-cubic
      setDisplay(Math.round(from + (to - from) * eased));
      if (progress < 1) rafRef.current = requestAnimationFrame(step);
      else fromRef.current = to;
    };

    rafRef.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(rafRef.current);
  }, [value, duration]);

  const formatted = format ? format(display) : display.toLocaleString();
  return <span className="text-mono">{formatted}</span>;
};

AnimatedNumber.propTypes = {
  value: PropTypes.number,
  duration: PropTypes.number,
  format: PropTypes.func,
};

export default AnimatedNumber;
