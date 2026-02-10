import { ReactNode } from "react";
import { WorkspaceSidebar } from "./WorkspaceSidebar";
import { TalentTopNav } from "@/features/talent/layout/TalentTopNav";
import { AppHorizontalnavbar } from "./AppHorizontalnavbar";

interface MainLayoutProps {
  children: ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  return (
    <div className="flex min-h-screen w-full bg-background">
      <WorkspaceSidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <TalentTopNav />
        <div className="sticky top-0 z-20 bg-background">
          <AppHorizontalnavbar />
        </div>
        <main className="flex-1 overflow-auto" role="main">
          {children}
        </main>
      </div>
    </div>
  );
}
