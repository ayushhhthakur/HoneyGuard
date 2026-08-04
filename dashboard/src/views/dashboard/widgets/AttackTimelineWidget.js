import React from "react";
import PropTypes from "prop-types";
import { History } from "lucide-react";
import { WidgetCard } from "@/components/widgets/WidgetCard";
import { SkeletonRows } from "@/components/widgets/Skeleton";
import { EmptyState } from "@/components/ui/AsyncStates";

const EVENT_DOT = {
  IMAGE_ACCESS: "bg-destructive",
  AWS_ACCESS: "bg-destructive",
  FINANCIAL_ACCESS: "bg-destructive",
  HEALTHCARE_ACCESS: "bg-destructive",
  suspicious: "bg-warning",
  FINGERPRINT: "bg-warning",
  VERIFY: "bg-primary",
};

export const AttackTimelineWidget = ({ events = [], loading }) => (
  <WidgetCard title="Attack Timeline" icon={History}>
    {loading ? (
      <SkeletonRows rows={5} />
    ) : events.length === 0 ? (
      <EmptyState>
        No timeline yet. Once a honeytoken is touched, each hit lands here in
        order.
      </EmptyState>
    ) : (
      <div className="relative max-h-[300px] overflow-y-auto">
        <div className="absolute bottom-1 left-[5px] top-1 w-px bg-border" />
        <div className="flex flex-col gap-3 pl-5">
          {events.slice(0, 12).map((e) => (
            <div key={e.id} className="relative">
              <span
                className={`absolute -left-[21px] top-1 h-2 w-2 rounded-full ${EVENT_DOT[e.event] || "bg-primary"}`}
              />
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-xs font-semibold capitalize">
                    {e.event.replace(/_/g, " ").toLowerCase()}
                  </div>
                  <div className="text-[11px] text-muted-foreground">
                    {e.tokenName || e.token} &middot;{" "}
                    {e.city !== "Unknown" ? e.city : e.country}
                  </div>
                </div>
                <div className="text-[11px] text-muted-foreground text-mono">
                  {new Date(e.timestamp).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )}
  </WidgetCard>
);

AttackTimelineWidget.propTypes = {
  events: PropTypes.array,
  loading: PropTypes.bool,
};

export default AttackTimelineWidget;
