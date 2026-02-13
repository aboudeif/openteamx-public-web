import { IProjectService } from "@/services/interfaces/IProjectService";
import { Project, Task } from "@/shared/types";
import { api } from "@/lib/api";
import { ProjectStatus, TaskPriority, TaskStatus } from "@/shared/enums";

type ApiProject = {
  id: string;
  name?: string;
  title?: string;
  description?: string | null;
  createdAt?: string;
  status?: string;
  createdById?: string;
  createdBy?: string;
  tasks?: unknown[];
  members?: unknown[];
};

type ApiTask = {
  id: string;
  title?: string;
  status?: string;
  priority?: string;
  dueDate?: string | null;
  estimatedHours?: number | null;
};

export class ApiProjectService implements IProjectService {
  private normalizeStatus(status?: string): ProjectStatus {
    const normalized = status?.toLowerCase();
    if (normalized === ProjectStatus.Completed) {
      return ProjectStatus.Completed;
    }
    if (normalized === ProjectStatus.OnHold || normalized === "archived") {
      return ProjectStatus.OnHold;
    }
    return ProjectStatus.Active;
  }

  private toProject(project: ApiProject): Project {
    return {
      id: project.id,
      title: project.title || project.name || "Untitled project",
      description: project.description || "",
      createdAt: project.createdAt || "",
      dueDate: "",
      status: this.normalizeStatus(project.status),
      members: [],
      createdBy: project.createdById || project.createdBy || "",
      tasks: [],
    };
  }

  private normalizeTaskStatus(status?: string): TaskStatus {
    const normalized = (status || "").toUpperCase();
    if (normalized === "IN_PROGRESS") {
      return TaskStatus.InProgress;
    }
    if (normalized === "REVIEW") {
      return TaskStatus.Review;
    }
    if (normalized === "DONE") {
      return TaskStatus.Done;
    }
    return TaskStatus.ToDo;
  }

  private normalizeTaskPriority(priority?: string): TaskPriority {
    const normalized = (priority || "").toUpperCase();
    if (normalized === "HIGH" || normalized === "URGENT") {
      return TaskPriority.High;
    }
    if (normalized === "LOW") {
      return TaskPriority.Low;
    }
    return TaskPriority.Medium;
  }

  private toTask(task: ApiTask): Task {
    return {
      id: task.id,
      title: task.title || "Untitled task",
      status: this.normalizeTaskStatus(task.status),
      priority: this.normalizeTaskPriority(task.priority),
      assignee: "U",
      comments: 0,
      resources: [],
      createdBy: "",
      createdAt: "",
      dueDate: task.dueDate ? new Date(task.dueDate).toLocaleDateString() : "-",
      estimation: task.estimatedHours ? `${task.estimatedHours}h` : "-",
    };
  }

  async getProjects(teamId: string): Promise<Project[]> {
    const projects = await api.get<ApiProject[]>(`/projects/team/${teamId}`);
    const mapped = await Promise.all(
      projects.map(async (project) => {
        const uiProject = this.toProject(project);
        try {
          const tasks = await this.getTasks(teamId, project.id);
          uiProject.tasks = tasks.map((task) => this.toTask(task as ApiTask));
        } catch {
          uiProject.tasks = [];
        }
        return uiProject;
      }),
    );
    return mapped;
  }

  async getProjectById(id: string): Promise<Project | null> {
    return api.get<Project>(`/projects/${id}`);
  }

  async createProject(teamId: string, project: Partial<Project>): Promise<Project> {
    const created = await api.post<ApiProject>(`/projects`, {
      teamId,
      name: project.title || "Untitled project",
      description: project.description || "",
    });
    return this.toProject(created);
  }

  async updateTaskStatus(taskId: string, status: string): Promise<void> {
    return api.put(`/tasks/${taskId}/status`, { status });
  }

  async getTasks(teamId: string, projectId: string): Promise<any[]> {
    return api.get<any[]>(`/projects/${projectId}/tasks`);
  }

  async createTask(teamId: string, projectId: string, task: any): Promise<any> {
    return api.post<any>(`/projects/${projectId}/tasks/${task.taskId}`);
  }

  async getTaskDetails(teamId: string, taskId: string): Promise<any> {
    return api.get<any>(`/teams/${teamId}/tasks/${taskId}`);
  }

  async updateTask(teamId: string, taskId: string, task: any): Promise<any> {
    return api.put<any>(`/teams/${teamId}/tasks/${taskId}`, task);
  }

  async addEstimation(teamId: string, taskId: string, estimation: any): Promise<any> {
    return api.post<any>(`/teams/${teamId}/tasks/${taskId}/estimations`, estimation);
  }

  async deleteEstimation(teamId: string, taskId: string, estimationId: string): Promise<void> {
    return api.delete(`/teams/${teamId}/tasks/${taskId}/estimations/${estimationId}`);
  }

  async logWork(teamId: string, taskId: string, workLog: any): Promise<any> {
    return api.post<any>(`/teams/${teamId}/tasks/${taskId}/work-logs`, workLog);
  }

  async getWorkLogs(teamId: string, taskId: string): Promise<any[]> {
    return api.get<any[]>(`/teams/${teamId}/tasks/${taskId}/work-logs`);
  }

  async addComment(teamId: string, taskId: string, comment: any): Promise<any> {
    return api.post<any>(`/teams/${teamId}/tasks/${taskId}/comments`, comment);
  }

  async getComments(teamId: string, taskId: string): Promise<any[]> {
    return api.get<any[]>(`/teams/${teamId}/tasks/${taskId}/comments`);
  }

  async addAttachment(teamId: string, taskId: string, attachment: any): Promise<any> {
    return api.post<any>(`/teams/${teamId}/tasks/${taskId}/attachments`, attachment);
  }
}
