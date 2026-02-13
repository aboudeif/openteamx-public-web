import { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { cn } from "@/lib/utils";
import { ApiTeamService } from "@/services/api/ApiTeamService";
import {
  Earth,
  UserSquare,
  Puzzle,
  HelpCircle,
  Wallet,
  Gift,
  Mail,
  MessageSquare,
  FolderKanban,
  Calendar,
  FolderOpen,
  ChevronRight,
  FileText,
  Table2,
  Telescope,
  Users,
  GitBranch,
  List,
} from "lucide-react";

interface Team {
  id: string;
  name: string;
  logo: string;
  color: string;
}

interface ActiveTeam {
  id: string;
  name: string;
}

const teamService = new ApiTeamService();
const TEAM_COLORS = [
  "from-primary to-primary/70",
  "from-success to-success/70",
  "from-warning to-warning/70",
  "from-sky-500 to-cyan-400",
  "from-pink-500 to-rose-400",
];

const getInitials = (name: string) =>
  name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");

const level0Items = [
  { id: "discover", label: "Discover", icon: Telescope, path: "/" },
  { id: "Overview", label: "Overview", icon: Earth, path: "/overview" },
  { id: "myteams", label: "My Teams", icon: Users, path: "/myteams" },
  { id: "integrations", label: "Integrations", icon: Puzzle, path: "/integrations" },
  { id: "wallet", label: "Wallet", icon: Wallet, path: "/wallet" },
  { id: "rewards", label: "Rewards", icon: Gift, path: "/rewards" },
  { id: "help", label: "Help", icon: HelpCircle, path: "/help" },
];

const teamSubItems = [
  { id: "team", label: "Team", icon: UserSquare, path: "/team" },
  { id: "mail", label: "Mail", icon: Mail, path: "/mail" },
  { id: "chat", label: "Chat", icon: MessageSquare, path: "/chat" },
  { id: "projects", label: "Projects", icon: FolderKanban, path: "/projects" },
  { id: "repositories", label: "Repositories", icon: GitBranch, path: "/repositories" },
  { id: "calendar", label: "Calendar", icon: Calendar, path: "/calendar" },
  { id: "drive", label: "Drive", icon: FolderOpen, path: "/drive" },
  { id: "requests", label: "Requests", icon: UserSquare, path: "/requests", leaderOnly: true },
  { id: "joinrequests", label: "Join Requests", icon: List, path: "/requests" },
];

export function WorkspaceSidebar() {
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const [expandedTeam, setExpandedTeam] = useState<string | null>(null);
  const location = useLocation();
  const { data: myTeams = [] } = useQuery<ActiveTeam[]>({
    queryKey: ["sidebar-my-teams"],
    queryFn: () => teamService.getMyActiveTeams(),
  });

  const teams: Team[] = Array.isArray(myTeams)
    ? myTeams.map((team, index) => ({
        id: team.id,
        name: team.name,
        logo: getInitials(team.name),
        color: TEAM_COLORS[index % TEAM_COLORS.length],
      }))
    : [];

  const isActive = (path: string) => {
    if (path === "/overview") return location.pathname === "/overview";
    if (path === "/") return location.pathname === "/";
    return location.pathname.startsWith(path);
  };

  const isTeamRoute = (teamId: string) => {
    const [currentTeamId] = location.pathname.split("/").filter(Boolean);
    return currentTeamId === teamId;
  };

  const isDriveSubRoute = () => {
    return location.pathname.includes("/editor") || location.pathname.includes("/spreadsheet");
  };

  return (
    <>
      {/* Level 0: Icon bar with labels - always visible */}
      <aside className="flex flex-col h-100 w-20 bg-sidebar border-r border-sidebar-border">
        <div className="flex flex-col items-center py-4 gap-1 flex-1">
          {level0Items.map((item) => {
            const isItemActive = isActive(item.path);
            const showFlyout = hoveredItem === item.id && item.id === "myteams";

            return (
              <div
                key={item.id}
                className="relative"
                onMouseEnter={() => setHoveredItem(item.id)}
                onMouseLeave={() => setHoveredItem(null)}
              >
                <NavLink
                  to={item.path}
                  className={cn(
                    "flex flex-col items-center justify-center w-16 h-16 rounded-xl text-sidebar-muted hover:bg-sidebar-accent hover:text-sidebar-foreground transition-colors",
                    isItemActive && "bg-sidebar-accent text-sidebar-primary"
                  )}
                >
                  <item.icon className="w-5 h-5 mb-1" />
                  <span className="text-[10px] font-medium">{item.label}</span>
                </NavLink>

                {/* Flyout for workspace - teams list */}
                {showFlyout && (
                  <div
                    className="absolute left-full top-0 pl-2 z-50"
                    onMouseEnter={() => setHoveredItem(item.id)}
                    onMouseLeave={() => setHoveredItem(null)}
                  >
                    <div className="bg-muted border border-border rounded-xl shadow-lg py-2 w-56">
                      <div className="px-3 pb-2 mb-2 border-b border-border">
                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                          My Teams
                        </p>
                      </div>
                      {teams.map((team) => (
                        <div
                          key={team.id}
                          className="relative"
                          onMouseEnter={() => setExpandedTeam(team.id)}
                          onMouseLeave={() => setExpandedTeam(null)}
                        >
                          <div
                            className={cn(
                              "flex items-center gap-3 px-3 py-2 mx-2 rounded-lg cursor-pointer transition-colors",
                              isTeamRoute(team.id)
                                ? "bg-primary/10 text-primary"
                                : "hover:bg-background text-foreground"
                            )}
                          >
                            <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${team.color} flex items-center justify-center text-xs font-bold text-white`}>
                              {team.logo}
                            </div>
                            <span className="flex-1 text-sm font-medium">{team.name}</span>
                            <ChevronRight className="w-4 h-4 text-muted-foreground" />
                          </div>

                          {/* Level 2: Team sub-items */}
                          {expandedTeam === team.id && (
                            <div
                              className="absolute left-full top-0 pl-2 z-50"
                              onMouseEnter={() => setExpandedTeam(team.id)}
                            >
                              <div className="bg-card border border-border rounded-xl shadow-lg py-2 w-48">
                                {teamSubItems.map((subItem) => {
                                  const subPath = `/${team.id}${subItem.path}`;
                                  const isSubActive = location.pathname === subPath || 
                                    (subItem.id === "drive" && (location.pathname.includes(`/${team.id}/drive`) || 
                                      location.pathname.includes(`/${team.id}/editor`) || 
                                      location.pathname.includes(`/${team.id}/spreadsheet`)));

                                  return (
                                    <div key={subItem.id}>
                                      <NavLink
                                        to={subPath}
                                        className={cn(
                                          "flex items-center gap-3 px-3 py-2 mx-2 rounded-lg text-sm transition-colors",
                                          isSubActive
                                            ? "bg-primary/10 text-primary font-medium"
                                            : "text-foreground hover:bg-muted"
                                        )}
                                      >
                                        <subItem.icon className="w-4 h-4" />
                                        <span>{subItem.label}</span>
                                      </NavLink>

                                      {/* Drive sub-items when active */}
                                      {subItem.id === "drive" && isSubActive && isDriveSubRoute() && (
                                        <div className="ml-6 mt-1 space-y-1">
                                          {location.pathname.includes("/editor") && (
                                            <div className="flex items-center gap-2 px-3 py-1.5 text-xs text-primary bg-primary/5 rounded-lg mx-2">
                                              <FileText className="w-3 h-3" />
                                              Text Editor
                                            </div>
                                          )}
                                          {location.pathname.includes("/spreadsheet") && (
                                            <div className="flex items-center gap-2 px-3 py-1.5 text-xs text-primary bg-primary/5 rounded-lg mx-2">
                                              <Table2 className="w-3 h-3" />
                                              Spreadsheet
                                            </div>
                                          )}
                                        </div>
                                      )}
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </aside>
    </>
  );
}
