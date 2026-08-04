import React from "react";
import PropTypes from "prop-types";
import { Fingerprint, ArrowRight } from "lucide-react";
import { WidgetCard } from "@/components/widgets/WidgetCard";
import { AnimatedNumber } from "@/components/widgets/AnimatedNumber";
import { SkeletonWidget } from "@/components/widgets/Skeleton";

export const HoneytokensWidget = ({ total, logs, loading }) => (
  <WidgetCard
    title="Honeytokens"
    icon={Fingerprint}
    actions={
      <a
        href="#/utils/Tokens"
        className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
      >
        Manage <ArrowRight className="h-3 w-3" />
      </a>
    }
  >
    {loading ? (
      <SkeletonWidget rows={1} />
    ) : (
      <div className="flex h-full flex-col justify-center">
        <div className="text-2xl font-bold text-foreground">
          <AnimatedNumber value={total} />
        </div>
        <div className="mt-0.5 text-xs text-muted-foreground">
          deployed &middot; <AnimatedNumber value={logs} /> interactions logged
        </div>
      </div>
    )}
  </WidgetCard>
);

HoneytokensWidget.propTypes = {
  total: PropTypes.number,
  logs: PropTypes.number,
  loading: PropTypes.bool,
};

export default HoneytokensWidget;
