// FILE: src/routes/_layout.tsx

import { createFileRoute, Outlet } from '@tanstack/react-router';

export const Route = createFileRoute('/_layout')({
  component: RouteComponent,
});

// This component is now just a simple layout wrapper.
function RouteComponent() {
  // We REMOVE the useUserQuery and useEffect entirely.
  // This component's only responsibility is the layout.
  
  return (
    <div className='flex flex-1 overflow-x-hidden bg-background'>
      <Outlet />
    </div>
  );
}