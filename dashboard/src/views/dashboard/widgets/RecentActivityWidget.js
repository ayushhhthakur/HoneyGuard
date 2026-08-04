import React, { useMemo } from "react";
import PropTypes from "prop-types";
import { Clock } from "lucide-react";
import { WidgetCard } from "@/components/widgets/WidgetCard";
import { SkeletonRows } from "@/components/widgets/Skeleton";
import { EmptyState } from "@/components/ui/AsyncStates";
import { Badge } from "@/components/ui/badge";

const timeAgo = (iso) => {
  const seconds = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
};

/** Rolls the raw event feed up by honeytoken — "which of my tokens is hot
 * right now" — deliberately different information from Live Events
 * (raw feed) and Attack Timeline (chronological per-hit). */
export const RecentActivityWidget = ({ events = [], loading }) => {
  const byToken = useMemo(() => {
    const map = new Map();
    for (const e of events) {
      const existing = map.get(e.token);
      if (!existing || new Date(e.timestamp) > new Date(existing.timestamp)) {
        map.set(e.token, { ...e, hitCount: (existing?.hitCount || 0) + 1 });
      } else {
        map.set(e.token, { ...existing, hitCount: existing.hitCount + 1 });
      }
    }
    return Array.from(map.values()).sort(
      (a, b) => new Date(b.timestamp) - new Date(a.timestamp),
    );
  }, [events]);

  return (
    <WidgetCard title="Recent Activity" icon={Clock}>
      {loading ? (
        <SkeletonRows rows={4} />
      ) : byToken.length === 0 ? (
        <EmptyState>Nothing to show yet.</EmptyState>
      ) : (
        <div className="flex flex-col gap-0.5">
          {byToken.slice(0, 8).map((t) => (
            <div
              key={t.token}
              className="flex items-center justify-between rounded-md px-2 py-1.5 hover:bg-muted/50"
            >
              <div>
                <div className="text-xs font-semibold">
                  {t.tokenName || t.token}
                </div>
                <div className="text-[11px] capitalize text-muted-foreground">
                  {t.category || "honeytoken"}
                </div>
              </div>
              <div className="text-right">
                <Badge variant="warning">
                  {t.hitCount} hit{t.hitCount === 1 ? "" : "s"}
                </Badge>
                <div className="mt-1 text-[10px] text-muted-foreground">
                  {timeAgo(t.timestamp)}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </WidgetCard>
  );
};

RecentActivityWidget.propTypes = {
  events: PropTypes.array,
  loading: PropTypes.bool,
};

export default RecentActivityWidget;
