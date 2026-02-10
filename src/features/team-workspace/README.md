# Team Workspace Feature

The Team Workspace is the central hub for a specific team (`/:teamId`), aggregating all other features.

## 📁 Structure

- **`pages/HomePage.tsx`**: The main dashboard displaying widgets from other features (Chat, Drive, Meetings, etc.).
- **`pages/ActivitiesPage.tsx`**: A timeline of team actions.
- **`pages/JoinRequestsPage.tsx`**: Administration view for incoming members.
- **`components/`**: 
  - `ActivityWidget.tsx`: Feed of recent team events.
  - `TeamSettingsModal.tsx`: Configuration for the team instance.

## 🚀 Key Capabilities
- **Dashboard**: High-level view of team health and recent items.
- **Navigation**: Entry point to specific tools (Drive, Projects, etc.).
- **Administration**: Manage settings and members.

## 🔌 Data Sources
- **Static Context**: The team name ("TechVentures Studio") and metadata are currently hardcoded in `HomePage.tsx`.
- **Route Params**: Receives `:teamId` from the URL, but currently ignores it for data fetching (renders static content).

## 🔮 Expected Backend Interaction
- **Team Context API**: Fetch details for the specific `teamId` in the URL.
- **Role-Based Access**: Hide/Show settings or requests based on user role (Admin vs Member).
