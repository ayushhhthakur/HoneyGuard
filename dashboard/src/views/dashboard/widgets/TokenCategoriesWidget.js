import React from "react";
import PropTypes from "prop-types";
import { Layers } from "lucide-react";
import { WidgetCard } from "@/components/widgets/WidgetCard";
import { SkeletonRows } from "@/components/widgets/Skeleton";
import { EmptyState } from "@/components/ui/AsyncStates";

const CATEGORY_COLOR = {
  image: "bg-blue-500",
  aws: "bg-red-500",
  financial: "bg-amber-500",
  healthcare: "bg-emerald-500",
};
const DEFAULT_COLOR = "bg-primary";

export const TokenCategoriesWidget = ({ categories = [], loading }) => {
  const total = categories.reduce((sum, c) => sum + c.count, 0) || 1;

  return (
    <WidgetCard title="Token Categories" icon={Layers}>
      {loading ? (
        <SkeletonRows rows={4} />
      ) : categories.length === 0 ? (
        <EmptyState>No honeytokens deployed yet.</EmptyState>
      ) : (
        <>
          <div className="mb-3 flex h-2 w-full overflow-hidden rounded-full">
            {categories.map((c) => (
              <div
                key={c.category}
                className={CATEGORY_COLOR[c.category] || DEFAULT_COLOR}
                style={{ width: `${(c.count / total) * 100}%` }}
              />
            ))}
          </div>
          <div className="flex flex-col gap-2">
            {categories.map((c) => (
              <div
                key={c.category}
                className="flex items-center justify-between text-xs"
              >
                <span className="flex items-center gap-2 capitalize">
                  <span
                    className={`h-2 w-2 rounded-full ${CATEGORY_COLOR[c.category] || DEFAULT_COLOR}`}
                  />
                  {c.category}
                </span>
                <span className="text-muted-foreground text-mono">
                  {c.count} &middot; {Math.round((c.count / total) * 100)}%
                </span>
              </div>
            ))}
          </div>
        </>
      )}
    </WidgetCard>
  );
};

TokenCategoriesWidget.propTypes = {
  categories: PropTypes.array,
  loading: PropTypes.bool,
};

export default TokenCategoriesWidget;
