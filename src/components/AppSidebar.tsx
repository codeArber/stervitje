import { Calendar, Dumbbell, History, Home, Inbox, LogOut, Search, Settings, Swords, User, Users, ChevronDown, ChevronRight } from "lucide-react"
import { useState } from "react"

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
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/stores/auth-store";

// Menu items with improved icons
const items = [
  {
    title: "Today",
    url: "/dashboard",
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
    icon: Swords, // Changed from Dumbbell to differentiate
  },
  {
    title: "Explore",
    url: "/explore",
    icon: Search,
    items: [
      {
        title: "Teams",
        url: "/explore/teams",
        icon: Users
      },
      {
        title: "Plans",
        url: "/explore/plans",
        icon: Calendar
      },
      {
        title: "People",
        url: "/explore/users",
        icon: User
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
        url: "/profile/measurements",
        icon: History
      },
      {
        title: "Performance",
        url: "/profile/performance",
        icon: Inbox
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
  const { signOut } = useAuthStore();
  const navigate = useNavigate();
  
  // State to manage which items are expanded
  const [expandedItems, setExpandedItems] = useState<string[]>(() => {
    // Auto-expand items that contain the current route
    return items
      .filter(item => item.items && item.items.some(subItem => location.includes(subItem.url)))
      .map(item => item.title);
  });

  const toggleExpanded = (itemTitle: string) => {
    setExpandedItems(prev => 
      prev.includes(itemTitle)
        ? prev.filter(title => title !== itemTitle)
        : [...prev, itemTitle]
    );
  };

  const isExpanded = (itemTitle: string) => expandedItems.includes(itemTitle);

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate({ to: '/login' });
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  return (
    <Sidebar>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="px-2 py-1.5 text-xs font-semibold text-sidebar-foreground/70">
            Application
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="gap-0.5">
              {items.map((item) => {
                const isActive = location.includes(item.url);
                const hasSubItems = item.items && item.items.length > 0;
                const isItemExpanded = isExpanded(item.title);
                
                return (
                  <SidebarMenuItem key={item.title}>
                    {hasSubItems ? (
                      <div className="flex items-center justify-between w-full">
                        <SidebarMenuButton 
                          asChild
                          className={cn(
                            "px-2 py-1.5 h-8 text-sm font-medium transition-colors flex-1",
                            isActive && "bg-sidebar-accent text-sidebar-accent-foreground"
                          )}
                        >
                          <Link to={item.url} className="flex items-center gap-2">
                            <item.icon className="h-4 w-4" />
                            <span>{item.title}</span>
                          </Link>
                        </SidebarMenuButton>
                        <button
                          onClick={() => toggleExpanded(item.title)}
                          className="p-1 hover:bg-sidebar-accent/50 rounded transition-colors"
                        >
                          {isItemExpanded ? (
                            <ChevronDown className="h-4 w-4" />
                          ) : (
                            <ChevronRight className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                    ) : (
                      <SidebarMenuButton 
                        asChild
                        className={cn(
                          "px-2 py-1.5 h-8 text-sm font-medium transition-colors",
                          isActive && "bg-sidebar-accent text-sidebar-accent-foreground"
                        )}
                      >
                        <Link to={item.url} className="flex items-center gap-2">
                          <item.icon className="h-4 w-4" />
                          <span>{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    )}
                    
                    {hasSubItems && isItemExpanded && (
                      <SidebarMenuSub className="ml-3 mt-0.5 border-l border-sidebar-border pl-3">
                        {item.items?.map((subItem) => {
                          const isSubActive = location.includes(subItem.url);
                          return (
                            <SidebarMenuSubItem key={subItem.title}>
                              <SidebarMenuSubButton 
                                asChild
                                className={cn(
                                  "px-2 py-1 h-7 text-sm transition-colors",
                                  isSubActive && "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                                )}
                              >
                                <Link to={subItem.url} className="flex items-center gap-2">
                                  {subItem.icon && <subItem.icon className="h-3.5 w-3.5" />}
                                  <span>{subItem.title}</span>
                                </Link>
                              </SidebarMenuSubButton>
                            </SidebarMenuSubItem>
                          );
                        })}
                      </SidebarMenuSub>
                    )}
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      
      <SidebarFooter className="p-1">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton 
              onClick={handleSignOut}
              className="px-2 py-1.5 h-8 text-sm font-medium text-red-600 hover:bg-red-50 hover:text-red-700 transition-colors"
            >
              <LogOut className="h-4 w-4" />
              <span>Sign Out</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}