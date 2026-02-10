import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { User } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuGroup,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";


export function TalentProfile() {
  const navigate = useNavigate();
  const IS_USER_LOGGED_IN = true;
  const { toast } = useToast();

  function signout(): void {
    localStorage.clear();
    sessionStorage.clear();

    toast({
      title: "Signed out",
      description: "You have been successfully signed out.",
    });

    navigate("/");
  }

  return (
    <DropdownMenu>

      <DropdownMenuTrigger asChild>
        {IS_USER_LOGGED_IN ? (
          <button>
            <div className="w-7 h-7 rounded-full gradient-primary flex items-center justify-center text-primary-foreground font-medium text-sm">
              JD
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
              <span className="text-sm font-medium">John Doe</span>
              <span className="text-xs text-muted-foreground bg-blue-600/50 rounded-[4px] text-white px-1 py-0.5">Talent</span>
            </div>

          </div>
        </DropdownMenuGroup>
        <DropdownMenuItem className="cursor-pointer" onClick={() => navigate('/plan')}>Account Plan</DropdownMenuItem>
        <DropdownMenuItem className="cursor-pointer" onClick={() => navigate('/wallet')}>My Wallet</DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="cursor-pointer" onClick={() => navigate('/help')}>Help Center</DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="text-destructive cursor-pointer" onClick={() => signout()}>Sign Out</DropdownMenuItem>
      </DropdownMenuContent>

    </DropdownMenu>

  );
}
