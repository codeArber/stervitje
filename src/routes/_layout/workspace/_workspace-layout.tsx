// FILE: src/routes/_layout/workspace/_workspace-layout.tsx

import { createFileRoute, Outlet } from '@tanstack/react-router';

// shadcn/ui components
import { Separator } from '@/components/ui/separator';
import { WorkspaceSelector } from '@/components/new/workspace/WorkspaceSelector';

export const Route = createFileRoute('/_layout/workspace/_workspace-layout')({
  component: WorkspaceLayout,
});

function WorkspaceLayout() {
  return (
    <div className="flex flex-col min-h-screen ">
      {/* Workspace specific header/selector */}
      <header className="border-b py-4 px-6 flex justify-between items-center bg-background z-10">
        <div></div>
        <WorkspaceSelector /> {/* <--- The selector is here */}
      </header>

      {/* Main content area for nested workspace routes */}
      <main className="flex-grow">
        <Outlet /> {/* This renders the content of child routes like /workspace/index or /workspace/:teamId */}
      </main>

      {/* Optional: Footer specific to workspace if needed */}
    </div>
  );
}