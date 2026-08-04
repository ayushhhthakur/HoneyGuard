import React from "react";
import { RefreshCw } from "lucide-react";

import { statsApi } from "@/api/stats.api";
import { useAuth } from "@/contexts/AuthContext";
import { useAsync } from "@/hooks/useAsync";
import { useRealtimeChannel } from "@/hooks/useRealtimeChannel";
import { Button } from "@/components/ui/button";

import MainChart from "./MainChart";
import ThreatScoreWidget from "./widgets/ThreatScoreWidget";
import ActiveIncidentsWidget from "./widgets/ActiveIncidentsWidget";
import HoneytokensWidget from "./widgets/HoneytokensWidget";
import LiveEventsWidget from "./widgets/LiveEventsWidget";
import AttackTimelineWidget from "./widgets/AttackTimelineWidget";
import WorldMapWidget from "./widgets/WorldMapWidget";
import MitreAttackWidget from "./widgets/MitreAttackWidget";
import TokenCategoriesWidget from "./widgets/TokenCategoriesWidget";
import HighRiskCountriesWidget from "./widgets/HighRiskCountriesWidget";
import RecentActivityWidget from "./widgets/RecentActivityWidget";

const Dashboard = () => {
  const { activeOrg } = useAuth();

  const {
    data: bundle,
    loading,
    reload,
    setData,
  } = useAsync(() => statsApi.dashboard(), [activeOrg?.id], {
    enabled: Boolean(activeOrg),
  });

  // Live counters on the summary tiles — bump instantly on realtime insert
  // instead of waiting for the next full reload.
  useRealtimeChannel(
    activeOrg ? `dashboard-summary-${activeOrg.id}` : null,
    [
      {
        event: "INSERT",
        table: "tokens",
        filter: activeOrg ? `org_id=eq.${activeOrg.id}` : undefined,
        onEvent: () =>
          setData((b) =>
            b
              ? {
                  ...b,
                  summary: {
                    ...b.summary,
                    total_tokens: b.summary.total_tokens + 1,
                  },
                }
              : b,
          ),
      },
      {
        event: "INSERT",
        table: "token_logs",
        filter: activeOrg ? `org_id=eq.${activeOrg.id}` : undefined,
        onEvent: () =>
          setData((b) =>
            b
              ? {
                  ...b,
                  summary: {
                    ...b.summary,
                    total_logs: b.summary.total_logs + 1,
                  },
                }
              : b,
          ),
      },
      {
        event: "INSERT",
        table: "alerts",
        filter: activeOrg ? `org_id=eq.${activeOrg.id}` : undefined,
        onEvent: () =>
          setData((b) =>
            b
              ? {
                  ...b,
                  summary: {
                    ...b.summary,
                    open_alerts: b.summary.open_alerts + 1,
                  },
                }
              : b,
          ),
      },
    ],
    { enabled: Boolean(activeOrg) },
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-2">
        <div>
          <h2 className="text-lg font-semibold tracking-tight">
            Security Operations Overview
          </h2>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {activeOrg?.name} &middot; live signal from your deployed
            honeytokens
          </p>
        </div>
        <Button variant="outline" size="icon" onClick={reload} title="Refresh">
          <RefreshCw className="h-3.5 w-3.5" />
        </Button>
      </div>

      {/* Row 1 — headline metrics */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <ThreatScoreWidget threat={bundle?.threat} loading={loading} />
        <ActiveIncidentsWidget
          count={bundle?.summary?.open_alerts}
          loading={loading}
        />
        <HoneytokensWidget
          total={bundle?.summary?.total_tokens}
          logs={bundle?.summary?.total_logs}
          loading={loading}
        />
        <div className="sm:col-span-2 xl:col-span-1">
          <MainChart compact />
        </div>
      </div>

      {/* Row 2 — live feeds + spatial context */}
      <div className="grid grid-cols-1 gap-3 lg:grid-cols-3">
        <LiveEventsWidget
          initialEvents={bundle?.recentEvents}
          loading={loading}
        />
        <AttackTimelineWidget events={bundle?.recentEvents} loading={loading} />
        <WorldMapWidget />
      </div>

      {/* Row 3 — intelligence breakdowns */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <MitreAttackWidget mitre={bundle?.mitre} loading={loading} />
        <TokenCategoriesWidget
          categories={bundle?.categories}
          loading={loading}
        />
        <HighRiskCountriesWidget
          countries={bundle?.countries}
          loading={loading}
        />
        <RecentActivityWidget events={bundle?.recentEvents} loading={loading} />
      </div>
    </div>
  );
};

export default Dashboard;
