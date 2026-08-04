import React, { useCallback, useEffect, useState } from "react";
import { toast } from "react-toastify";
import { UserPlus, Trash2, Loader2 } from "lucide-react";
import { orgsApi } from "@/api/orgs.api";
import { useAuth } from "@/contexts/AuthContext";
import { useConfirm } from "@/hooks/useConfirm";
import { PageHeader } from "@/components/ui/PageHeader";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { AsyncBoundary } from "@/components/ui/AsyncStates";
import { ROLE_COLORS, ROLES, INVITABLE_ROLES } from "@/constants/badges";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

const Team = () => {
  const { activeOrg, isAtLeast, profile } = useAuth();
  const confirm = useConfirm();
  const [members, setMembers] = useState([]);
  const [invites, setInvites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [inviteModal, setInviteModal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("viewer");
  const [submitting, setSubmitting] = useState(false);

  const canManage = isAtLeast("admin");

  const load = useCallback(async () => {
    if (!activeOrg) return;
    setLoading(true);
    setError(null);
    try {
      const [membersRes, invitesRes] = await Promise.all([
        orgsApi.listMembers(activeOrg.id),
        canManage
          ? orgsApi.listInvites(activeOrg.id)
          : Promise.resolve({ data: { data: [] } }),
      ]);
      setMembers(membersRes.data.data);
      setInvites(invitesRes.data.data);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to load team");
    } finally {
      setLoading(false);
    }
  }, [activeOrg, canManage]);

  useEffect(() => {
    load();
  }, [load]);

  const handleInvite = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await orgsApi.createInvite(activeOrg.id, inviteEmail, inviteRole);
      toast.success(`Invite sent to ${inviteEmail}`);
      setInviteModal(false);
      setInviteEmail("");
      setInviteRole("viewer");
      load();
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to send invite");
    } finally {
      setSubmitting(false);
    }
  };

  const handleRoleChange = async (userId, role) => {
    try {
      await orgsApi.changeMemberRole(activeOrg.id, userId, role);
      toast.success("Role updated");
      load();
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to update role");
    }
  };

  const handleRemove = async (userId) => {
    if (!(await confirm("Remove this member from the organization?"))) return;
    try {
      await orgsApi.removeMember(activeOrg.id, userId);
      toast.success("Member removed");
      load();
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to remove member");
    }
  };

  const handleRevokeInvite = async (inviteId) => {
    try {
      await orgsApi.revokeInvite(activeOrg.id, inviteId);
      toast.success("Invite revoked");
      load();
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to revoke invite");
    }
  };

  if (!activeOrg)
    return <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />;

  return (
    <div>
      <PageHeader
        title={activeOrg.name}
        subtitle="Team members"
        actions={
          canManage && (
            <Button size="sm" onClick={() => setInviteModal(true)}>
              <UserPlus className="h-3.5 w-3.5" /> Invite teammate
            </Button>
          )
        }
      />

      <Card className="mb-4">
        <CardContent className="p-0">
          <AsyncBoundary
            loading={loading}
            error={error}
            isEmpty={members.length === 0}
            emptyMessage="No members yet."
          >
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Joined</TableHead>
                  {canManage && <TableHead />}
                </TableRow>
              </TableHeader>
              <TableBody>
                {members.map((m) => (
                  <TableRow key={m.id}>
                    <TableCell>{m.profiles?.full_name || "—"}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {m.profiles?.email}
                    </TableCell>
                    <TableCell>
                      {canManage && m.profiles?.id !== profile?.id ? (
                        <Select
                          value={m.role}
                          onValueChange={(role) =>
                            handleRoleChange(m.profiles.id, role)
                          }
                        >
                          <SelectTrigger className="h-7 w-[120px] text-xs">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {ROLES.map((r) => (
                              <SelectItem
                                key={r}
                                value={r}
                                className="capitalize"
                              >
                                {r}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      ) : (
                        <StatusBadge value={m.role} colorMap={ROLE_COLORS} />
                      )}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {new Date(m.created_at).toLocaleDateString()}
                    </TableCell>
                    {canManage && (
                      <TableCell>
                        {m.profiles?.id !== profile?.id && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-destructive hover:text-destructive"
                            onClick={() => handleRemove(m.profiles.id)}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
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

      {canManage && invites.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Pending invites</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Expires</TableHead>
                  <TableHead />
                </TableRow>
              </TableHeader>
              <TableBody>
                {invites.map((inv) => (
                  <TableRow key={inv.id}>
                    <TableCell>{inv.email}</TableCell>
                    <TableCell>
                      <StatusBadge value={inv.role} colorMap={ROLE_COLORS} />
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {new Date(inv.expires_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-destructive hover:text-destructive"
                        onClick={() => handleRevokeInvite(inv.id)}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      <Dialog open={inviteModal} onOpenChange={setInviteModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Invite a teammate</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleInvite} className="space-y-3">
            <div className="space-y-1.5">
              <Label htmlFor="inviteEmail">Email</Label>
              <Input
                id="inviteEmail"
                type="email"
                placeholder="teammate@company.com"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label>Role</Label>
              <Select value={inviteRole} onValueChange={setInviteRole}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {INVITABLE_ROLES.map((r) => (
                    <SelectItem key={r} value={r} className="capitalize">
                      {r}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setInviteModal(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting ? "Sending…" : "Send invite"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Team;
