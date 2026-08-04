import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";

/**
 * `const { data, loading, error, reload, setData } = useAsync(fetcher, [deps])`
 *
 * `fetcher` is an async function returning the raw axios response; this
 * hook unwraps `.data.data`, manages loading/error state, and (by default)
 * surfaces failures as a toast — the exact pattern that was hand-copied
 * with minor variations into every page component. Pass `{ toastOnError:
 * false }` to handle errors locally instead.
 */
export const useAsync = (fetcher, deps = [], options = {}) => {
  const { toastOnError = true, enabled = true, defaultValue = null } = options;
  const [data, setData] = useState(defaultValue);
  const [loading, setLoading] = useState(enabled);
  const [error, setError] = useState(null);
  const fetcherRef = useRef(fetcher);
  fetcherRef.current = fetcher;

  const reload = useCallback(async () => {
    if (!enabled) return;
    setLoading(true);
    setError(null);
    try {
      const response = await fetcherRef.current();
      setData(response.data.data);
    } catch (err) {
      const message =
        err.response?.data?.error || err.message || "Something went wrong";
      setError(message);
      if (toastOnError) toast.error(message);
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, toastOnError]);

  useEffect(() => {
    reload();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reload, ...deps]);

  return { data, setData, loading, error, reload };
};

export default useAsync;
