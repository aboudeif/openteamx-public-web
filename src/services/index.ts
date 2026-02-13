import { MockChatService } from "./mock/MockChatService";
import { MockDriveService } from "./mock/MockDriveService";
import { MockProjectService } from "./mock/MockProjectService";
import { MockTeamService } from "./mock/MockTeamService";

import { ApiChatService } from "./api/ApiChatService";
import { ApiDriveService } from "./api/ApiDriveService";
import { ApiProjectService } from "./api/ApiProjectService";
import { ApiTeamService } from "./api/ApiTeamService";
import { ApiAuthService } from "./api/ApiAuthService";
import { ApiTalentService } from "./api/ApiTalentService";
import { ApiWalletService } from "./api/ApiWalletService";
import { ApiNotificationService } from "./api/ApiNotificationService";
import { ApiMailService } from "./api/ApiMailService";
import { ApiCalendarService } from "./api/ApiCalendarService";
import { ApiRepositoryService } from "./api/ApiRepositoryService";
import { ApiMeetingService } from "./api/ApiMeetingService";
import { ApiMeetingNotesService } from "./api/ApiMeetingNotesService";
import { ApiIntegrationService } from "./api/ApiIntegrationService";
import { ApiHelpCenterService } from "./api/ApiHelpCenterService";
import { ApiApiKeysService } from "./api/ApiApiKeysService";

import { IChatService } from "./interfaces/IChatService";
import { IDriveService } from "./interfaces/IDriveService";
import { IProjectService } from "./interfaces/IProjectService";
import { ITeamService } from "./interfaces/ITeamService";

type AppEnv = "demo" | "dev" | "production";

function resolveAppEnv(): AppEnv {
  const rawEnv = (import.meta.env.VITE_ENV || import.meta.env.MODE || "dev").toLowerCase();

  if (rawEnv === "demo") {
    return "demo";
  }

  if (rawEnv === "production") {
    return "production";
  }

  // Treat Vite's default "development" as "dev".
  return "dev";
}

const appEnv = resolveAppEnv();
const useMock = appEnv === "demo";
export const APP_ENV = appEnv;
export const IS_DEMO_MODE = useMock;

export const chatService: IChatService = useMock ? new MockChatService() : new ApiChatService();
export const driveService: IDriveService = useMock ? new MockDriveService() : new ApiDriveService();
export const projectService: IProjectService = useMock ? new MockProjectService() : new ApiProjectService();
export const teamService: ITeamService = useMock ? new MockTeamService() : new ApiTeamService();

export const authService = new ApiAuthService();
export const talentService = new ApiTalentService();
export const walletService = new ApiWalletService();
export const notificationService = new ApiNotificationService();
export const mailService = new ApiMailService();
export const calendarService = new ApiCalendarService();
export const repositoryService = new ApiRepositoryService();
export const meetingService = new ApiMeetingService();
export const meetingNotesService = new ApiMeetingNotesService();
export const integrationService = new ApiIntegrationService();
export const helpCenterService = new ApiHelpCenterService();
export const apiKeysService = new ApiApiKeysService();
