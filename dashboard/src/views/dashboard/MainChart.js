import React, { useCallback, useEffect, useState } from "react";
import PropTypes from "prop-types";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { LineChart } from "lucide-react";
import { statsApi } from "@/api/stats.api";
import { useAuth } from "@/contexts/AuthContext";
import { useRealtimeChannel } from "@/hooks/useRealtimeChannel";
import { WidgetCard } from "@/components/widgets/WidgetCard";
import { EmptyState } from "@/components/ui/AsyncStates";

const MainChart = ({ compact = false }) => {
  const { activeOrg } = useAuth();
  const [tokenStats, setTokenStats] = useState({ labels: [], values: [] });
  const [activityStats, setActivityStats] = useState({
    labels: [],
    values: [],
  });

  const load = useCallback(async () => {
    if (!activeOrg) return;
    try {
      const [tokensRes, activityRes] = await Promise.all([
        statsApi.tokenSeries(),
        statsApi.activitySeries(),
      ]);
      if (tokensRes.data.success) setTokenStats(tokensRes.data.data);
      if (activityRes.data.success) setActivityStats(activityRes.data.data);
    } catch (err) {
      console.error("Failed to load chart data:", err);
    }
  }, [activeOrg]);

  useEffect(() => {
    load();
  }, [load]);

  // Live-refresh whenever a new log or token lands for this org, instead of
  // polling — Supabase Realtime pushes it to us.
  useRealtimeChannel(
    activeOrg ? `main-chart-${activeOrg.id}` : null,
    [
      {
        event: "INSERT",
        table: "token_logs",
        filter: activeOrg ? `org_id=eq.${activeOrg.id}` : undefined,
        onEvent: load,
      },
      {
        event: "INSERT",
        table: "tokens",
        filter: activeOrg ? `org_id=eq.${activeOrg.id}` : undefined,
        onEvent: load,
      },
    ],
    { enabled: Boolean(activeOrg) },
  );

  // Merge both series onto a shared date axis so the chart doesn't break
  // when tokens and activity were logged on different days.
  const labels = Array.from(
    new Set([...tokenStats.labels, ...activityStats.labels]),
  ).sort();
  const tokensByDate = Object.fromEntries(
    tokenStats.labels.map((l, i) => [l, tokenStats.values[i]]),
  );
  const activityByDate = Object.fromEntries(
    activityStats.labels.map((l, i) => [l, activityStats.values[i]]),
  );
  const chartData = labels.map((d) => ({
    date: d.slice(5), // MM-DD
    tokens: tokensByDate[d] || 0,
    activity: activityByDate[d] || 0,
  }));
  const noData = labels.length === 0;

  return (
    <WidgetCard title="Threat Trends" icon={LineChart} bodyClassName="pt-1">
      {noData ? (
        <EmptyState>
          No activity yet — deploy a honeytoken to start seeing data here.
        </EmptyState>
      ) : (
        <ResponsiveContainer width="100%" height={compact ? 190 : 260}>
          <AreaChart
            data={chartData}
            margin={{ top: 4, right: 4, left: -20, bottom: 0 }}
          >
            <defs>
              <linearGradient id="tokensFill" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="0%"
                  stopColor="hsl(var(--primary))"
                  stopOpacity={0.25}
                />
                <stop
                  offset="100%"
                  stopColor="hsl(var(--primary))"
                  stopOpacity={0}
                />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} stroke="hsl(var(--border))" />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
              tickLine={false}
              axisLine={false}
              allowDecimals={false}
              width={28}
            />
            <Tooltip
              contentStyle={{
                fontSize: 12,
                borderRadius: 8,
                border: "1px solid hsl(var(--border))",
              }}
              labelStyle={{ fontWeight: 600 }}
            />
            <Legend wrapperStyle={{ fontSize: 11 }} />
            <Area
              type="monotone"
              dataKey="tokens"
              name="Tokens Created"
              stroke="hsl(var(--primary))"
              fill="url(#tokensFill)"
              strokeWidth={2}
            />
            <Area
              type="monotone"
              dataKey="activity"
              name="Honeytoken Activity"
              stroke="hsl(var(--warning))"
              fill="transparent"
              strokeWidth={2}
            />
          </AreaChart>
        </ResponsiveContainer>
      )}
    </WidgetCard>
  );
};

MainChart.propTypes = {
  compact: PropTypes.bool,
};

export default MainChart;
