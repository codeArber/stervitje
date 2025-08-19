import { Calendar, Dumbbell, History, Home, Inbox, LogOut, Search, Settings, Swords, User, Users } from "lucide-react"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
} from "@/components/ui/sidebar"
import { Link, useLocation, useNavigate } from "@tanstack/react-router";
import { title } from "process";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/stores/auth-store";

// Menu items.
const items = [
  {
    title: "Today",
    url: "/",
    icon: Home,
  },
  {
    title: "Workspace",
    url: "/workspace",
    icon: User,
  },
  {
    title: "Workout",
    url: "/workout",
    icon: Dumbbell,
  },
  {
    title: "Exercises",
    url: "/exercise",
    icon: Dumbbell,
  },
  {
    title: "Explore",
    url: "/explore",
    icon: Search,
    items: [
      {
        title: "Teams",
        url: "/explore/teams"
      },
      {
        title: "Plans",
        url: "/explore/plans"
      },
      {
        title: "People",
        url: "/explore/users"
      }
    ]
  },
  {
    title: "Profile",
    url: "/profile",
    icon: User,
    items: [
      {
        title: "Measurements",
        url: "/profile/measurements"
      },
      {
        title: "Performance",
        url: "/profile/performance"
      },
    ]
  },
  {
    title: "Settings",
    url: "/settings",
    icon: Settings,
  },
]


export function AppSidebar() {
  const location = useLocation().pathname
  const { signOut } = useAuthStore(); // Get the signOut action from your store
  const navigate = useNavigate();

  const handleSignOut = async () => {
    try {
      await signOut(); // Call the signOut function from your Zustand store
      navigate({ to: '/login' }); // Navigate to the login page after signing out
    } catch (error) {
      console.error("Error signing out:", error);
      // Optionally, show a toast notification for sign-out errors
    }
  };
  return (
    <Sidebar>
      <SidebarContent >
        <SidebarGroup>
          <div>
            {/* <UserDropdown /> */}
          </div>
          <SidebarGroupLabel>Application</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title} className={cn(location.includes(item.url) ? "bg-sidebar-border rounded" : "", item.url === '/workout' && location.includes(item.url) && "bg-red-200", item.url === '/workout' && 'bg-blue-100 rounded')}>
                  {item.items ? (
                    <>
                      <SidebarMenuButton asChild>
                        <Link to={item.url}>
                          <item.icon />
                          <span>{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                      <SidebarMenuSub>
                        {item.items.map((subItem) => (
                          <SidebarMenuSubItem key={subItem.title}>
                            <SidebarMenuSubButton asChild>
                              <Link to={subItem.url}>
                                <span>{subItem.title}</span>
                              </Link>
                            </SidebarMenuSubButton>
                          </SidebarMenuSubItem>
                        ))}
                      </SidebarMenuSub>
                    </>
                  ) : (
                    <SidebarMenuButton asChild>
                      <Link to={item.url}>
                        <item.icon />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  )}
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        {/* Sign Out Button */}
        <SidebarMenu className="w-full"> {/* Wrap in SidebarMenu for consistent styling */}
          <SidebarMenuItem>
            <SidebarMenuButton onClick={handleSignOut}> {/* Use onClick directly for the button */}
              <LogOut className="h-5 w-5" />
              <span>Sign Out</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}
