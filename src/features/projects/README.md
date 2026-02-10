# Projects Feature

The Projects feature offers task management via Kanban boards and detailed task views.

## 📁 Structure

- **`pages/ProjectsPage.tsx`**: Kanban board view with drag-and-drop simulation.
- **`pages/TaskDetailPage.tsx`**: Detailed view of a single task.
- **`components/`**: 
  - `TasksWidget.tsx`: Dashboard summary widget.
  - `AddTaskModal.tsx`: Form for new tasks.

## 🚀 Key Capabilities
- **Kanban Board**: Drag tasks between "To Do", "In Progress", "Done".
- **Filtering**: Filter by assignee, priority, or tags.
- **Task Details**: Comments, attachments, and subtasks.

## 🔌 Data Sources
- **Static Data**: Initial tasks and columns are defined in `ProjectsPage.tsx`.
- **State**: Drag-and-drop state is managed locally.

## 🔮 Expected Backend Interaction
- **CRUD Operations**: API endpoints to create, read, update, and delete tasks/projects.
- **State Sync**: Persist column changes and task status updates.
- **Assignments**: Link tasks to user IDs.
