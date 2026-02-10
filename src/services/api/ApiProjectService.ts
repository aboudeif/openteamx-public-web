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

  async getTasks(teamId: string, projectId: string): Promise<any[]> {
    return api.get<any[]>(`/teams/${teamId}/projects/${projectId}/tasks`);
  }

  async createTask(teamId: string, projectId: string, task: any): Promise<any> {
    return api.post<any>(`/teams/${teamId}/projects/${projectId}/tasks`, task);
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
