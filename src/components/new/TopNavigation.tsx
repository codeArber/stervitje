import { ChevronRight, Home, Search, Calendar, User, Dumbbell, Settings, Users, Swords, History, Inbox } from "lucide-react";
import { Link, useLocation } from "@tanstack/react-router";
import { cn } from "@/lib/utils";
import React from "react";

// Icon mapping for different route segments
const iconMap: Record<string, any> = {
  dashboard: Home,
  home: Home,
  explore: Search,
  plans: Calendar,
  teams: Users,
  users: User,
  people: User,
  profile: User,
  measurements: History,
  performance: Inbox,
  workout: Dumbbell,
  exercise: Swords,
  exercises: Swords,
  settings: Settings,
};

// Custom labels for route segments (optional)
const labelMap: Record<string, string> = {
  users: "People",
  // Add more custom labels as needed
};

export interface BreadcrumbItem {
  label: string;
  href?: string;
  icon?: any;
}

interface BreadcrumbProps {
  items?: BreadcrumbItem[];
  currentPath?: string;
  className?: string;
  rightContent?: React.ReactNode;
}

// Helper function to generate breadcrumb items from path
const generateBreadcrumbsFromPath = (path: string): BreadcrumbItem[] => {
  const segments = path.split('/').filter(Boolean);
  const breadcrumbs: BreadcrumbItem[] = [];
  
  // Always add a "Home" or "Dashboard" entry if the path is not just "/"
  if (path !== '/') {
      breadcrumbs.push({
          label: 'Home',
          href: '/',
          icon: Home
      });
  }

  let currentPathAccumulator = '';
  segments.forEach((segment, index) => {
    currentPathAccumulator += '/' + segment;
    const label = labelMap[segment] || segment.charAt(0).toUpperCase() + segment.slice(1);
    const icon = iconMap[segment.toLowerCase()];
    
    breadcrumbs.push({
      label,
      href: currentPathAccumulator,
      icon
    });
  });
  
  return breadcrumbs;
};

export function Breadcrumb({ items, currentPath, className, rightContent }: BreadcrumbProps) {
  const breadcrumbItems = items || (currentPath ? generateBreadcrumbsFromPath(currentPath) : []);
  
  const finalBreadcrumbItems = breadcrumbItems.filter((item, index, self) =>
    index === self.findIndex((t) => (t.label === item.label && t.href === item.href))
  );

  if (finalBreadcrumbItems.length === 0 && !rightContent) return null;

  return (
    <nav className={cn("flex items-start justify-between text-sm text-muted-foreground py-6", className)}> {/* CHANGED: items-start */}
      <div className="flex items-center space-x-1"> {/* This div groups the breadcrumb items horizontally */}
        {finalBreadcrumbItems.map((item, index) => {
          const isLast = index === finalBreadcrumbItems.length - 1;
          const IconComponent = item.icon;
          
          return (
            <div key={item.href || index} className="flex items-center">
              {index > 0 && (
                <ChevronRight className="h-4 w-4 mx-1 text-muted-foreground/60" />
              )}
              
              {isLast ? (
                // Last item - not clickable, shows current page
                <div className="flex items-center gap-1.5 text-foreground font-medium">
                  {IconComponent && <IconComponent className="h-4 w-4" />}
                  <span>{item.label}</span>
                </div>
              ) : (
                // Clickable breadcrumb item
                <Link
                  to={item.href || '/'}
                  className="flex items-center gap-1.5 hover:text-foreground transition-colors"
                >
                  {IconComponent && <IconComponent className="h-4 w-4" />}
                  <span>{item.label}</span>
                </Link>
              )}
            </div>
          );
        })}
      </div>

      {rightContent && (
        <div className="flex items-start"> {/* CHANGED: items-start to align rightContent top */}
          {rightContent}
        </div>
      )}
    </nav>
  );
}

// Usage examples and helper hook
export function useBreadcrumb(path: string) {
  return generateBreadcrumbsFromPath(path);
}

// Pre-built breadcrumb configurations for common routes
export const commonBreadcrumbs = {
  explorePlans: [
    { label: "Explore", href: "/explore", icon: Search },
    { label: "Plans", href: "/explore/plans", icon: Calendar }
  ],
  exploreTeams: [
    { label: "Explore", href: "/explore", icon: Search },
    { label: "Teams", href: "/explore/teams", icon: Users }
  ],
  explorePeople: [
    { label: "Explore", href: "/explore", icon: Search },
    { label: "People", href: "/explore/users", icon: User }
  ],
  profileMeasurements: [
    { label: "Profile", href: "/profile", icon: User },
    { label: "Measurements", href: "/profile/measurements", icon: History }
  ],
  profilePerformance: [
    { label: "Profile", href: "/profile", icon: User },
    { label: "Performance", href: "/profile/performance", icon: Inbox }
  ],
};