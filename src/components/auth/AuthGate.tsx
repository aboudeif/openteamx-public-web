import { ReactNode, useEffect, useMemo, useState } from "react";
import { authService } from "@/services";
import { ApiError } from "@/lib/api";

interface AuthGateProps {
  children: ReactNode;
}

const PUBLIC_WEB_HOME = import.meta.env.VITE_PUBLIC_WEB_URL || "http://localhost:3001";
type AuthStatus = "unknown" | "authenticated_verified" | "authenticated_unverified" | "unauthenticated";

export function AuthGate({ children }: AuthGateProps) {
  const [isChecking, setIsChecking] = useState(true);
  const [authStatus, setAuthStatus] = useState<AuthStatus>("unknown");
  const loginUrl = useMemo(() => new URL("/", PUBLIC_WEB_HOME).toString(), []);
  const activationUrl = useMemo(
    () => new URL("/account/activation", PUBLIC_WEB_HOME).toString(),
    [],
  );

  useEffect(() => {
    let isMounted = true;

    const canRecoverWithRefresh = (error: unknown): boolean => {
      return error instanceof ApiError && (error.status === 401 || error.status === 403);
    };

    const checkAuth = async () => {
      try {
        const authState = await authService.getCurrentUser();
        if (!isMounted) return;
        const isVerified =
          authState?.authState === "authenticated_verified" ||
          authState?.user?.emailVerified === true;

        setAuthStatus(isVerified ? "authenticated_verified" : "authenticated_unverified");
      } catch (error) {
        if (canRecoverWithRefresh(error)) {
          try {
            await authService.refreshToken();
            const authState = await authService.getCurrentUser();
            if (!isMounted) return;
            const isVerified =
              authState?.authState === "authenticated_verified" ||
              authState?.user?.emailVerified === true;

            setAuthStatus(isVerified ? "authenticated_verified" : "authenticated_unverified");
            return;
          } catch {
            // Fall through to unauthenticated state.
          }
        }

        if (!isMounted) return;
        setAuthStatus("unauthenticated");
      } finally {
        if (isMounted) {
          setIsChecking(false);
        }
      }
    };

    void checkAuth();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (isChecking || authStatus === "unknown") {
      return;
    }

    if (authStatus === "unauthenticated") {
      window.location.replace(loginUrl);
      return;
    }

    if (authStatus === "authenticated_unverified") {
      const currentUrl = encodeURIComponent(window.location.href);
      window.location.replace(`${activationUrl}?returnUrl=${currentUrl}`);
    }
  }, [isChecking, authStatus, loginUrl, activationUrl]);

  if (isChecking) {
    return null;
  }

  if (authStatus !== "authenticated_verified") {
    return null;
  }

  return <>{children}</>;
}
