import React from "react";
import PropTypes from "prop-types";
import { Skeleton } from "@/components/ui/skeleton";

/** A skeleton shaped like a widget card body — headline number + a few rows. */
export const SkeletonWidget = ({ rows = 3 }) => (
  <div className="flex flex-col gap-2">
    <Skeleton className="h-7 w-1/2" />
    <Skeleton className="h-3 w-2/3" />
    {Array.from({ length: rows }).map((_, i) => (
      <Skeleton
        key={i}
        className="h-2.5"
        style={{ width: `${85 - i * 12}%` }}
      />
    ))}
  </div>
);
SkeletonWidget.propTypes = { rows: PropTypes.number };

/** A skeleton shaped like a table — used while a list widget's data loads. */
export const SkeletonRows = ({ rows = 5 }) => (
  <div className="flex flex-col gap-3">
    {Array.from({ length: rows }).map((_, i) => (
      <div key={i} className="flex items-center gap-2">
        <Skeleton className="h-8 w-8 rounded-lg" />
        <div className="flex flex-1 flex-col gap-1">
          <Skeleton className="h-2.5 w-3/5" />
          <Skeleton className="h-2 w-1/3" />
        </div>
      </div>
    ))}
  </div>
);
SkeletonRows.propTypes = { rows: PropTypes.number };

export { Skeleton };
export default Skeleton;
