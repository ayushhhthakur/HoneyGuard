import React, { useState, useEffect, useMemo } from "react";
import PropTypes from "prop-types";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { toast } from "react-toastify";
import {
  Copy,
  Trash2,
  Pencil,
  Search,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  LineChart,
  RefreshCw,
  Ban,
  Clock,
  Tag,
  Download,
  MoreVertical,
} from "lucide-react";
import API_URL from "@/config/api.js";
import { tokensApi } from "@/api/tokens.api";
import { AsyncBoundary } from "@/components/ui/AsyncStates";
import { PageHeader } from "@/components/ui/PageHeader";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
} from "@/components/ui/tooltip";

const TOKEN_STATUS_COLORS = {
  active: "success",
  rotated: "warning",
  expired: "secondary",
  revoked: "destructive",
};

const SortIcon = ({ field, sortField, sortDirection }) => {
  if (sortField !== field) return <ArrowUpDown className="h-3 w-3" />;
  return sortDirection === "asc" ? (
    <ArrowUp className="h-3 w-3" />
  ) : (
    <ArrowDown className="h-3 w-3" />
  );
};

SortIcon.propTypes = {
  field: PropTypes.string.isRequired,
  sortField: PropTypes.string.isRequired,
  sortDirection: PropTypes.oneOf(["asc", "desc"]).isRequired,
};

const Track = () => {
  const navigate = useNavigate();
  const [tokens, setTokens] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [sortField, setSortField] = useState("created_at");
  const [sortDirection, setSortDirection] = useState("desc");

  useEffect(() => {
    fetchTokens();
  }, []);

  const fetchTokens = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await tokensApi.list();
      if (response.data.success) setTokens(response.data.data);
      else setError(response.data.error || "Failed to fetch tokens");
    } catch (err) {
      setError(
        err.response?.data?.error ||
          err.message ||
          "An error occurred while fetching tokens",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success("Copied to clipboard!");
    } catch {
      toast.error("Failed to copy to clipboard");
    }
  };

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const sortedFilteredTokens = useMemo(() => {
    return tokens
      .filter((token) => {
        const matchesSearch =
          token.token.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (token.token_name || "")
            .toLowerCase()
            .includes(searchTerm.toLowerCase());
        const matchesCategory =
          selectedCategory === "all" || token.category === selectedCategory;
        return matchesSearch && matchesCategory;
      })
      .sort((a, b) => {
        const direction = sortDirection === "asc" ? 1 : -1;
        if (sortField === "created_at")
          return direction * (new Date(a.created_at) - new Date(b.created_at));
        return direction * (a[sortField] < b[sortField] ? -1 : 1);
      });
  }, [tokens, searchTerm, selectedCategory, sortField, sortDirection]);

  const handleDeleteToken = async (token) => {
    if (!window.confirm("Are you sure you want to delete this token?")) return;
    try {
      const response = await tokensApi.remove(token);
      if (response.data.success)
        setTokens((prev) => prev.filter((t) => t.token !== token));
      else toast.error(response.data.error || "Failed to delete token");
    } catch (err) {
      toast.error(
        err.response?.data?.error || "An error occurred while deleting token",
      );
    }
  };

  const handleRotateToken = async (token) => {
    const reason = window.prompt("Reason for rotation (optional):", "");
    if (reason === null) return;
    try {
      const { data } = await tokensApi.rotate(token, reason);
      toast.success(`Rotated — new token: ${data.data?.token || data.token}`);
      fetchTokens();
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to rotate token");
    }
  };

  const handleExpireToken = async (token) => {
    if (!window.confirm("Mark this token as expired?")) return;
    try {
      await tokensApi.expire(token);
      toast.success("Token marked expired");
      setTokens((prev) =>
        prev.map((t) => (t.token === token ? { ...t, status: "expired" } : t)),
      );
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to expire token");
    }
  };

  const handleRevokeToken = async (token) => {
    if (
      !window.confirm("Revoke this token? This marks it compromised/inactive.")
    )
      return;
    try {
      await tokensApi.revoke(token);
      toast.success("Token revoked");
      setTokens((prev) =>
        prev.map((t) => (t.token === token ? { ...t, status: "revoked" } : t)),
      );
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to revoke token");
    }
  };

  const handleEditTags = async (token, currentTags) => {
    const input = window.prompt(
      "Tags (comma separated):",
      (currentTags || []).join(", "),
    );
    if (input === null) return;
    const tags = input
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);
    try {
      await tokensApi.updateTags(token, tags);
      toast.success("Tags updated");
      setTokens((prev) =>
        prev.map((t) => (t.token === token ? { ...t, tags } : t)),
      );
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to update tags");
    }
  };

  const handleExportAll = async (fmt) => {
    try {
      const response = await tokensApi.exportTokens(fmt);
      const blob = new Blob([response.data], {
        type: fmt === "csv" ? "text/csv" : "application/json",
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `honeytokens-export.${fmt}`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to export tokens");
    }
  };

  return (
    <div>
      <PageHeader
        title="Deployed Tokens"
        actions={
          <>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <Download className="h-3.5 w-3.5" /> Export
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => handleExportAll("json")}>
                  Export as JSON
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleExportAll("csv")}>
                  Export as CSV
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Button size="sm" onClick={() => navigate("/utils/tokens")}>
              <Pencil className="h-3.5 w-3.5" /> Create New Token
            </Button>
          </>
        }
      />

      <Card>
        <CardContent className="p-4">
          <div className="mb-4 grid grid-cols-1 gap-2 sm:grid-cols-3">
            <div className="relative">
              <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search tokens…"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
            <Select
              value={selectedCategory}
              onValueChange={setSelectedCategory}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All categories</SelectItem>
                <SelectItem value="image">Image</SelectItem>
                <SelectItem value="aws">AWS</SelectItem>
                <SelectItem value="financial">Financial</SelectItem>
                <SelectItem value="healthcare">Healthcare</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <AsyncBoundary
            loading={loading}
            error={error}
            isEmpty={sortedFilteredTokens.length === 0}
            emptyMessage="No tokens found matching your criteria."
          >
            <TooltipProvider>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead
                      className="cursor-pointer select-none"
                      onClick={() => handleSort("token")}
                    >
                      <span className="flex items-center gap-1">
                        Token{" "}
                        <SortIcon
                          field="token"
                          sortField={sortField}
                          sortDirection={sortDirection}
                        />
                      </span>
                    </TableHead>
                    <TableHead
                      className="cursor-pointer select-none"
                      onClick={() => handleSort("category")}
                    >
                      <span className="flex items-center gap-1">
                        Category{" "}
                        <SortIcon
                          field="category"
                          sortField={sortField}
                          sortDirection={sortDirection}
                        />
                      </span>
                    </TableHead>
                    <TableHead
                      className="cursor-pointer select-none"
                      onClick={() => handleSort("token_name")}
                    >
                      <span className="flex items-center gap-1">
                        Name{" "}
                        <SortIcon
                          field="token_name"
                          sortField={sortField}
                          sortDirection={sortDirection}
                        />
                      </span>
                    </TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Tags</TableHead>
                    <TableHead>Analytics</TableHead>
                    <TableHead
                      className="cursor-pointer select-none"
                      onClick={() => handleSort("created_at")}
                    >
                      <span className="flex items-center gap-1">
                        Created{" "}
                        <SortIcon
                          field="created_at"
                          sortField={sortField}
                          sortDirection={sortDirection}
                        />
                      </span>
                    </TableHead>
                    <TableHead />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedFilteredTokens.map((token) => (
                    <TableRow key={token.token}>
                      <TableCell>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <button
                              type="button"
                              onClick={() => handleCopy(token.token)}
                              className="flex items-center gap-1.5 text-mono text-xs text-muted-foreground hover:text-foreground"
                            >
                              {token.token.substring(0, 15)}…
                              <Copy className="h-3 w-3" />
                            </button>
                          </TooltipTrigger>
                          <TooltipContent>Click to copy token</TooltipContent>
                        </Tooltip>
                      </TableCell>

                      <TableCell>
                        {token.category === "image" ? (
                          <a
                            href={`${API_URL.replace(/\/$/, "")}/image/${token.token}`}
                            target="_blank"
                            rel="noreferrer"
                            className="text-xs text-primary hover:underline"
                          >
                            View Image
                          </a>
                        ) : (
                          <Badge variant="default" className="uppercase">
                            {token.category}
                          </Badge>
                        )}
                      </TableCell>

                      <TableCell>{token.token_name}</TableCell>

                      <TableCell>
                        <StatusBadge
                          value={
                            token.status ||
                            (token.is_active ? "active" : "expired")
                          }
                          colorMap={TOKEN_STATUS_COLORS}
                        />
                      </TableCell>

                      <TableCell>
                        <div className="flex max-w-[160px] flex-wrap gap-1">
                          {(token.tags || []).slice(0, 3).map((tag) => (
                            <Badge
                              key={tag}
                              variant="outline"
                              className="text-[10px]"
                            >
                              {tag}
                            </Badge>
                          ))}
                          {(!token.tags || token.tags.length === 0) && (
                            <span className="text-xs text-muted-foreground">
                              —
                            </span>
                          )}
                        </div>
                      </TableCell>

                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            navigate(`/utils/track/${token.token}`)
                          }
                        >
                          <LineChart className="h-3.5 w-3.5" /> Logs
                        </Button>
                      </TableCell>

                      <TableCell className="text-muted-foreground">
                        {format(
                          new Date(token.created_at),
                          "MMM dd, yyyy HH:mm",
                        )}
                      </TableCell>

                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreVertical className="h-3.5 w-3.5" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            {token.status !== "expired" &&
                              token.status !== "revoked" && (
                                <>
                                  <DropdownMenuItem
                                    onClick={() =>
                                      handleRotateToken(token.token)
                                    }
                                  >
                                    <RefreshCw className="h-3.5 w-3.5" /> Rotate
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={() =>
                                      handleExpireToken(token.token)
                                    }
                                  >
                                    <Clock className="h-3.5 w-3.5" /> Mark
                                    expired
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={() =>
                                      handleRevokeToken(token.token)
                                    }
                                    className="text-destructive focus:text-destructive"
                                  >
                                    <Ban className="h-3.5 w-3.5" /> Revoke
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                </>
                              )}
                            <DropdownMenuItem
                              onClick={() =>
                                handleEditTags(token.token, token.tags)
                              }
                            >
                              <Tag className="h-3.5 w-3.5" /> Edit tags
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleDeleteToken(token.token)}
                              className="text-destructive focus:text-destructive"
                            >
                              <Trash2 className="h-3.5 w-3.5" /> Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TooltipProvider>
          </AsyncBoundary>
        </CardContent>
      </Card>
    </div>
  );
};

export default Track;
