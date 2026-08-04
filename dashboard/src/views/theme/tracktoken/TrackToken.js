import React, { useState, useEffect, useCallback } from "react";
import PropTypes from "prop-types";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { Copy, Loader2 } from "lucide-react";
import API_URL from "@/config/api.js";
import { tokensApi } from "@/api/tokens.api";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { ErrorState, EmptyState } from "@/components/ui/AsyncStates";

const InfoRow = ({ label, value }) => (
  <>
    <div className="flex items-center justify-between px-4 py-2.5 text-xs">
      <span className="font-medium text-foreground/80">{label}</span>
      <span className="text-right text-muted-foreground">{value ?? "N/A"}</span>
    </div>
    <Separator />
  </>
);

InfoRow.propTypes = {
  label: PropTypes.node.isRequired,
  value: PropTypes.node,
};

const STATUS_VARIANT = {
  success: "success",
  error: "destructive",
  warning: "warning",
  info: "default",
};

const TrackToken = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [tokenData, setTokenData] = useState(null);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTokenData = async () => {
      try {
        const tokenResponse = await tokensApi.getByValue(token);
        if (tokenResponse.data.success) setTokenData(tokenResponse.data.data);
        else setError(tokenResponse.data.error || "Failed to fetch token data");

        const logsResponse = await tokensApi.getLogs(token);
        if (logsResponse.data.success)
          setLogs(
            Array.isArray(logsResponse.data.data) ? logsResponse.data.data : [],
          );
        else setError(logsResponse.data.error || "Failed to fetch token logs");
      } catch (err) {
        setError(
          err.response?.data?.error || err.message || "Failed to fetch data",
        );
      } finally {
        setLoading(false);
      }
    };
    fetchTokenData();
  }, [token]);

  const formatDate = (dateString) => new Date(dateString).toLocaleString();

  const copyToClipboard = useCallback((text) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard!");
  }, []);

  const getImageTrackingUrl = useCallback(
    (tokenValue) => `${API_URL.replace(/\/$/, "")}/image/${tokenValue}`,
    [],
  );

  const redirectToStats = useCallback(
    () => navigate(`/utils/track/stats/${token}`),
    [navigate, token],
  );

  if (loading) {
    return (
      <div className="flex justify-center p-8">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error) return <ErrorState message={error} />;

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="normal-case tracking-normal text-foreground">
            Token Information
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <InfoRow
            label="Token"
            value={<code className="text-mono">{token}</code>}
          />

          {tokenData?.category === "image" && (
            <>
              <div className="flex items-center justify-between px-4 py-2.5 text-xs">
                <span className="font-medium text-foreground/80">
                  Image URL
                </span>
                <div className="flex items-center gap-2">
                  <a
                    href={getImageTrackingUrl(token)}
                    target="_blank"
                    rel="noreferrer"
                    className="text-primary hover:underline"
                  >
                    View Image
                  </a>
                  <button
                    type="button"
                    onClick={() => copyToClipboard(getImageTrackingUrl(token))}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    <Copy className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
              <Separator />
              <InfoRow label="Filename" value={tokenData?.filename} />
              <InfoRow label="Mimetype" value={tokenData?.mimetype} />
              <InfoRow
                label="Size"
                value={tokenData?.size ? `${tokenData.size} bytes` : undefined}
              />
            </>
          )}

          {tokenData?.category === "aws" && (
            <>
              <InfoRow
                label="AWS Region"
                value={tokenData?.metadata?.region || "N/A"}
              />
              <InfoRow
                label="AWS Service"
                value={tokenData?.metadata?.service || "N/A"}
              />
            </>
          )}

          {tokenData?.category === "financial" && (
            <InfoRow
              label="Financial Type"
              value={tokenData?.metadata?.type || "N/A"}
            />
          )}

          {tokenData?.category === "healthcare" && (
            <>
              <InfoRow
                label="Healthcare System"
                value={tokenData?.metadata?.system || "N/A"}
              />
              <InfoRow
                label="Patient ID Format"
                value={tokenData?.metadata?.patientIdFormat || "N/A"}
              />
            </>
          )}

          <div className="flex items-center justify-between px-4 py-2.5 text-xs">
            <span className="font-medium text-foreground/80">Status</span>
            <Badge variant={tokenData?.is_active ? "success" : "destructive"}>
              {tokenData?.is_active ? "Active" : "Inactive"}
            </Badge>
          </div>
          <Separator />
          <InfoRow
            label="Created At"
            value={
              tokenData?.created_at ? formatDate(tokenData.created_at) : "N/A"
            }
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="normal-case tracking-normal text-foreground">
            Token Activity Logs
          </CardTitle>
        </CardHeader>
        <CardContent className={logs.length === 0 ? undefined : "p-0"}>
          {logs.length === 0 ? (
            <EmptyState>No logs found for this token.</EmptyState>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Timestamp</TableHead>
                  <TableHead>Event</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>IP Address</TableHead>
                  <TableHead>OS</TableHead>
                  <TableHead>Browser</TableHead>
                  <TableHead>Device</TableHead>
                  <TableHead>Country</TableHead>
                  <TableHead>City</TableHead>
                  <TableHead />
                </TableRow>
              </TableHeader>
              <TableBody>
                {logs.map((stat, index) => (
                  <TableRow key={index}>
                    <TableCell>{formatDate(stat.timestamp)}</TableCell>
                    <TableCell>{stat.event}</TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          STATUS_VARIANT[String(stat.status).toLowerCase()] ||
                          "default"
                        }
                        className="uppercase"
                      >
                        {stat.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-mono">
                      {stat.ip_address}
                    </TableCell>
                    <TableCell>{stat.os}</TableCell>
                    <TableCell>{stat.browser}</TableCell>
                    <TableCell>{stat.device}</TableCell>
                    <TableCell>{stat.country}</TableCell>
                    <TableCell>{stat.city}</TableCell>
                    <TableCell>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={redirectToStats}
                      >
                        View
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default TrackToken;
