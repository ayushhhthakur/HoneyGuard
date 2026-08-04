import React, { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { fingerprintsApi } from "@/api/fingerprints.api";
import { useAuth } from "@/contexts/AuthContext";
import { useRealtimeChannel } from "@/hooks/useRealtimeChannel";
import { AsyncBoundary } from "@/components/ui/AsyncStates";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
} from "@/components/ui/tooltip";

const Fingerprints = () => {
  const { activeOrg } = useAuth();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(() => {
    if (!activeOrg) return;
    setLoading(true);
    setError(null);
    fingerprintsApi
      .list()
      .then(({ data }) => setRows(data.data))
      .catch((err) =>
        setError(err.response?.data?.error || "Failed to load fingerprints"),
      )
      .finally(() => setLoading(false));
  }, [activeOrg]);

  useEffect(() => {
    load();
  }, [load]);

  useRealtimeChannel(
    activeOrg ? `fingerprints-${activeOrg.id}` : null,
    [
      {
        event: "INSERT",
        table: "device_fingerprints",
        filter: activeOrg ? `org_id=eq.${activeOrg.id}` : undefined,
        onEvent: (payload) => setRows((prev) => [payload.new, ...prev]),
      },
    ],
    { enabled: Boolean(activeOrg) },
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="normal-case text-sm font-semibold tracking-normal text-foreground">
          Device fingerprints
        </CardTitle>
        <CardDescription>
          Deep client signals captured when a honeytoken is touched
        </CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        <AsyncBoundary
          loading={loading}
          error={error}
          isEmpty={rows.length === 0}
          emptyMessage={
            <>
              No fingerprints captured yet. They show up here as soon as someone
              opens a honeytoken that embeds the collector script (
              <code>/fp.js</code>).
            </>
          }
        >
          <TooltipProvider>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Token</TableHead>
                  <TableHead>IP</TableHead>
                  <TableHead>Platform</TableHead>
                  <TableHead>Screen</TableHead>
                  <TableHead>Timezone</TableHead>
                  <TableHead>Fonts</TableHead>
                  <TableHead>Flags</TableHead>
                  <TableHead>Time</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((r) => (
                  <TableRow key={r.id}>
                    <TableCell>
                      <Link
                        to={`/fingerprints/${r.id}`}
                        className="text-primary hover:underline"
                      >
                        <code className="text-mono">{r.token}</code>
                      </Link>
                    </TableCell>
                    <TableCell className="text-mono">{r.ip_address}</TableCell>
                    <TableCell>{r.platform}</TableCell>
                    <TableCell>
                      {r.screen_resolution} @{r.pixel_ratio}x
                    </TableCell>
                    <TableCell>{r.timezone}</TableCell>
                    <TableCell>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <span className="cursor-default">
                            {(r.fonts || []).length} detected
                          </span>
                        </TooltipTrigger>
                        <TooltipContent>
                          {(r.fonts || []).join(", ") || "none detected"}
                        </TooltipContent>
                      </Tooltip>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        {r.webdriver && (
                          <Badge variant="destructive">webdriver</Badge>
                        )}
                        {r.incognito_guess && (
                          <Badge variant="secondary">private?</Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {new Date(r.created_at).toLocaleString()}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TooltipProvider>
        </AsyncBoundary>
      </CardContent>
    </Card>
  );
};

export default Fingerprints;
