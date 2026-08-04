import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";

const AcceptInvite = () => {
  const { session, loading: authLoading, acceptInvite } = useAuth();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get("token");
  const [status, setStatus] = useState("pending"); // pending | working | success | error
  const [message, setMessage] = useState(null);

  useEffect(() => {
    if (authLoading) return;
    if (!session) return; // guest view below handles this
    if (!token) {
      setStatus("error");
      setMessage("This invite link is missing its token.");
      return;
    }

    setStatus("working");
    acceptInvite(token)
      .then((org) => {
        setStatus("success");
        setMessage(`You've joined ${org.name}.`);
        setTimeout(() => navigate("/dashboard", { replace: true }), 1800);
      })
      .catch((err) => {
        setStatus("error");
        setMessage(
          err.response?.data?.error ||
            err.message ||
            "Unable to accept this invite",
        );
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authLoading, session, token]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30 px-4">
      <div className="w-full max-w-[380px] rounded-xl border border-border bg-white p-8 text-center shadow-sm">
        <h1 className="text-base font-semibold">Team invite</h1>

        {!session && !authLoading && (
          <>
            <p className="mt-2 text-xs text-muted-foreground">
              Sign in (or create an account) with the email this invite was sent
              to, then come back to this link.
            </p>
            <Button asChild size="sm" className="mt-3">
              <Link to={`/login?redirect=/accept-invite?token=${token}`}>
                Go to login
              </Link>
            </Button>
          </>
        )}

        {(authLoading || status === "working") && (
          <div className="mt-4 flex justify-center">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        )}

        {status === "success" && (
          <div className="mt-4 rounded-md border border-success/20 bg-success/5 px-3 py-2 text-xs text-success">
            {message}
          </div>
        )}
        {status === "error" && (
          <div className="mt-4 rounded-md border border-destructive/20 bg-destructive/5 px-3 py-2 text-xs text-destructive">
            {message}
          </div>
        )}
      </div>
    </div>
  );
};

export default AcceptInvite;
