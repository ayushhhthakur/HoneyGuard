import React, { createContext, useContext, useEffect, useState } from "react";
import PropTypes from "prop-types";
import { alertsApi } from "../api/alerts.api";
import { useAuth } from "./AuthContext";
import { useRealtimeChannel } from "../hooks/useRealtimeChannel";

const NotificationContext = createContext();

export const useNotifications = () => {
  return useContext(NotificationContext);
};

// Real open-alert count for the active org, kept live via Supabase Realtime.
export const NotificationProvider = ({ children }) => {
  const { activeOrg } = useAuth();
  const [notifications, setNotifications] = useState({ alerts: 0, recent: [] });

  useEffect(() => {
    if (!activeOrg) {
      setNotifications({ alerts: 0, recent: [] });
      return undefined;
    }

    let cancelled = false;
    alertsApi
      .list({ status: "open" })
      .then(({ data }) => {
        if (cancelled) return;
        setNotifications({
          alerts: data.data.length,
          recent: data.data.slice(0, 5),
        });
      })
      .catch(() => {});

    return () => {
      cancelled = true;
    };
  }, [activeOrg]);

  useRealtimeChannel(
    activeOrg ? `header-alerts-${activeOrg.id}` : null,
    [
      {
        event: "INSERT",
        table: "alerts",
        filter: activeOrg ? `org_id=eq.${activeOrg.id}` : undefined,
        onEvent: (payload) =>
          setNotifications((prev) => ({
            alerts: prev.alerts + 1,
            recent: [payload.new, ...prev.recent].slice(0, 5),
          })),
      },
    ],
    { enabled: Boolean(activeOrg) },
  );

  return (
    <NotificationContext.Provider value={{ notifications }}>
      {children}
    </NotificationContext.Provider>
  );
};

NotificationProvider.propTypes = {
  children: PropTypes.node.isRequired,
};
