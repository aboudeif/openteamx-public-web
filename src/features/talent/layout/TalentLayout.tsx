import { ReactNode } from "react";
import { WorkspaceSidebar } from "@/components/layout/WorkspaceSidebar";
import { TalentTopNav } from "./TalentTopNav";

interface TalentLayoutProps {
  children: ReactNode;
}

export function TalentLayout({ children }: TalentLayoutProps) {
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
