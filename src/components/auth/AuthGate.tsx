import { ReactNode, useEffect, useMemo, useState } from "react";
import { authService } from "@/services";
import { ApiError } from "@/lib/api";

interface AuthGateProps {
  children: ReactNode;
}

const PUBLIC_WEB_HOME = import.meta.env.VITE_PUBLIC_WEB_URL || "http://localhost:3001";

export function AuthGate({ children }: AuthGateProps) {
  const [isChecking, setIsChecking] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const loginUrl = useMemo(() => new URL("/", PUBLIC_WEB_HOME).toString(), []);

  useEffect(() => {
    let isMounted = true;

    const canRecoverWithRefresh = (error: unknown): boolean => {
      return error instanceof ApiError && (error.status === 401 || error.status === 403);
    };

    const checkAuth = async () => {
      try {
        await authService.getCurrentUser();
        if (!isMounted) return;
        setIsAuthenticated(true);
      } catch (error) {
        if (canRecoverWithRefresh(error)) {
          try {
            await authService.refreshToken();
            await authService.getCurrentUser();
            if (!isMounted) return;
            setIsAuthenticated(true);
            return;
          } catch {
            // Fall through to unauthenticated state.
          }
        }

        if (!isMounted) return;
        setIsAuthenticated(false);
      } finally {
        if (!isMounted) return;
        setIsChecking(false);
      }
    };

    void checkAuth();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (!isChecking && !isAuthenticated) {
      window.location.replace(loginUrl);
    }
  }, [isChecking, isAuthenticated, loginUrl]);

  if (isChecking) {
    return null;
  }

  if (!isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}
