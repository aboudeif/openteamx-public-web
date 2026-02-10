import { IProjectService } from "@/services/interfaces/IProjectService";
import { Project } from "@/shared/types";
import { api } from "@/lib/api";

export class ApiProjectService implements IProjectService {
  async getProjects(teamId: string): Promise<Project[]> {
    return api.get<Project[]>(`/teams/${teamId}/projects`);
  }

  async getProjectById(id: string): Promise<Project | null> {
    return api.get<Project>(`/projects/${id}`);
  }

  async createProject(teamId: string, project: Partial<Project>): Promise<Project> {
    return api.post<Project>(`/teams/${teamId}/projects`, project);
  }

  async updateTaskStatus(taskId: string, status: string): Promise<void> {
    return api.put(`/tasks/${taskId}/status`, { status });
  }
}
