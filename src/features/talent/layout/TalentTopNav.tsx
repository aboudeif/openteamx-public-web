import { Search, ChevronDown } from "lucide-react";
import { NavLink, useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { NotificationBell } from "@/components/notifications/NotificationBell";
import { TalentProfile } from "@/features/talent/components/TalentProfile";

export function TalentTopNav() {


  return (
    <header className="h-14 border-b border-border bg-card px-4 flex items-center justify-between gap-4">
       {/* Logo */}
          <NavLink to={"/"} className="flex items-center space-x-2 cursor-pointer">
            <span className="text-2xl font-bold tracking-tight text-gray-600">
              OpenTeam<span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-yellow-500">X</span>
            </span>
          </NavLink>
    
      {/* Right - Actions */}
      <div className="flex items-center gap-2">
        {/* Notifications */}
        <NotificationBell />

        {/* User Menu */}
        <TalentProfile />
        
      </div>
    </header>
  );
}
