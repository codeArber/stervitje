// FILE: src/routes/__root.tsx

import { SupabaseAuthListener } from '@/components/new/SupabaseAuthListener';
import { SidebarProvider } from '@/components/ui/sidebar';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createRootRoute, Outlet } from '@tanstack/react-router';
import { Toaster } from 'sonner';

const queryClient = new QueryClient();

export const Route = createRootRoute({
  component: () => (
    <QueryClientProvider client={queryClient}>
      <SidebarProvider>
        {/* The listener is placed here to run for the entire app lifecycle */}
        <SupabaseAuthListener />

        {/* The rest of your app will render here */}
        <Outlet />
      </SidebarProvider>
      
      <Toaster />
    </QueryClientProvider>
  )
});