import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ScrollToTop } from "@/components/layout/ScrollToTop";
import DiscoverTeams from "./features/discovery/pages/DiscoverTeamsPage";
import TeamHome from "./features/team-workspace/pages/HomePage";
import TeamMail from "./features/mail/pages/MailPage";
import TeamChat from "./features/chat/pages/ChatPage";
import TeamProjects from "./features/projects/pages/ProjectsPage";
import TeamCalendar from "./features/meetings/pages/CalendarPage";
import TeamDrive from "./features/drive/pages/DrivePage";
import TeamJoinRequests from "./features/team-workspace/pages/JoinRequestsPage";
import TalentDashboard from "./features/talent/pages/DashboardPage";
import TalentIntegrations from "./features/talent/pages/IntegrationsPage";
import TalentHelpCenter from "./features/talent/pages/HelpPage";
import TextEditor from "./features/drive/pages/TextEditorPage";
import SpreadsheetEditor from "./features/drive/pages/SpreadsheetEditorPage";
import Wallet from "./features/talent/pages/WalletPage";
import Rewards from "./features/talent/pages/RewardsPage";
import TaskDetail from "./features/projects/pages/TaskDetailPage";
import Notifications from "./features/talent/pages/NotificationsPage";
import NotFound from "./pages/NotFound";
import MyTeams from "./features/talent/pages/MyTeamsPage";
import TeamRepositories from "./features/repositories/pages/RepositoriesPage";
import TeamRepository from "./features/repositories/pages/RepositoryPage";
import TeamMeetingNotes from "./features/meetings/pages/MeetingNotesPage";
import TeamMeetingNoteDetails from "./features/meetings/pages/MeetingNoteDetailsPage";
import TeamMeetings from "./features/meetings/pages/MeetingsPage";
import TeamActivities from "./features/team-workspace/pages/ActivitiesPage";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <ScrollToTop />
        <Routes>
          {/* Talent Workspace Routes */}
          <Route path="/overview" element={<TalentDashboard />} />
          <Route path="/myteams" element={<MyTeams />} />
          <Route path="/integrations" element={<TalentIntegrations />} />
          <Route path="/help" element={<TalentHelpCenter />} />
          <Route path="/wallet" element={<Wallet />} />
          <Route path="/rewards" element={<Rewards />} />
          <Route path="/notifications" element={<Notifications />} />
          
          {/* Team Discovery */}
          <Route path="/" element={<DiscoverTeams />} />
          
          {/* Team Workspace Routes - Dynamic team ID */}
          <Route path="/:teamId/team" element={<TeamHome />} />
          <Route path="/:teamId/mail" element={<TeamMail />} />
          <Route path="/:teamId/chat" element={<TeamChat />} />
          <Route path="/:teamId/projects" element={<TeamProjects />} />
          <Route path="/:teamId/calendar" element={<TeamCalendar />} />
          <Route path="/:teamId/drive" element={<TeamDrive />} />
          <Route path="/:teamId/drive/editor" element={<TextEditor />} />
          <Route path="/:teamId/drive/editor/:fileId" element={<TextEditor />} />
          <Route path="/:teamId/drive/spreadsheet" element={<SpreadsheetEditor />} />
          <Route path="/:teamId/drive/spreadsheet/:fileId" element={<SpreadsheetEditor />} />
          <Route path="/:teamId/tasks/:taskId" element={<TaskDetail />} />
          <Route path="/:teamId/requests" element={<TeamJoinRequests />} />
          <Route path="/:teamId/repositories" element={<TeamRepositories />} />
          <Route path="/:teamId/repository/:repositoryId" element={<TeamRepository />} />
          <Route path="/:teamId/notes" element={<TeamMeetingNotes />} />
          <Route path="/:teamId/notes/:noteId" element={<TeamMeetingNoteDetails />} />
          <Route path="/:teamId/meetings" element={<TeamMeetings />} />
          <Route path="/:teamId/activities" element={<TeamActivities />} />

          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
