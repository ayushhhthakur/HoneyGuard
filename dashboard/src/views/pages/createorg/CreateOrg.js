import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Shield, Fingerprint, Zap, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";

const FEATURES = [
  {
    icon: Fingerprint,
    text: "Deploy honeytokens across 27 types — documents, cloud credentials, API keys, and more",
  },
  { icon: Zap, text: "Realtime alerts the moment a token is touched" },
  { icon: Users, text: "Invite your team with granular, role-based access" },
];

const CreateOrg = () => {
  const { createOrganization, logout } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await createOrganization(name);
      navigate("/dashboard", { replace: true });
    } catch (err) {
      setError(
        err.response?.data?.error ||
          err.message ||
          "Unable to create organization",
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30 p-4">
      <div className="grid w-full max-w-3xl overflow-hidden rounded-xl border border-border bg-white shadow-sm md:grid-cols-2">
        <div className="hidden flex-col justify-between border-r border-border bg-muted/40 p-8 md:flex">
          <div>
            <span className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Shield className="h-5 w-5" />
            </span>
            <h2 className="text-base font-semibold">Welcome to HoneyGuard</h2>
            <p className="mt-2 text-xs text-muted-foreground">
              Set up the workspace your team will use to deploy honeytokens and
              triage the alerts they generate.
            </p>
          </div>
          <div className="mt-6 space-y-3">
            {FEATURES.map((f) => (
              <div key={f.text} className="flex items-start gap-2.5">
                <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
                  <f.icon className="h-3.5 w-3.5" />
                </span>
                <span className="text-xs text-muted-foreground">{f.text}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-col justify-center p-8">
          <h3 className="text-base font-semibold">Name your organization</h3>
          <p className="mt-1 text-xs text-muted-foreground">
            You&apos;ll be its owner. Rename it anytime, and invite teammates
            afterwards from the Team page.
          </p>

          {error && (
            <div className="mt-4 rounded-md border border-destructive/20 bg-destructive/5 px-3 py-2 text-xs text-destructive">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-4 space-y-3">
            <div className="space-y-1.5">
              <Label htmlFor="orgName">Organization name</Label>
              <Input
                id="orgName"
                placeholder="e.g. Zenovia Security Team"
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoFocus
                required
              />
            </div>
            <Button
              type="submit"
              className="w-full"
              disabled={submitting || !name.trim()}
            >
              {submitting ? "Creating…" : "Create organization"}
            </Button>
          </form>

          <Button
            variant="link"
            size="sm"
            className="mt-2 text-muted-foreground"
            onClick={logout}
          >
            Sign out
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CreateOrg;
