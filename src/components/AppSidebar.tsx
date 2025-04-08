import { Calendar, History, Home, Inbox, LogOut, Search, Settings, Swords, User } from "lucide-react"

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
} from "@/components/ui/sidebar"
import { UserDropdown } from "./UserDropdown";
import { TeamDropdown } from "./TeamDropdown";
import { Link, useLocation } from "@tanstack/react-router";
import { useIsPersonalContext } from "@/store/useTeamStore";
import { title } from "process";
import { cn } from "@/lib/utils";

// Menu items.
const items = [
  {
    title: "Today",
    url: "/",
    icon: Home,
  },
  {
    title: "Plans",
    url: "/plans",
    icon: Inbox,
  },
  {
    title: "Exercise",
    url: "/exercise",
    icon: Calendar,
  },
  {
    title: 'Discover',
    url: '/discover',
    icon: Search,
  },
  {
    title: "History",
    url: "/history",
    icon: History,
  },
  {
    title: "Performance",
    url: "/performance",
    icon: Swords,
  },
  {
    title: "Settings",
    url: "/settings",
    icon: Settings,
  },
]


export function AppSidebar() {
  const location = useLocation().pathname
  return (
    <Sidebar>
      <SidebarContent >
        <SidebarGroup>
          <div>
            <UserDropdown />
          </div>
          <SidebarGroupLabel>Application</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title} className={cn(location.includes(item.url) ? "bg-sidebar-border rounded" : "")}>
                  <SidebarMenuButton asChild>
                    <Link to={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
      </SidebarFooter>
    </Sidebar>
  )
}
