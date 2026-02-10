import { WorkspaceLayout } from "@/components/layout/WorkspaceLayout";
import { ActivityAnalyticsWidget } from "@/features/talent/components/ActivityAnalyticsWidget";
import { WalletWidget } from "@/features/talent/components/WalletWidget";
import { ProfileWidget } from "@/features/talent/components/ProfileWidget";
import { CVWidget } from "@/features/talent/components/CVWidget";
import { TeamHistoryWidget } from "@/features/talent/components/TeamHistoryWidget";

export default function TalentDashboard() {
  return (
    <WorkspaceLayout>
      <div className="p-6 lg:p-8 max-w-7xl mx-auto">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-foreground">Welcome back, John</h1>
          <p className="text-muted-foreground mt-1">Here's your workspace overview</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-6">
          {/* Activity Analytics - spans 2 columns */}
          <ActivityAnalyticsWidget />
          
          {/* Wallet Widget */}
          <WalletWidget />
        </div>
        
        {/* Profile, CV, Team History */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Profile Widget */}
          <ProfileWidget />
          
          {/* CV Widget */}
          <CVWidget />
          
          {/* Team History Widget */}
          <TeamHistoryWidget />
        </div>
      </div>
    </WorkspaceLayout>
  );
}
