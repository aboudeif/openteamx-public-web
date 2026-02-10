# Discovery Feature

The Discovery feature is the public-facing entry point where users find and join teams.

## 📁 Structure

- **`pages/DiscoverTeamsPage.tsx`**: Main grid view of available teams.
- **`components/`**: 
  - `FiltersBar.tsx`: UI for filtering by category, size, etc.
  - `SearchBar.tsx`: Input for text search.
  - `TeamCard.tsx`: Individual team preview component.

## 🚀 Key Capabilities
- **Search**: Filter teams by name or skills.
- **Filtering**: Multi-faceted filtering (Status, Size, Location).
- **Infinite Scroll**: Simulated lazy loading of team cards.

## 🔌 Data Sources
- **Shared Data**: Imports `mockTeams` and `filterGroups` from `src/data/teams.ts`.
- **Service Layer**: Uses `teamService.ts` to simulate async fetching with latency.

## 🔮 Expected Backend Interaction
- **Search API**: Server-side filtering and full-text search (Elasticsearch/Algolia).
- **Pagination**: Cursor-based pagination for large datasets.
