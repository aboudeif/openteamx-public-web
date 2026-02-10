import { MockChatService } from "./mock/MockChatService";
import { MockDriveService } from "./mock/MockDriveService";
import { MockProjectService } from "./mock/MockProjectService";
import { MockTeamService } from "./mock/MockTeamService";

import { ApiChatService } from "./api/ApiChatService";
import { ApiDriveService } from "./api/ApiDriveService";
import { ApiProjectService } from "./api/ApiProjectService";
import { ApiTeamService } from "./api/ApiTeamService";

import { IChatService } from "./interfaces/IChatService";
import { IDriveService } from "./interfaces/IDriveService";
import { IProjectService } from "./interfaces/IProjectService";
import { ITeamService } from "./interfaces/ITeamService";

// Default to true to maintain current behavior until backend is ready
const useMock = import.meta.env.VITE_USE_MOCK !== 'false';

export const chatService: IChatService = useMock ? new MockChatService() : new ApiChatService();
export const driveService: IDriveService = useMock ? new MockDriveService() : new ApiDriveService();
export const projectService: IProjectService = useMock ? new MockProjectService() : new ApiProjectService();
export const teamService: ITeamService = useMock ? new MockTeamService() : new ApiTeamService();
