import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { User } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuGroup,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import { authService } from "@/services";

const PUBLIC_WEB_HOME = import.meta.env.VITE_PUBLIC_WEB_URL || "http://localhost:3001";

export function TalentProfile() {
  const navigate = useNavigate();
  const [displayName, setDisplayName] = useState("User");
  const [isUserLoggedIn, setIsUserLoggedIn] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const loadCurrentUser = async () => {
      try {
        const response = await authService.getCurrentUser();
        const data = response?.data || response;
        setDisplayName(data?.user?.name || "User");
        setIsUserLoggedIn(Boolean(data?.authenticated ?? true));
      } catch {
        setDisplayName("User");
        setIsUserLoggedIn(true);
      }
    };

    void loadCurrentUser();
  }, []);

  const initials = useMemo(() => {
    const parts = displayName.trim().split(" ").filter(Boolean);
    if (parts.length === 0) return "U";
    if (parts.length === 1) return parts[0][0]?.toUpperCase() || "U";
    return `${parts[0][0] || ""}${parts[parts.length - 1][0] || ""}`.toUpperCase();
  }, [displayName]);

  async function signout(): Promise<void> {
    try {
      await authService.logout();
    } catch {
      // Continue with local cleanup and redirect even if API logout fails.
    }

    localStorage.clear();
    sessionStorage.clear();
    toast({
      title: "Signed out",
      description: "You have been successfully signed out.",
    });
    window.location.replace(new URL("/", PUBLIC_WEB_HOME).toString());
  }

  return (
    <DropdownMenu>

      <DropdownMenuTrigger asChild>
        {isUserLoggedIn ? (
          <button>
            <div className="w-7 h-7 rounded-full gradient-primary flex items-center justify-center text-primary-foreground font-medium text-sm">
              {initials}
            </div>
          </button>
        ) : (
          <User className="w-5 h-5" />
        )}

      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuGroup>
          <div className="p-3 border-b border-border flex items-center justify-between">
            <div className="hidden md:flex flex-col items-start">
              <span className="text-sm font-medium">{displayName}</span>
              <span className="text-xs text-muted-foreground bg-blue-600/50 rounded-[4px] text-white px-1 py-0.5">Talent</span>
            </div>

          </div>
        </DropdownMenuGroup>
        <DropdownMenuItem className="cursor-pointer" onClick={() => navigate('/plan')}>Account Plan</DropdownMenuItem>
        <DropdownMenuItem className="cursor-pointer" onClick={() => navigate('/wallet')}>My Wallet</DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="cursor-pointer" onClick={() => navigate('/help')}>Help Center</DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="text-destructive cursor-pointer" onClick={() => void signout()}>Sign Out</DropdownMenuItem>
      </DropdownMenuContent>

    </DropdownMenu>

  );
}
