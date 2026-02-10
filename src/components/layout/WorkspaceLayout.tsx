import { ReactNode } from "react";
import { WorkspaceSidebar } from "./WorkspaceSidebar";
import { TalentTopNav } from "@/features/talent/layout/TalentTopNav";

interface WorkspaceLayoutProps {
  children: ReactNode;
}

export function WorkspaceLayout({ children }: WorkspaceLayoutProps) {
  return (
    <div className="flex min-h-screen w-full bg-background">
      <WorkspaceSidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <TalentTopNav />
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
