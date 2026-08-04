import React from "react";
import PropTypes from "prop-types";
import { LayoutGrid } from "lucide-react";
import { WidgetCard } from "@/components/widgets/WidgetCard";
import { SkeletonRows } from "@/components/widgets/Skeleton";
import { EmptyState } from "@/components/ui/AsyncStates";

export const MitreAttackWidget = ({ mitre = [], loading }) => {
  const max = Math.max(...mitre.map((m) => m.count), 1);

  return (
    <WidgetCard title="MITRE ATT&CK Coverage" icon={LayoutGrid}>
      {loading ? (
        <SkeletonRows rows={4} />
      ) : mitre.length === 0 ? (
        <EmptyState>
          No mapped activity yet — tactics appear here as honeytokens are
          touched.
        </EmptyState>
      ) : (
        <div className="flex flex-col gap-2.5">
          {mitre.map((m) => (
            <div key={m.tactic}>
              <div className="mb-1 flex justify-between text-xs">
                <span>{m.tactic}</span>
                <span className="text-muted-foreground text-mono">
                  {m.count}
                </span>
              </div>
              <div className="h-1 overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-primary transition-all duration-700"
                  style={{ width: `${(m.count / max) * 100}%` }}
                />
              </div>
            </div>
          ))}
          <div className="mt-1 text-[11px] text-muted-foreground">
            Heuristic mapping from honeytoken event type to tactic — a signal
            category, not confirmed technique attribution.
          </div>
        </div>
      )}
    </WidgetCard>
  );
};

MitreAttackWidget.propTypes = {
  mitre: PropTypes.array,
  loading: PropTypes.bool,
};

export default MitreAttackWidget;
