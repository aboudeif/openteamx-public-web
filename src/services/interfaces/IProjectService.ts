import { Project, Task } from "@/shared/types";

export interface IProjectService {
  getProjects(teamId: string): Promise<Project[]>;
  getProjectById(id: string): Promise<Project | null>;
  createProject(teamId: string, project: Partial<Project>): Promise<Project>;
  updateTaskStatus(taskId: string, status: string): Promise<void>;
}
