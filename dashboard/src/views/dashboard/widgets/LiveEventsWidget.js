import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
import { Zap } from "lucide-react";
import { WidgetCard } from "@/components/widgets/WidgetCard";
import { LiveDot } from "@/components/widgets/LiveDot";
import { SkeletonRows } from "@/components/widgets/Skeleton";
import { EmptyState } from "@/components/ui/AsyncStates";
import { useAuth } from "@/contexts/AuthContext";
import { useRealtimeChannel } from "@/hooks/useRealtimeChannel";
import { cn } from "@/lib/utils";

const timeAgo = (iso) => {
  const seconds = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (seconds < 5) return "just now";
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  return `${Math.floor(minutes / 60)}h ago`;
};

export const LiveEventsWidget = ({ initialEvents = [], loading }) => {
  const { activeOrg } = useAuth();
  const [events, setEvents] = useState(initialEvents);
  const [flashId, setFlashId] = useState(null);

  useEffect(() => setEvents(initialEvents), [initialEvents]);

  useRealtimeChannel(
    activeOrg ? `live-events-${activeOrg.id}` : null,
    [
      {
        event: "INSERT",
        table: "token_logs",
        filter: activeOrg ? `org_id=eq.${activeOrg.id}` : undefined,
        onEvent: (payload) => {
          const row = payload.new;
          setFlashId(row.id);
          setEvents((prev) =>
            [
              {
                id: row.id,
                token: row.token,
                tokenName: row.token,
                event: row.event,
                ipAddress: row.ip_address,
                country: row.country,
                city: row.city,
                timestamp: row.timestamp,
              },
              ...prev,
            ].slice(0, 15),
          );
        },
      },
    ],
    { enabled: Boolean(activeOrg) },
  );

  return (
    <WidgetCard
      title="Live Events"
      icon={Zap}
      actions={<LiveDot color="accent" label="live" />}
      bodyClassName="p-0"
    >
      <div className="max-h-80 overflow-y-auto py-1">
        {loading ? (
          <div className="px-3 py-2">
            <SkeletonRows rows={5} />
          </div>
        ) : events.length === 0 ? (
          <EmptyState>
            No honeytoken activity yet — this feed lights up the moment one is
            touched.
          </EmptyState>
        ) : (
          events.map((e) => (
            <div
              key={e.id}
              className={cn(
                "flex items-center justify-between px-3 py-2 transition-colors duration-1000",
                flashId === e.id ? "bg-primary/5" : "",
              )}
            >
              <div className="flex flex-col">
                <span className="text-xs font-semibold">{e.event}</span>
                <span className="text-[11px] text-muted-foreground text-mono">
                  {e.tokenName || e.token}
                </span>
              </div>
              <div className="text-right">
                <div className="text-xs text-mono">
                  {e.ipAddress || "unknown"}
                </div>
                <div className="text-[11px] text-muted-foreground">
                  {timeAgo(e.timestamp)}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </WidgetCard>
  );
};

LiveEventsWidget.propTypes = {
  initialEvents: PropTypes.array,
  loading: PropTypes.bool,
};

export default LiveEventsWidget;
