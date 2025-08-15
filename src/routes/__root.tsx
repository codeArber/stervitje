import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createRootRoute, Outlet } from '@tanstack/react-router';
import { Auth } from '@/components/Auth'; // Your login component
import { AppSidebar } from '@/components/AppSidebar';
import { SidebarProvider } from '@/components/ui/sidebar';
import { useAuthStore } from '@/stores/auth-store'; // Our new Zustand store!

export const Route = createRootRoute({
  component: Root,
});

const queryClient = new QueryClient();

function Root() {
  const { user, isLoading } = useAuthStore();

  if (isLoading) {
    return <div className="w-screen h-screen bg-background" />;
  }

  return (
    <div className='w-screen h-screen flex flex-col'>
      <SidebarProvider>
        <QueryClientProvider client={queryClient}>
          {!user ? <Auth /> : (
            <>
              <AppSidebar />
              <Outlet />
            </>
          )}
        </QueryClientProvider>
      </SidebarProvider>
    </div>
  );
}