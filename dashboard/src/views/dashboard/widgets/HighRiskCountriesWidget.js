import React from "react";
import PropTypes from "prop-types";
import { AlertTriangle } from "lucide-react";
import { WidgetCard } from "@/components/widgets/WidgetCard";
import { SkeletonRows } from "@/components/widgets/Skeleton";
import { EmptyState } from "@/components/ui/AsyncStates";

export const HighRiskCountriesWidget = ({ countries = [], loading }) => {
  const max = Math.max(...countries.map((c) => c.count), 1);

  return (
    <WidgetCard title="High-Risk Countries" icon={AlertTriangle}>
      {loading ? (
        <SkeletonRows rows={5} />
      ) : countries.length === 0 ? (
        <EmptyState>No geolocated activity yet.</EmptyState>
      ) : (
        <div className="flex flex-col gap-2.5">
          {countries.map((c, i) => (
            <div key={c.country} className="flex items-center gap-2">
              <span className="w-4 text-[11px] text-muted-foreground text-mono">
                {i + 1}
              </span>
              <div className="flex-1">
                <div className="mb-1 flex justify-between text-xs">
                  <span>{c.country}</span>
                  <span className="text-muted-foreground text-mono">
                    {c.count}{" "}
                    <span className="text-[10px]">({c.uniqueIps} IPs)</span>
                  </span>
                </div>
                <div className="h-1 overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-destructive transition-all duration-700"
                    style={{ width: `${(c.count / max) * 100}%` }}
                  />
                </div>
              </div>
            </div>
          ))}
          <div className="mt-1 text-[11px] text-muted-foreground">
            Ranked by observed hit volume against your honeytokens, not a
            geopolitical assessment.
          </div>
        </div>
      )}
    </WidgetCard>
  );
};

HighRiskCountriesWidget.propTypes = {
  countries: PropTypes.array,
  loading: PropTypes.bool,
};

export default HighRiskCountriesWidget;
