import { useEffect } from "react";
import { supabase } from "../lib/supabaseClient";

/**
 * `useRealtimeChannel('alerts-' + orgId, [{ event: 'INSERT', table: 'alerts', filter, onEvent }])`
 *
 * Wraps the repeated `supabase.channel(...).on('postgres_changes', ...).subscribe()`
 * + `removeChannel` cleanup pattern that appeared, slightly differently
 * each time, in Dashboard/MainChart/Alerts/Fingerprints. Pass `enabled:
 * false` (or an empty/undefined channelName) to skip subscribing — e.g.
 * before the active org is known yet.
 */
export const useRealtimeChannel = (
  channelName,
  subscriptions,
  { enabled = true } = {},
) => {
  useEffect(() => {
    if (!enabled || !channelName || subscriptions.length === 0)
      return undefined;

    let channel = supabase.channel(channelName);
    for (const sub of subscriptions) {
      channel = channel.on(
        "postgres_changes",
        {
          event: sub.event || "*",
          schema: "public",
          table: sub.table,
          filter: sub.filter,
        },
        sub.onEvent,
      );
    }
    channel.subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, channelName]);
};

export default useRealtimeChannel;
