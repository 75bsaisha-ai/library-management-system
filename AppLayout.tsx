import { ReactNode } from "react";
import { Sidebar } from "./Sidebar";

interface AppLayoutProps {
  children: ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  return (
    <div className="flex h-screen bg-background overflow-hidden relative selection:bg-primary/30 selection:text-primary-foreground">
      {/* Decorative ambient light */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-primary/5 blur-[120px] pointer-events-none" />
      
      <Sidebar />
      
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative z-10">
        <main className="flex-1 overflow-y-auto focus:outline-none scroll-smooth">
          <div className="py-12 px-8 md:px-12 max-w-7xl mx-auto h-full animate-in fade-in slide-in-from-bottom-4 duration-700 ease-out">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
