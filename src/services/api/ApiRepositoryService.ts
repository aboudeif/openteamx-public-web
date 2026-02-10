import { api } from "@/lib/api";

export class ApiRepositoryService {
  async getRepositories(teamId: string): Promise<any[]> {
    return api.get<any[]>(`/teams/${teamId}/repositories`);
  }

  async addRepository(teamId: string, repository: any): Promise<any> {
    return api.post<any>(`/teams/${teamId}/repositories`, repository);
  }

  async getRepositoryDetails(teamId: string, repositoryId: string): Promise<any> {
    return api.get<any>(`/teams/${teamId}/repositories/${repositoryId}`);
  }

  async getRepositoryTree(teamId: string, repositoryId: string, path: string, branch: string): Promise<any[]> {
    return api.get<any[]>(`/teams/${teamId}/repositories/${repositoryId}/tree?path=${path}&branch=${branch}`);
  }

  async getFileContent(teamId: string, repositoryId: string, path: string, branch: string): Promise<any> {
    return api.get<any>(`/teams/${teamId}/repositories/${repositoryId}/blob?path=${path}&branch=${branch}`);
  }

  async getCommits(teamId: string, repositoryId: string, branch: string): Promise<any[]> {
    return api.get<any[]>(`/teams/${teamId}/repositories/${repositoryId}/commits?branch=${branch}`);
  }

  async getBranches(teamId: string, repositoryId: string): Promise<any[]> {
    return api.get<any[]>(`/teams/${teamId}/repositories/${repositoryId}/branches`);
  }

  async getContributors(teamId: string, repositoryId: string): Promise<any[]> {
    return api.get<any[]>(`/teams/${teamId}/repositories/${repositoryId}/contributors`);
  }

  async deleteRepository(teamId: string, repositoryId: string): Promise<void> {
    return api.delete(`/teams/${teamId}/repositories/${repositoryId}`);
  }

  async getAvailableRepos(provider: string): Promise<any[]> {
    return api.get<any[]>(`/integrations/git/${provider}/repos`);
  }
}
