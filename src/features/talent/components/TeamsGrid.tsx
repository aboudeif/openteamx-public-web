import { useState } from "react";
import { Users, Plus, Crown, User, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CreateTeamModal } from "./CreateTeamModal";
import { TeamSettingsModal } from "./TeamSettingsModal";
import { useNavigate } from "react-router-dom";

const myTeams = [
  {
    id: 1,
    name: "TechVentures Studio",
    description: "Building next-gen AI tools for productivity",
    logo: "TV",
    role: "Team Leader",
    members: 12,
    color: "from-primary to-primary/70",
  },
  {
    id: 2,
    name: "DesignCo Agency",
    description: "Premium design services for startups",
    logo: "DC",
    role: "Team Member",
    members: 8,
    color: "from-success to-success/70",
  },
  {
    id: 3,
    name: "CodeCraft Studio",
    description: "Custom software development solutions",
    logo: "CC",
    role: "Team Member",
    members: 15,
    color: "from-warning to-warning/70",
  },
];

export function TeamsGrid() {
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
    <div className="widget-card bg-sidebar-border/5 p-6 rounded-xl pb-20">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Users className="w-5 h-5 text-primary" />
          <h3 className="text-lg font-semibold">My Teams</h3>
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
            className="group relative p-4 rounded-xl border border-border bg-card hover:shadow-lg hover:border-primary/20 transition-all cursor-pointer"
          >
            {/* Settings Button */}
            <button
              onClick={(e) => handleSettingsClick(e, team)}
              className="absolute top-3 right-3 p-1.5 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-muted transition-all"
            >
              <Settings className="w-4 h-4 text-muted-foreground" />
            </button>

            <div className="flex items-start gap-3">
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${team.color} flex items-center justify-center text-lg font-bold text-white`}>
                {team.logo}
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold truncate">{team.name}</h4>
                <p className="text-sm text-muted-foreground line-clamp-2 mt-1">{team.description}</p>
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

      <CreateTeamModal open={showCreateModal} onOpenChange={setShowCreateModal} />
      {selectedTeam && (
        <TeamSettingsModal
          open={showSettingsModal}
          onOpenChange={setShowSettingsModal}
          team={selectedTeam}
        />
      )}
    </div>
  );
}
