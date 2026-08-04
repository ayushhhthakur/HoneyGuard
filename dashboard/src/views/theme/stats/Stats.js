import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
import { useParams } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { tokensApi } from "@/api/tokens.api";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { ErrorState, EmptyState } from "@/components/ui/AsyncStates";
import { Separator } from "@/components/ui/separator";

const StatRow = ({ label, value }) => (
  <div className="flex items-center justify-between py-2 text-xs">
    <span className="text-muted-foreground">{label}</span>
    <span className="font-semibold">{value}</span>
  </div>
);

StatRow.propTypes = {
  label: PropTypes.string.isRequired,
  value: PropTypes.node,
};

const Stats = () => {
  const { token } = useParams();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const response = await tokensApi.getStats(token);
        if (response.data.success) setStats(response.data.data);
        else setError(response.data.error || "Failed to fetch stats");
      } catch (err) {
        setError(
          err.response?.data?.error ||
            err.message ||
            "An error occurred while fetching stats",
        );
      } finally {
        setLoading(false);
      }
    };
    if (token) fetchStats();
  }, [token]);

  if (loading) {
    return (
      <div className="flex justify-center p-8">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error) return <ErrorState message={error} />;
  if (!stats)
    return <EmptyState>No statistics available for this token.</EmptyState>;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="normal-case tracking-normal text-foreground">
          Token Statistics
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="divide-y divide-border">
          <StatRow label="Total Accesses" value={stats.total_accesses} />
          <StatRow
            label="Successful Accesses"
            value={stats.successful_accesses}
          />
          <StatRow label="Failed Accesses" value={stats.failed_accesses} />
          <StatRow label="Unique Visitors" value={stats.unique_visitors} />
          <StatRow
            label="Latest Access"
            value={
              stats.latest_access
                ? new Date(stats.latest_access).toLocaleString()
                : "N/A"
            }
          />
        </div>

        {stats.logs && stats.logs.length > 0 && (
          <>
            <Separator className="my-4" />
            <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Access Logs
            </h3>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Timestamp</TableHead>
                  <TableHead>IP Address</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Browser</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {stats.logs.map((log, index) => (
                  <TableRow key={index}>
                    <TableCell>
                      {new Date(log.timestamp).toLocaleString()}
                    </TableCell>
                    <TableCell className="text-mono">
                      {log.ip_address}
                    </TableCell>
                    <TableCell>{`${log.city}, ${log.country}`}</TableCell>
                    <TableCell>{log.browser}</TableCell>
                    <TableCell className="capitalize">{log.status}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default Stats;
