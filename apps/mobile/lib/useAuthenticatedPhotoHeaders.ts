import { useEffect, useState } from "react";
import { useAuth } from "@clerk/clerk-expo";

/**
 * RN's <Image> needs the bearer token synchronously in `source.headers`, so
 * it's fetched once up front rather than awaited inline in render.
 */
export function useAuthenticatedPhotoHeaders() {
  const { getToken } = useAuth();
  const [authHeader, setAuthHeader] = useState<{ Authorization: string } | null>(null);

  useEffect(() => {
    let cancelled = false;
    getToken().then((token) => {
      if (!cancelled && token) setAuthHeader({ Authorization: `Bearer ${token}` });
    });
    return () => {
      cancelled = true;
    };
  }, [getToken]);

  return authHeader;
}
