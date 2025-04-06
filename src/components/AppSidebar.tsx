import { Calendar, Home, Inbox, LogOut, Search, Settings, User } from "lucide-react"

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
import { Link } from "@tanstack/react-router";
import { useIsPersonalContext } from "@/store/useTeamStore";
import { title } from "process";

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
    title: "History",
    url: "/history",
    icon: Search,
  },
  {
    title: 'Discover',
    url: '/discover',
    icon: Search,
  },
  {
    title: "Settings",
    url: "/settings",
    icon: Settings,
  },
]


export function AppSidebar() {
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
                <SidebarMenuItem key={item.title}>
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
