import { IProjectService } from "@/services/interfaces/IProjectService";
import { Project, Task } from "@/shared/types";
import { TaskStatus, TaskPriority, ProjectStatus } from "@/shared/enums";

const projects: Project[] = [
  {
    id: "1",
    title: "Project Alpha",
    description: "Core platform development for the new product launch",
    createdAt: "Jan 15, 2026",
    dueDate: "Mar 31, 2026",
    status: ProjectStatus.Active,
    members: ["SC", "MJ", "AK"],
    createdBy: "John Doe",
    tasks: [
      {
        id: "t1",
        title: "Set up authentication system",
        status: TaskStatus.Done,
        priority: TaskPriority.High,
        assignee: "SC",
        comments: 5,
        userStory: "As a user, I want to securely log in to access my account",
        resources: ["Auth0 Docs", "Security Guidelines"],
        createdBy: "John Doe",
        createdAt: "Jan 15",
        dueDate: "Jan 25",
        estimation: "3 days",
      },
      {
        id: "t2",
        title: "Implement user dashboard",
        status: TaskStatus.InProgress,
        priority: TaskPriority.High,
        assignee: "MJ",
        comments: 3,
        userStory: "As a user, I want to see my activity overview",
        resources: ["Figma Design"],
        createdBy: "Sarah Chen",
        createdAt: "Jan 18",
        dueDate: "Feb 5",
        estimation: "5 days",
        childTasks: [
          {
            id: "t2-1",
            title: "Build stats widgets",
            status: TaskStatus.Done,
            priority: TaskPriority.Medium,
            assignee: "MJ",
            comments: 1,
            resources: [],
            createdBy: "Mike Johnson",
            createdAt: "Jan 20",
            dueDate: "Jan 28",
            estimation: "2 days",
          },
          {
            id: "t2-2",
            title: "Add activity timeline",
            status: TaskStatus.InProgress,
            priority: TaskPriority.Medium,
            assignee: "MJ",
            comments: 0,
            resources: [],
            createdBy: "Mike Johnson",
            createdAt: "Jan 22",
            dueDate: "Feb 3",
            estimation: "2 days",
          },
        ],
      },
      {
        id: "t3",
        title: "API integration for external services",
        status: TaskStatus.ToDo,
        priority: TaskPriority.Medium,
        assignee: "AK",
        comments: 2,
        userStory: "As a developer, I need to connect to third-party APIs",
        resources: ["API Documentation", "Integration Guide"],
        createdBy: "John Doe",
        createdAt: "Jan 20",
        dueDate: "Feb 15",
        estimation: "4 days",
      },
      {
        id: "t4",
        title: "Performance optimization",
        status: TaskStatus.Review,
        priority: TaskPriority.Low,
        assignee: "ED",
        comments: 1,
        resources: ["Performance Metrics"],
        createdBy: "Alex Kim",
        createdAt: "Jan 22",
        dueDate: "Feb 10",
        estimation: "2 days",
      },
    ],
  },
  {
    id: "2",
    title: "Mobile App Redesign",
    description: "Complete UI/UX overhaul for the mobile application",
    createdAt: "Jan 10, 2026",
    dueDate: "Feb 28, 2026",
    status: ProjectStatus.Active,
    members: ["SC", "ED"],
    createdBy: "Sarah Chen",
    tasks: [
      {
        id: "t5",
        title: "Create new design system",
        status: TaskStatus.Done,
        priority: TaskPriority.High,
        assignee: "SC",
        comments: 8,
        userStory: "As a designer, I need consistent design tokens",
        resources: ["Brand Guidelines", "Figma Components"],
        createdBy: "Sarah Chen",
        createdAt: "Jan 10",
        dueDate: "Jan 20",
        estimation: "5 days",
      },
      {
        id: "t6",
        title: "Redesign onboarding flow",
        status: TaskStatus.InProgress,
        priority: TaskPriority.High,
        assignee: "SC",
        comments: 4,
        resources: ["User Research"],
        createdBy: "Emily Davis",
        createdAt: "Jan 18",
        dueDate: "Feb 5",
        estimation: "4 days",
      },
    ],
  },
];

export class MockProjectService implements IProjectService {
  async getProjects(teamId: string): Promise<Project[]> {
    return new Promise(resolve => setTimeout(() => resolve([...projects]), 100));
  }

  async getProjectById(id: string): Promise<Project | null> {
    const project = projects.find(p => p.id === id);
    return new Promise(resolve => setTimeout(() => resolve(project || null), 100));
  }

  async createProject(teamId: string, project: Partial<Project>): Promise<Project> {
    // Mock implementation
    const newProject = { ...project, id: `p-${Date.now()}` } as Project;
    return Promise.resolve(newProject);
  }

  async updateTaskStatus(taskId: string, status: string): Promise<void> {
    return Promise.resolve();
  }
}

export const projectService = new MockProjectService();
