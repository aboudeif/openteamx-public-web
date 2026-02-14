import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { WorkspaceLayout } from "@/components/layout/WorkspaceLayout";
import { PageHeader } from "@/components/layout/PageHeader";
import { SearchBar } from "@/features/discovery/components/SearchBar";
import { FiltersBar } from "@/features/discovery/components/FiltersBar";
import { TeamCard } from "@/features/discovery/components/TeamCard";
import { TeamCardSkeleton } from "@/components/ui/skeleton-card";
import { EmptyState } from "@/components/ui/empty-state";
import { Search, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { teamService } from "@/services";
import { filterGroups } from "@/data/teams";
import { Team } from "@/shared/types";
import { toast } from "sonner";
import { CreateTeamModal } from "@/features/talent/components/CreateTeamModal";

type TeamWithOptionalTags = Team & { tags?: string[] };
const PAGE_SIZE = 6;

function extractTeams(payload: unknown): Team[] {
  if (Array.isArray(payload)) {
    return payload as Team[];
  }

  if (payload && typeof payload === "object") {
    const candidate = payload as { data?: unknown; items?: unknown };

    if (Array.isArray(candidate.data)) {
      return candidate.data as Team[];
    }

    if (Array.isArray(candidate.items)) {
      return candidate.items as Team[];
    }
  }

  return [];
}

function extractHasNext(payload: unknown, fetchedCount: number, limit: number): boolean {
  if (payload && typeof payload === "object") {
    const candidate = payload as { meta?: { hasNext?: unknown } };
    if (typeof candidate.meta?.hasNext === "boolean") {
      return candidate.meta.hasNext;
    }
  }

  return fetchedCount >= limit;
}

export default function DiscoverTeams() {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilters, setSelectedFilters] = useState<Record<string, string[]>>({});
  const [teams, setTeams] = useState<Team[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const [memberTeamIds, setMemberTeamIds] = useState<Set<string>>(new Set());
  const [requestedTeamIds, setRequestedTeamIds] = useState<Set<string>>(new Set());
  const [joiningTeamIds, setJoiningTeamIds] = useState<Set<string>>(new Set());
  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadMoreRef = useRef<HTMLDivElement>(null);

  // Initial load
  useEffect(() => {
    const fetchInitialTeams = async () => {
      try {
        const [initialTeamsResponse, myTeamsResponse] = await Promise.all([
          teamService.getDiscoverableTeams(1, PAGE_SIZE),
          teamService.getMyActiveTeams(),
        ]);
        const initialTeams = extractTeams(initialTeamsResponse);
        const myTeams = Array.isArray(myTeamsResponse) ? myTeamsResponse : [];

        setTeams(initialTeams);
        setMemberTeamIds(new Set(myTeams.map((team) => team.id)));
        setHasMore(extractHasNext(initialTeamsResponse, initialTeams.length, PAGE_SIZE));
        setPage(1);
      } catch (error) {
        console.error("Failed to load teams", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchInitialTeams();
  }, []);

  // Infinite scroll
  const loadMore = useCallback(async () => {
    if (!hasMore || isLoading) return;

    setIsLoading(true);
    try {
      const nextPage = page + 1;
      const nextTeamsResponse = await teamService.getDiscoverableTeams(nextPage, PAGE_SIZE);
      const nextTeams = extractTeams(nextTeamsResponse);
      if (nextTeams.length === 0) {
        setHasMore(false);
      } else {
        setTeams((prev) => [...prev, ...nextTeams]);
        setHasMore(extractHasNext(nextTeamsResponse, nextTeams.length, PAGE_SIZE));
        setPage(nextPage);
      }
    } catch (error) {
      console.error("Failed to load more teams", error);
    } finally {
      setIsLoading(false);
    }
  }, [hasMore, isLoading, page]);

  useEffect(() => {
    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          loadMore();
        }
      },
      { threshold: 0.1 }
    );

    if (loadMoreRef.current) {
      observerRef.current.observe(loadMoreRef.current);
    }

    return () => observerRef.current?.disconnect();
  }, [loadMore]);

  const handleFilterChange = (filterId: string, values: string[]) => {
    setSelectedFilters((prev) => ({
      ...prev,
      [filterId]: values,
    }));
  };

  const handleClearFilters = () => {
    setSelectedFilters({});
  };

  const handleViewTeam = (teamId: string) => {
    navigate(`/${teamId}/team`);
  };

  const handleRequestToJoin = async (teamId: string) => {
    if (joiningTeamIds.has(teamId) || requestedTeamIds.has(teamId)) {
      return;
    }

    setJoiningTeamIds((prev) => new Set(prev).add(teamId));

    try {
      await teamService.requestToJoinTeam(
        teamId,
        "I would like to join this team.",
        "Team Member",
      );

      const refreshedTeams = await teamService.getMyActiveTeams();
      const isNowMember = refreshedTeams.some((team) => team.id === teamId);

      if (isNowMember) {
        setMemberTeamIds((prev) => new Set(prev).add(teamId));
        setRequestedTeamIds((prev) => {
          const next = new Set(prev);
          next.delete(teamId);
          return next;
        });
        toast.success("You joined this team.");
      } else {
        setRequestedTeamIds((prev) => new Set(prev).add(teamId));
        toast.success("Join request sent.");
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to send join request.";
      toast.error(message);
    } finally {
      setJoiningTeamIds((prev) => {
        const next = new Set(prev);
        next.delete(teamId);
        return next;
      });
    }
  };

  // Filter teams based on search and filters
  const filteredTeams = teams.filter((team) => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const description = typeof team.description === "string" ? team.description : "";
      const tags = Array.isArray((team as TeamWithOptionalTags).tags)
        ? (team as TeamWithOptionalTags).tags
        : Array.isArray(team.tags)
          ? team.tags
          : [];
      const matchesSearch =
        team.name.toLowerCase().includes(query) ||
        description.toLowerCase().includes(query) ||
        tags.some((tag: string) => tag.toLowerCase().includes(query));
      if (!matchesSearch) return false;
    }
    return true;
  });

  const showEmptyState = !isLoading && filteredTeams.length === 0;

  return (
    <WorkspaceLayout>
      <div className="p-6 lg:p-8 max-w-7xl mx-auto">
        <PageHeader
          title="Discover Teams"
          titleClassName="text-xl font-semibold text-primary/50"
          description="Find team/s that match your skills and interests"
          descriptionClassName="text-xxl text-gray-400 status-badge mx-0 px-0 my-1"
        >
          <Button onClick={() => setShowCreateModal(true)}>
            <Users className="w-4 h-4 mr-2" />
            Create Team
          </Button>
        </PageHeader>

        {/* Search and Filters */}
        <div className="space-y-4 mb-8">
          <SearchBar
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search teams by name, skills, or category..."
            className="max-w-2xl"
          />
          <FiltersBar
            filters={filterGroups}
            selectedFilters={selectedFilters}
            onFilterChange={handleFilterChange}
            onClearAll={handleClearFilters}
          />
        </div>

        {/* Teams Grid */}
        {showEmptyState ? (
          <EmptyState
            icon={Search}
            title="No teams found"
            description="Try adjusting your search or filters to find what you're looking for."
            action={
              <Button variant="outline" onClick={handleClearFilters}>
                Clear filters
              </Button>
            }
          />
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredTeams.map((team) => (
                <TeamCard
                  key={team.id}
                  team={team}
                  isMember={memberTeamIds.has(team.id)}
                  isRequested={requestedTeamIds.has(team.id)}
                  isLoadingRequest={joiningTeamIds.has(team.id)}
                  onViewTeam={handleViewTeam}
                  onRequestJoin={handleRequestToJoin}
                />
              ))}
              {isLoading &&
                Array.from({ length: 3 }).map((_, i) => (
                  <TeamCardSkeleton key={`skeleton-${i}`} />
                ))}
            </div>

            {/* Load More Trigger */}
            {hasMore && <div ref={loadMoreRef} className="h-20" />}

            {!hasMore && teams.length > 0 && (
              <p className="text-center text-sm text-muted-foreground py-8">
                You've reached the end of the list
              </p>
            )}
          </>
        )}
      </div>
      <CreateTeamModal open={showCreateModal} onClose={() => setShowCreateModal(false)} />
    </WorkspaceLayout>
  );
}
