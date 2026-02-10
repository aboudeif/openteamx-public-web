# Team Nexus

Team Nexus is a comprehensive platform for team collaboration, talent management, and project discovery. It integrates chat, drive, tasks, meetings, and code repositories into a unified workspace.

## 🗺️ Feature Map

This project is organized by feature to enhance discoverability and scalability.

### 🌟 Core Experience
- **[Team Discovery](src/features/discovery/README.md)**: Find and join teams.
- **[Talent Workspace](src/features/talent/README.md)**: Manage your profile, wallet, and rewards.

### 💼 Team Workspace
Once inside a team (`/:teamId/...`), you have access to:

- **[Chat](src/features/chat/README.md)**: Real-time messaging with file sharing.
- **[Drive](src/features/drive/README.md)**: Document storage with built-in Editors.
- **[Projects](src/features/projects/README.md)**: Kanban boards and Task management.
- **[Meetings](src/features/meetings/README.md)**: Calendar, meeting notes, and scheduling.
- **[Repositories](src/features/repositories/README.md)**: Git integration and code viewing.
- **[Mail](src/features/mail/README.md)**: Internal team communication.
- **[Team Workspace](src/features/team-workspace/README.md)**: Team Dashboard and Activity.

## 🏗️ Architecture & Data Flow

### Directory Structure

```
src/
├── features/           # Feature-based modules
│   ├── [feature]/
│   │   ├── pages/      # Route Entry Points
│   │   ├── components/ # Internal UI Components
│   │   └── README.md   # Feature Documentation
├── components/         # Shared / Universal Components
│   ├── ui/             # Design System (shadcn/ui)
│   ├── shared/         # Reusable Widgets (e.g., WidgetCard)
│   ├── layout/         # App Scaffolds (Nav, Sidebars)
├── services/           # Data Services & Adapters
├── data/               # Static Mock Data
├── lib/                # Utilities
└── App.tsx             # Main Router
```

### Data Layer
- **Source of Truth**: Currently relies on `src/data/teams.ts` and component-level static data (arrays of objects).
- **Services**: `src/services/` acts as an abstraction layer. Currently, it simulates network delays and returns mock data.
- **Future API Intention**: The service layer is designed to be swapped. `getTeams()` currently returns a Promise from a local array, but can be updated to `fetch('/api/teams')` without modifying the UI components.

## 🚀 Getting Started

1. **Install**: `npm install`
2. **Run**: `npm run dev`
3. **Explore**:
    - Visit `/` to discover teams.
    - Click a team to enter the Team Workspace.
    - Navigate using the Sidebar.

## 🎨 Design System
We use **shadcn/ui** components styled with **Tailwind CSS**.
Shared UI components reside in `src/components/ui`.

---
*Curated with 💙 for Team Nexus*
