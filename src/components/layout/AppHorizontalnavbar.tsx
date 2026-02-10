import { NavLink, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import {
  Mail,
  MessageSquare,
  FolderKanban,
  Calendar,
  UserSquare,
  Folder,
  List,
  GitBranch,
  Edit3,
  FileSpreadsheet,
  NotepadText
} from "lucide-react";

interface Team {
  id: string;
  name: string;
  logo: string;
  color: string;
}

const teams: Team[] = [
  { id: "team-1", name: "TechVentures", logo: "TV", color: "from-primary to-primary/70" },
  { id: "team-2", name: "DesignCo", logo: "DC", color: "from-success to-success/70" },
];


const teamNavItems = [
  { id : "team", label: "Team", icon: UserSquare, path: "/team" },
  { id: "mail", label: "Mail", icon: Mail, path: "/mail" },
  { id: "chat", label: "Chat", icon: MessageSquare, path: "/chat" },
  { id: "projects", label: "Projects", icon: FolderKanban, path: "/projects" },
  { id: "repositories", label: "Repositories", icon: GitBranch, path: "/repositories" },
  { id: "calendar", label: "Calendar", icon: Calendar, path: "/calendar" },
  { id: "drive", label: "Drive", icon: Folder, path: "/drive" },
  { id: "joinrequests", label: "Join Requests", icon: List, path: "/requests" },
  { id: "editor", label: "Text Editor", icon: Edit3, path: "/drive/editor" },
  { id: "spreadsheet", label: "Spreadsheet", icon: FileSpreadsheet, path: "/drive/spreadsheet" },
  { id: "notes", label: "Meeting Notes", icon: NotepadText, path: "/notes" },
  { id: "meetings", label: "Meetings", icon: NotepadText, path: "/meetings" },
  { id: "activities", label: "Activities", icon: NotepadText, path: "/activities" },
];
  
export function AppHorizontalnavbar() {
  const location = useLocation();

  const isActive = (path: string) => {
    if (path === "/") return location.pathname === "/";
    return location.pathname.endsWith(path);
  };

  const checkOptionalItem = (item) =>
    (item.path === "/drive/editor" && !isActive(item.path)) || 
    (item.path === "/drive/spreadsheet" && !isActive(item.path)) ||
    (item.path === "/requests" && !isActive(item.path)) ||
    (item.path === "/notes" && !isActive(item.path)) ||
    (item.path === "/meetings" && !isActive(item.path)) ||
    (item.path === "/activities" && !isActive(item.path))
  

  return (
    <aside
      className={cn(
        "flex flex-row w-full",
        "bg-horizontalnavbar",
        "border-b border-horizontalnavbar-border",
        "transition-all duration-300 ease-in-out"
      )}
    >
    <nav className="flex-1 p-3 overflow-x-auto scrollbar-thin">
      <div className={cn(
        "flex flex-row items-center space-x-1"
      )}>
        {teamNavItems.map((item) => (
          !checkOptionalItem(item) &&
          <NavLink
            key={item.path}
            to={`/${teams[1].id}${item.path}`}
            className={cn(
              "hnav-item",
              isActive(item.path) && "hnav-item-active"
            )}
            >
            <item.icon className="w-4 h-4" />
            <span>{item.label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
    </aside>
  );
}
