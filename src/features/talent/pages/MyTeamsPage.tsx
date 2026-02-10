import { useState } from "react";
import { WorkspaceLayout } from "@/components/layout/WorkspaceLayout";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { CreateTeamModal } from "@/features/talent/components/CreateTeamModal";
import { TeamSettingsModal } from "@/features/talent/components/TeamSettingsModal";
import { useNavigate } from "react-router-dom";
import {
  Users,
  Plus,
  Crown,
  User,
  Settings,
  FolderKanban,
  Calendar,
  Building2,
} from "lucide-react";

const myTeams = [
  {
    id: 1,
    name: "TechVentures Studio",
    description: "Building next-gen AI tools for productivity",
    logo: "TV",
    role: "Team Leader",
    members: 12,
    color: "from-primary to-primary/70",
    projects: [
      { id: "p1", name: "Mobile App Redesign" },
      { id: "p2", name: "Backend API" },
      { id: "p3", name: "Analytics Dashboard" },
    ],
  },
  {
    id: 2,
    name: "DesignCo Agency",
    description: "Premium design services for startups",
    logo: "DC",
    role: "Team Member",
    members: 8,
    color: "from-success to-success/70",
    projects: [
      { id: "p4", name: "Brand Identity" },
      { id: "p5", name: "Website Revamp" },
    ],
  },
  {
    id: 3,
    name: "CodeCraft Studio",
    description: "Custom software development solutions",
    logo: "CC",
    role: "Team Member",
    members: 15,
    color: "from-warning to-warning/70",
    projects: [
      { id: "p6", name: "E-commerce Platform" },
      { id: "p7", name: "CRM System" },
      { id: "p8", name: "Inventory Management" },
      { id: "p9", name: "Payment Gateway" },
    ],
  },
];

const exTeams = [
  {
    id: "ex-1",
    name: "StartupXYZ",
    logo: "SX",
    role: "Frontend Developer",
    joinDate: "Jan 2024",
    leaveDate: "Dec 2024",
    projectsCount: 5,
    color: "from-slate-400 to-slate-500",
  },
  {
    id: "ex-2",
    name: "Digital Nomads Inc",
    logo: "DN",
    role: "UI Designer",
    joinDate: "Mar 2023",
    leaveDate: "Dec 2023",
    projectsCount: 3,
    color: "from-slate-400 to-slate-500",
  },
  {
    id: "ex-3",
    name: "Innovation Labs",
    logo: "IL",
    role: "Full Stack Developer",
    joinDate: "Jun 2022",
    leaveDate: "Feb 2023",
    projectsCount: 8,
    color: "from-slate-400 to-slate-500",
  },
];

export default function MyTeams() {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState<typeof myTeams[0] | null>(null);
  const navigate = useNavigate();

  const handleTeamClick = (team: typeof myTeams[0]) => {
    navigate(`/${team.id}/team`);
  };

  const handleSettingsClick = (e: React.MouseEvent, team: typeof myTeams[0]) => {
    e.stopPropagation();
    setSelectedTeam(team);
    setShowSettingsModal(true);
  };

  return (
    <WorkspaceLayout>
      <ScrollArea className="h-[calc(100vh-120px)]">
        <div className="p-6 lg:p-8 max-w-7xl mx-auto">
          {/* Current Teams Section */}
          <div className="widget-card bg-sidebar-border/5 p-6 rounded-xl mb-8">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-primary" />
                <h2 className="text-lg font-semibold">My Teams</h2>
                <span className="text-sm text-muted-foreground">({myTeams.length})</span>
              </div>
              <Button onClick={() => setShowCreateModal(true)} size="sm">
                <Plus className="w-4 h-4 mr-1" />
                Create Team
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {myTeams.map((team) => (
                <div
                  key={team.id}
                  onClick={() => handleTeamClick(team)}
                  className="group relative p-4 rounded-xl border border-border bg-card hover:shadow-lg hover:border-primary/20 transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-ring"
                  tabIndex={0}
                  role="button"
                  aria-label={`Open ${team.name}`}
                  onKeyDown={(e) => e.key === "Enter" && handleTeamClick(team)}
                >
                  {/* Settings Button */}
                  <button
                    onClick={(e) => handleSettingsClick(e, team)}
                    className="absolute top-3 right-3 p-1.5 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-muted transition-all"
                    aria-label={`${team.name} settings`}
                  >
                    <Settings className="w-4 h-4 text-muted-foreground" />
                  </button>

                  <div className="flex items-start gap-3">
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${team.color} flex items-center justify-center text-lg font-bold text-white`}>
                      {team.logo}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold truncate">{team.name}</h3>
                      <p className="text-sm text-muted-foreground line-clamp-2 mt-1">{team.description}</p>
                    </div>
                  </div>

                  {/* Projects */}
                  <div className="mt-4 pt-3 border-t border-border">
                    <div className="flex items-center gap-1.5 text-sm text-muted-foreground mb-2">
                      <FolderKanban className="w-4 h-4" />
                      <span>Projects ({team.projects.length})</span>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {team.projects.slice(0, 2).map((project) => (
                        <Badge key={project.id} variant="secondary" className="text-xs">
                          {project.name}
                        </Badge>
                      ))}
                      {team.projects.length > 2 && (
                        <Badge variant="outline" className="text-xs">
                          +{team.projects.length - 2} more
                        </Badge>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between mt-4 pt-3 border-t border-border">
                    <div className="flex items-center gap-1.5 text-sm">
                      {team.role === "Team Leader" ? (
                        <Crown className="w-4 h-4 text-warning" />
                      ) : (
                        <User className="w-4 h-4 text-muted-foreground" />
                      )}
                      <span className={team.role === "Team Leader" ? "text-warning font-medium" : "text-muted-foreground"}>
                        {team.role}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Users className="w-4 h-4" />
                      <span>{team.members}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Ex-Teams Section */}
          <div className="widget-card bg-muted/30 p-6 rounded-xl">
            <div className="flex items-center gap-2 mb-6">
              <Building2 className="w-5 h-5 text-muted-foreground" />
              <h2 className="text-lg font-semibold text-muted-foreground">Previous Teams</h2>
              <span className="text-sm text-muted-foreground">({exTeams.length})</span>
            </div>

            <div className="space-y-3">
              {exTeams.map((team) => (
                <div
                  key={team.id}
                  className="flex items-center gap-4 p-4 rounded-xl border border-border bg-card/50"
                >
                  <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${team.color} flex items-center justify-center text-sm font-bold text-white opacity-60`}>
                    {team.logo}
                  </div>

                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-foreground">{team.name}</h3>
                    <p className="text-sm text-muted-foreground">{team.role}</p>
                  </div>

                  <div className="flex items-center gap-6 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-4 h-4" />
                      <span>{team.joinDate} - {team.leaveDate}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <FolderKanban className="w-4 h-4" />
                      <span>{team.projectsCount} projects</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </ScrollArea>

      <CreateTeamModal open={showCreateModal} onOpenChange={setShowCreateModal} />
      {selectedTeam && (
        <TeamSettingsModal
          open={showSettingsModal}
          onOpenChange={setShowSettingsModal}
          team={selectedTeam}
        />
      )}
    </WorkspaceLayout>
  );
}
