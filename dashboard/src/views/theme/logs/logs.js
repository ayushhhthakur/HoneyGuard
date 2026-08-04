import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  Search,
  Download,
  Info,
  AlertTriangle,
  Bug,
  CheckCircle2,
  XCircle,
  Calendar,
} from "lucide-react";
import { format } from "date-fns";
import { statsApi } from "@/api/stats.api";
import { PageHeader } from "@/components/ui/PageHeader";
import { AsyncBoundary } from "@/components/ui/AsyncStates";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";

const LOG_LEVELS = {
  info: { variant: "default", icon: Info },
  warning: { variant: "warning", icon: AlertTriangle },
  error: { variant: "destructive", icon: Bug },
  success: { variant: "success", icon: CheckCircle2 },
};

const TIME_RANGES = [
  { value: "1h", label: "Last hour" },
  { value: "24h", label: "Last 24 hours" },
  { value: "7d", label: "Last 7 days" },
  { value: "30d", label: "Last 30 days" },
];

const Logs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedLevel, setSelectedLevel] = useState("all");
  const [selectedTimeRange, setSelectedTimeRange] = useState("24h");

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await statsApi.logs({
        timeRange: selectedTimeRange,
        level: selectedLevel !== "all" ? selectedLevel : undefined,
      });
      if (response.data.success) setLogs(response.data.data);
      else setError(response.data.error || "Failed to fetch logs");
    } catch (err) {
      setError(
        err.response?.data?.error ||
          err.message ||
          "An error occurred while fetching logs",
      );
    } finally {
      setLoading(false);
    }
  }, [selectedTimeRange, selectedLevel]);

  useEffect(() => {
    fetchLogs();
    // Poll for updates rather than a realtime subscription — this view is
    // a filtered/formatted read model, not a raw table stream.
    const interval = setInterval(fetchLogs, 30000);
    return () => clearInterval(interval);
  }, [fetchLogs]);

  const filteredLogs = useMemo(
    () =>
      logs.filter((log) => {
        const term = searchTerm.toLowerCase();
        return (
          term === "" ||
          log.message.toLowerCase().includes(term) ||
          log.source.toLowerCase().includes(term) ||
          (log.ip_address || "").toLowerCase().includes(term)
        );
      }),
    [logs, searchTerm],
  );

  const exportLogs = () => {
    const csv = [
      ["Timestamp", "Level", "Message", "Source", "IP Address"].join(","),
      ...filteredLogs.map((log) =>
        [
          format(new Date(log.timestamp), "yyyy-MM-dd HH:mm:ss"),
          log.level,
          `"${log.message.replace(/"/g, '""')}"`,
          log.source,
          log.ip_address,
        ].join(","),
      ),
    ].join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `logs-${format(new Date(), "yyyy-MM-dd-HH-mm-ss")}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  return (
    <div>
      <PageHeader
        title="Event Log"
        subtitle="Raw honeytoken interaction stream"
        actions={
          <Button variant="outline" size="sm" onClick={exportLogs}>
            <Download className="h-3.5 w-3.5" /> Export CSV
          </Button>
        }
      />

      <div className="mb-3 grid grid-cols-1 gap-2 sm:grid-cols-3">
        <div className="relative">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search logs…"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8"
          />
        </div>
        <Select value={selectedLevel} onValueChange={setSelectedLevel}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All levels</SelectItem>
            {Object.keys(LOG_LEVELS).map((level) => (
              <SelectItem key={level} value={level} className="capitalize">
                {level}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={selectedTimeRange} onValueChange={setSelectedTimeRange}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {TIME_RANGES.map((range) => (
              <SelectItem key={range.value} value={range.value}>
                {range.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <AsyncBoundary
        loading={loading}
        error={error}
        isEmpty={filteredLogs.length === 0}
        emptyMessage="No logs found matching your criteria."
      >
        <div className="flex flex-col gap-2">
          {filteredLogs.map((log, index) => {
            const meta = LOG_LEVELS[log.level] || {
              variant: "secondary",
              icon: XCircle,
            };
            const Icon = meta.icon;
            return (
              <Card
                key={index}
                className="transition-colors hover:border-foreground/20"
              >
                <CardContent className="p-3">
                  <div className="mb-1.5 flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <Icon className="h-3.5 w-3.5 text-muted-foreground" />
                      <Badge variant={meta.variant} className="uppercase">
                        {log.level}
                      </Badge>
                      <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        {format(
                          new Date(log.timestamp),
                          "MMM dd, yyyy HH:mm:ss",
                        )}
                      </span>
                    </div>
                    <div className="flex gap-1.5">
                      <Badge variant="outline" className="text-mono">
                        {log.source}
                      </Badge>
                      <Badge variant="outline" className="text-mono">
                        {log.ip_address}
                      </Badge>
                    </div>
                  </div>
                  <div className="pl-5 text-xs text-foreground">
                    {log.message}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </AsyncBoundary>
    </div>
  );
};

export default Logs;
