import React, { useCallback, useEffect, useState } from "react";
import { toast } from "react-toastify";
import { alertsApi } from "@/api/alerts.api";
import { useAuth } from "@/contexts/AuthContext";
import { useRealtimeChannel } from "@/hooks/useRealtimeChannel";
import { PageHeader } from "@/components/ui/PageHeader";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { AsyncBoundary } from "@/components/ui/AsyncStates";
import { SEVERITY_COLORS, ALERT_STATUS_COLORS } from "@/constants/badges";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";

const STATUS_FILTERS = ["open", "acknowledged", "resolved", "all"];

const Alerts = () => {
  const { activeOrg, isAtLeast } = useAuth();
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statusFilter, setStatusFilter] = useState("open");

  const canResolve = isAtLeast("analyst");

  const load = useCallback(async () => {
    if (!activeOrg) return;
    setLoading(true);
    setError(null);
    try {
      const { data } = await alertsApi.list(
        statusFilter === "all" ? {} : { status: statusFilter },
      );
      setAlerts(data.data);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to load alerts");
    } finally {
      setLoading(false);
    }
  }, [activeOrg, statusFilter]);

  useEffect(() => {
    load();
  }, [load]);

  // Live updates: any INSERT/UPDATE on alerts for this org reflects
  // instantly without a manual refresh.
  useRealtimeChannel(
    activeOrg ? `alerts-${activeOrg.id}` : null,
    [
      {
        event: "INSERT",
        table: "alerts",
        filter: activeOrg ? `org_id=eq.${activeOrg.id}` : undefined,
        onEvent: (payload) => {
          toast.warn(`🚨 New alert: ${payload.new.message}`);
          setAlerts((prev) =>
            statusFilter === "all" || statusFilter === payload.new.status
              ? [payload.new, ...prev]
              : prev,
          );
        },
      },
      {
        event: "UPDATE",
        table: "alerts",
        filter: activeOrg ? `org_id=eq.${activeOrg.id}` : undefined,
        onEvent: (payload) =>
          setAlerts((prev) =>
            prev.map((a) => (a.id === payload.new.id ? payload.new : a)),
          ),
      },
    ],
    { enabled: Boolean(activeOrg) },
  );

  const updateStatus = async (id, status) => {
    try {
      await alertsApi.updateStatus(id, status);
      toast.success(`Alert marked ${status}`);
      setAlerts((prev) =>
        statusFilter === "all"
          ? prev.map((a) => (a.id === id ? { ...a, status } : a))
          : prev.filter((a) => a.id !== id),
      );
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to update alert");
    }
  };

  return (
    <div>
      <PageHeader
        title="Alerts"
        actions={
          <div className="flex gap-1 rounded-md bg-muted p-0.5">
            {STATUS_FILTERS.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setStatusFilter(s)}
                className={cn(
                  "rounded px-2.5 py-1 text-xs font-medium capitalize transition-colors",
                  statusFilter === s
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                {s}
              </button>
            ))}
          </div>
        }
      />
      <Card>
        <CardContent className="p-0">
          <AsyncBoundary
            loading={loading}
            error={error}
            isEmpty={alerts.length === 0}
            emptyMessage="No alerts here."
          >
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Message</TableHead>
                  <TableHead>Token</TableHead>
                  <TableHead>Severity</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Time</TableHead>
                  {canResolve && <TableHead />}
                </TableRow>
              </TableHeader>
              <TableBody>
                {alerts.map((a) => (
                  <TableRow key={a.id}>
                    <TableCell className="max-w-[280px] whitespace-normal">
                      {a.message}
                    </TableCell>
                    <TableCell>
                      <code className="text-xs text-mono">{a.token}</code>
                    </TableCell>
                    <TableCell>
                      <StatusBadge
                        value={a.severity}
                        colorMap={SEVERITY_COLORS}
                      />
                    </TableCell>
                    <TableCell>
                      <StatusBadge
                        value={a.status}
                        colorMap={ALERT_STATUS_COLORS}
                      />
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {new Date(a.created_at).toLocaleString()}
                    </TableCell>
                    {canResolve && (
                      <TableCell>
                        {a.status !== "resolved" && (
                          <div className="flex gap-1.5">
                            {a.status === "open" && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() =>
                                  updateStatus(a.id, "acknowledged")
                                }
                              >
                                Acknowledge
                              </Button>
                            )}
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => updateStatus(a.id, "resolved")}
                            >
                              Resolve
                            </Button>
                          </div>
                        )}
                      </TableCell>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </AsyncBoundary>
        </CardContent>
      </Card>
    </div>
  );
};

export default Alerts;
