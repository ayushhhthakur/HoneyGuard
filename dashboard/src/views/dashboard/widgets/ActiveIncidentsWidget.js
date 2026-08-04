import React from "react";
import PropTypes from "prop-types";
import { Bell, ArrowRight } from "lucide-react";
import { WidgetCard } from "@/components/widgets/WidgetCard";
import { AnimatedNumber } from "@/components/widgets/AnimatedNumber";
import { SkeletonWidget } from "@/components/widgets/Skeleton";
import { cn } from "@/lib/utils";

export const ActiveIncidentsWidget = ({ count, loading }) => (
  <WidgetCard
    title="Active Incidents"
    icon={Bell}
    actions={
      <a
        href="#/alerts"
        className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
      >
        View <ArrowRight className="h-3 w-3" />
      </a>
    }
  >
    {loading ? (
      <SkeletonWidget rows={1} />
    ) : (
      <div className="flex h-full flex-col justify-center">
        <div
          className={cn(
            "text-2xl font-bold",
            count > 0 ? "text-destructive" : "text-success",
          )}
        >
          <AnimatedNumber value={count} />
        </div>
        <div className="mt-0.5 text-xs text-muted-foreground">
          {count > 0 ? "requiring triage" : "no open incidents"}
        </div>
      </div>
    )}
  </WidgetCard>
);

ActiveIncidentsWidget.propTypes = {
  count: PropTypes.number,
  loading: PropTypes.bool,
};

export default ActiveIncidentsWidget;
