import React from "react";
import PropTypes from "prop-types";
import { ShieldAlert } from "lucide-react";
import { WidgetCard } from "@/components/widgets/WidgetCard";
import { ThreatScoreGauge } from "@/components/widgets/ThreatScoreGauge";
import { SkeletonWidget } from "@/components/widgets/Skeleton";

export const ThreatScoreWidget = ({ threat, loading }) => (
  <WidgetCard title="Threat Score" icon={ShieldAlert}>
    {loading || !threat ? (
      <SkeletonWidget rows={2} />
    ) : (
      <div className="flex items-center gap-3">
        <ThreatScoreGauge score={threat.score} level={threat.level} size={92} />
        <div className="flex flex-1 flex-col gap-1">
          {threat.breakdown.map((b) => (
            <div key={b.label} className="flex justify-between text-xs">
              <span className="text-muted-foreground">{b.label}</span>
              <span className="font-semibold text-mono">
                {typeof b.value === "boolean"
                  ? b.value
                    ? "yes"
                    : "no"
                  : b.value}
              </span>
            </div>
          ))}
        </div>
      </div>
    )}
  </WidgetCard>
);

ThreatScoreWidget.propTypes = {
  threat: PropTypes.shape({
    score: PropTypes.number,
    level: PropTypes.string,
    breakdown: PropTypes.array,
  }),
  loading: PropTypes.bool,
};

export default ThreatScoreWidget;
