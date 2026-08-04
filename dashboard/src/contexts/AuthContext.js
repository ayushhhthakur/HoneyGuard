import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useMemo,
} from "react";
import PropTypes from "prop-types";
import { supabase } from "../lib/supabaseClient";
import { setActiveOrgId } from "../lib/http";
import { meApi } from "../api/me.api";
import { orgsApi } from "../api/orgs.api";
const ACTIVE_ORG_STORAGE_KEY = "honeyguard.activeOrgId";

const AuthContext = createContext(null);

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};

export const AuthProvider = ({ children }) => {
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);
  const [organizations, setOrganizations] = useState([]);
  const [activeOrg, setActiveOrg] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadMe = useCallback(async (preferredOrgId) => {
    try {
      const { data } = await meApi.get();
      const { profile: p, organizations: orgs } = data.data;
      setProfile(p);
      setOrganizations(orgs);

      const stored =
        preferredOrgId || localStorage.getItem(ACTIVE_ORG_STORAGE_KEY);
      const match = orgs.find((o) => o.id === stored) || orgs[0] || null;
      setActiveOrg(match);
      setActiveOrgId(match?.id || null);
      if (match) localStorage.setItem(ACTIVE_ORG_STORAGE_KEY, match.id);
      return { profile: p, organizations: orgs };
    } catch (err) {
      console.error("Failed to load profile/organizations:", err);
      setError(err.response?.data?.error || "Failed to load your account");
      return null;
    }
  }, []);

  useEffect(() => {
    let mounted = true;

    supabase.auth.getSession().then(async ({ data }) => {
      if (!mounted) return;
      setSession(data.session);
      if (data.session) await loadMe();
      setLoading(false);
    });

    const { data: listener } = supabase.auth.onAuthStateChange(
      async (_event, newSession) => {
        if (!mounted) return;
        setSession(newSession);
        if (newSession) {
          await loadMe();
        } else {
          setProfile(null);
          setOrganizations([]);
          setActiveOrg(null);
          setActiveOrgId(null);
          localStorage.removeItem(ACTIVE_ORG_STORAGE_KEY);
        }
      },
    );

    return () => {
      mounted = false;
      listener?.subscription?.unsubscribe();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const login = useCallback(
    async (email, password) => {
      setError(null);
      const { data, error: signInError } =
        await supabase.auth.signInWithPassword({ email, password });
      if (signInError) throw signInError;
      await loadMe();
      return data;
    },
    [loadMe],
  );

  const signup = useCallback(async (email, password, fullName) => {
    setError(null);
    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName } },
    });
    if (signUpError) throw signUpError;
    return data;
  }, []);

  const logout = useCallback(async () => {
    await supabase.auth.signOut();
  }, []);

  const resetPassword = useCallback(async (email) => {
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(
      email,
      {
        redirectTo: `${window.location.origin}/#/reset-password`,
      },
    );
    if (resetError) throw resetError;
  }, []);

  const switchOrg = useCallback(
    (orgId) => {
      const org = organizations.find((o) => o.id === orgId);
      if (!org) return;
      setActiveOrg(org);
      setActiveOrgId(org.id);
      localStorage.setItem(ACTIVE_ORG_STORAGE_KEY, org.id);
    },
    [organizations],
  );

  const createOrganization = useCallback(
    async (name) => {
      const { data } = await orgsApi.create(name);
      await loadMe(data.data.id);
      return data.data;
    },
    [loadMe],
  );

  const acceptInvite = useCallback(
    async (token) => {
      const { data } = await orgsApi.acceptInvite(token);
      await loadMe(data.data.id);
      return data.data;
    },
    [loadMe],
  );

  const value = useMemo(
    () => ({
      session,
      user: session?.user || null,
      profile,
      organizations,
      activeOrg,
      role: activeOrg?.role || null,
      loading,
      error,
      login,
      signup,
      logout,
      resetPassword,
      switchOrg,
      createOrganization,
      acceptInvite,
      refresh: loadMe,
      // Convenience RBAC helpers for gating UI
      hasRole: (...roles) => roles.includes(activeOrg?.role),
      isAtLeast: (minRole) => {
        const rank = { viewer: 1, analyst: 2, admin: 3, owner: 4 };
        return activeOrg?.role ? rank[activeOrg.role] >= rank[minRole] : false;
      },
    }),
    [
      session,
      profile,
      organizations,
      activeOrg,
      loading,
      error,
      login,
      signup,
      logout,
      resetPassword,
      switchOrg,
      createOrganization,
      acceptInvite,
      loadMe,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;

AuthProvider.propTypes = {
  children: PropTypes.node.isRequired,
};
