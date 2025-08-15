import { Calendar, History, Home, Inbox, LogOut, Search, Settings, Swords, User, Users } from "lucide-react"

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
import { TeamDropdown } from "./TeamDropdown";
import { Link, useLocation } from "@tanstack/react-router";
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
    title: "Profile",
    url: "/profile",
    icon: User,
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
            {/* <UserDropdown /> */}
          </div>
          <SidebarGroupLabel>Application</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title} className={cn(location.includes(item.url) ? "bg-sidebar-border rounded" : "")}>
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
      </SidebarFooter>
    </Sidebar>
  )
}
