import { useCallback, useEffect, useRef, useState } from 'react';

// Standardizes the "fetch on mount, track loading/error, allow retry" pattern
// that was previously hand-rolled (with no loading/error state at all) on every page.
export function useApiData(fetchFn, deps = []) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const fetchRef = useRef(fetchFn);
  fetchRef.current = fetchFn;

  const load = useCallback(() => {
    setLoading(true);
    setError(null);
    return fetchRef.current()
      .then((res) => setData(res.data))
      .catch((err) => setError(err))
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  useEffect(() => { load(); }, [load]);

  return { data, setData, loading, error, retry: load };
}
