"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Target,
  FileText,
  Users,
  BarChart3,
  Settings,
  ChevronDown,
  Plus,
  CheckCircle2,
  FileEdit,
  List,
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";

type NavItem = {
  title: string;
  href?: string;
  icon: any;
  subItems?: {
    title: string;
    href: string;
    icon: any;
    badge?: string;
  }[];
};

const navItems: NavItem[] = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Campaigns",
    href: "/campaigns",
    icon: Target,
  },
  {
    title: "Ads",
    icon: FileText,
    subItems: [
      {
        title: "All Ads",
        href: "/ads",
        icon: List,
      },
      {
        title: "Active Ads",
        href: "/ads?status=active",
        icon: CheckCircle2,
      },
      {
        title: "Draft Ads",
        href: "/ads?status=draft",
        icon: FileEdit,
      },
      {
        title: "Create Ad",
        href: "/ads/new",
        icon: Plus,
      },
    ],
  },
  {
    title: "Leads",
    href: "/leads",
    icon: Users,
  },
  {
    title: "Analytics",
    href: "/analytics",
    icon: BarChart3,
  },
  {
    title: "Settings",
    href: "/settings",
    icon: Settings,
  },
];

export function DashboardNav() {
  const pathname = usePathname();
  const [expandedItems, setExpandedItems] = useState<string[]>(["Ads"]);
  const [isCollapsed, setIsCollapsed] = useState(false);

  const toggleExpanded = (title: string) => {
    setExpandedItems((prev) =>
      prev.includes(title)
        ? prev.filter((item) => item !== title)
        : [...prev, title]
    );
  };

  const toggleSidebar = () => {
    setIsCollapsed((prev) => !prev);
  };

  const isItemActive = (item: NavItem): boolean => {
    if (item.href && pathname === item.href) return true;
    if (item.subItems) {
      return item.subItems.some((subItem) => pathname.startsWith(subItem.href));
    }
    return false;
  };

  const isSubItemActive = (href: string): boolean => {
    // For query parameter based routes, check exact match
    if (href.includes("?")) {
      return pathname + (typeof window !== 'undefined' ? window.location.search : '') === href;
    }
    // For regular routes, check if pathname starts with href
    return pathname === href || pathname.startsWith(href + "/");
  };

  return (
    <aside className={cn(
      "border-r bg-card transition-all duration-300",
      isCollapsed ? "w-16" : "w-64"
    )}>
      <div className={cn(
        "flex h-16 items-center border-b",
        isCollapsed ? "justify-center px-2" : "justify-between px-4"
      )}>
        {!isCollapsed && (
          <Link href="/dashboard" className="flex items-center space-x-2">
            <Target className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold">AdBuilder</span>
          </Link>
        )}
        <Button
          variant="outline"
          size="icon"
          onClick={toggleSidebar}
          className={cn(
            "shrink-0 transition-all border-border/40 hover:border-primary hover:bg-primary/10",
            isCollapsed ? "h-9 w-9" : "h-8 w-8"
          )}
          title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {isCollapsed ? (
            <PanelLeftOpen className="h-4 w-4" />
          ) : (
            <PanelLeftClose className="h-4 w-4" />
          )}
        </Button>
      </div>
      <nav className="space-y-1 p-4">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = isItemActive(item);
          const isExpanded = expandedItems.includes(item.title);
          const hasSubItems = item.subItems && item.subItems.length > 0;

          return (
            <div key={item.title}>
              {/* Main nav item */}
              {hasSubItems ? (
                <button
                  onClick={() => !isCollapsed && toggleExpanded(item.title)}
                  className={cn(
                    "w-full flex items-center rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                    isCollapsed ? "justify-center" : "justify-between",
                    isActive
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                  title={isCollapsed ? item.title : undefined}
                >
                  <div className={cn("flex items-center", isCollapsed ? "" : "space-x-3")}>
                    <Icon className="h-5 w-5" />
                    {!isCollapsed && <span>{item.title}</span>}
                  </div>
                  {!isCollapsed && (
                    <ChevronDown
                      className={cn(
                        "h-4 w-4 transition-transform",
                        isExpanded && "rotate-180"
                      )}
                    />
                  )}
                </button>
              ) : (
                <Link
                  href={item.href!}
                  className={cn(
                    "flex items-center rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                    isCollapsed ? "justify-center" : "space-x-3",
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                  title={isCollapsed ? item.title : undefined}
                >
                  <Icon className="h-5 w-5" />
                  {!isCollapsed && <span>{item.title}</span>}
                </Link>
              )}

              {/* Sub-menu items */}
              {hasSubItems && isExpanded && !isCollapsed && (
                <div className="mt-1 ml-4 space-y-1 border-l-2 border-muted pl-4">
                  {item.subItems!.map((subItem) => {
                    const SubIcon = subItem.icon;
                    const isSubActive = isSubItemActive(subItem.href);

                    return (
                      <Link
                        key={subItem.href}
                        href={subItem.href}
                        className={cn(
                          "flex items-center justify-between rounded-lg px-3 py-2 text-sm transition-colors",
                          isSubActive
                            ? "bg-primary text-primary-foreground font-medium"
                            : "text-muted-foreground hover:bg-muted hover:text-foreground"
                        )}
                      >
                        <div className="flex items-center space-x-2">
                          <SubIcon className="h-4 w-4" />
                          <span>{subItem.title}</span>
                        </div>
                        {subItem.badge && (
                          <span className="text-xs bg-primary/20 text-primary px-2 py-0.5 rounded-full">
                            {subItem.badge}
                          </span>
                        )}
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </nav>
    </aside>
  );
}
