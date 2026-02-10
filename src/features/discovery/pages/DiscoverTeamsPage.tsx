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

export default function DiscoverTeams() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilters, setSelectedFilters] = useState<Record<string, string[]>>({});
  const [teams, setTeams] = useState<Team[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadMoreRef = useRef<HTMLDivElement>(null);

  // Simulate initial load
  useEffect(() => {
    const fetchInitialTeams = async () => {
      try {
        // Initial load simulated delay: 1000ms
        const initialTeams = await teamService.getTeams(0, 6, 1000);
        setTeams(initialTeams);
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
      const nextTeams = await teamService.getTeams(teams.length, 4);
      if (nextTeams.length === 0) {
        setHasMore(false);
      } else {
        setTeams((prev) => [...prev, ...nextTeams]);
      }
    } catch (error) {
      console.error("Failed to load more teams", error);
    } finally {
      setIsLoading(false);
      setPage((p) => p + 1);
    }
  }, [hasMore, isLoading, teams.length]);

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
    navigate(`${teamId}/team`);
  };

  // Filter teams based on search and filters
  const filteredTeams = teams.filter((team) => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const matchesSearch =
        team.name.toLowerCase().includes(query) ||
        team.description.toLowerCase().includes(query) ||
        team.tags.some((tag) => tag.toLowerCase().includes(query));
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
          description="Find teams that match your skills and interests"
        >
          <Button>
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
                <TeamCard key={team.id} team={team} onViewTeam={handleViewTeam} />
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
    </WorkspaceLayout>
  );
}
