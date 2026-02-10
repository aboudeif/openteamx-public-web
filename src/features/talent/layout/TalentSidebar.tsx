import { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Users,
  Settings,
  Puzzle,
  HelpCircle,
  ChevronLeft,
  ChevronRight,
  Bell,
  FileText,
  Table2,
} from "lucide-react";

const mainNavItems = [
  { title: "Dashboard", path: "/talent", icon: LayoutDashboard },
  { title: "Discover Teams", path: "/", icon: Users },
];

const toolsNavItems = [
  { title: "Text Editor", path: "/talent/editor", icon: FileText },
  { title: "Spreadsheet", path: "/talent/spreadsheet", icon: Table2 },
];

const settingsNavItems = [
  { title: "Integrations", path: "/talent/integrations", icon: Puzzle },
  { title: "Help Center", path: "/talent/help", icon: HelpCircle },
];

export function TalentSidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();

  const isActive = (path: string) => {
    if (path === "/talent") return location.pathname === "/talent";
    return location.pathname.startsWith(path);
  };

  return (
    <aside
      className={cn(
        "flex flex-col h-screen bg-sidebar border-r border-sidebar-border transition-all duration-300 ease-in-out",
        collapsed ? "w-16" : "w-64"
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-sidebar-border">
        {!collapsed && (
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center">
              <LayoutDashboard className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="font-semibold text-sidebar-foreground">TalentHub</span>
          </div>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-1.5 rounded-lg hover:bg-sidebar-accent text-sidebar-muted hover:text-sidebar-foreground transition-colors"
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto scrollbar-thin">
        <div className="space-y-1">
          {mainNavItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === "/talent"}
              className={cn(
                "nav-item",
                isActive(item.path) && item.path === "/talent" && location.pathname === "/talent" && "nav-item-active",
                isActive(item.path) && item.path !== "/talent" && "nav-item-active"
              )}
            >
              <item.icon className="w-5 h-5 flex-shrink-0" />
              {!collapsed && <span>{item.title}</span>}
            </NavLink>
          ))}
        </div>

        {/* Tools Section */}
        {!collapsed && (
          <div className="pt-6">
            <p className="px-3 mb-2 text-xs font-medium text-sidebar-muted uppercase tracking-wider">
              Tools
            </p>
          </div>
        )}
        
        <div className={cn("space-y-1", collapsed && "pt-4")}>
          {toolsNavItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={cn(
                "nav-item",
                isActive(item.path) && "nav-item-active"
              )}
            >
              <item.icon className="w-5 h-5 flex-shrink-0" />
              {!collapsed && <span>{item.title}</span>}
            </NavLink>
          ))}
        </div>

        {/* Settings Section */}
        {!collapsed && (
          <div className="pt-6">
            <p className="px-3 mb-2 text-xs font-medium text-sidebar-muted uppercase tracking-wider">
              Account
            </p>
          </div>
        )}
        
        <div className={cn("space-y-1", collapsed && "pt-4")}>
          {settingsNavItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={cn(
                "nav-item",
                isActive(item.path) && "nav-item-active"
              )}
            >
              <item.icon className="w-5 h-5 flex-shrink-0" />
              {!collapsed && <span>{item.title}</span>}
            </NavLink>
          ))}
        </div>
      </nav>

      {/* Footer */}
      <div className="p-3 border-t border-sidebar-border space-y-1">
        <button className="nav-item w-full">
          <Bell className="w-5 h-5 flex-shrink-0" />
          {!collapsed && <span>Notifications</span>}
        </button>
        <button className="nav-item w-full">
          <Settings className="w-5 h-5 flex-shrink-0" />
          {!collapsed && <span>Settings</span>}
        </button>
        
        {/* User Profile */}
        <div className={cn(
          "flex items-center gap-3 p-2 mt-2 rounded-lg bg-sidebar-accent",
          collapsed && "justify-center"
        )}>
          <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-sidebar-primary font-medium text-sm">
            JD
          </div>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-sidebar-foreground truncate">John Doe</p>
              <p className="text-xs text-sidebar-muted truncate">Senior Developer</p>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
