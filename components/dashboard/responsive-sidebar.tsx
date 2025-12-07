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
  Menu,
  ChevronsRight,
  HelpCircle,
} from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

const navItems = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Campaigns",
    href: "/campaigns",
    icon: Target,
    notifs: 3,
  },
  {
    title: "Ads",
    href: "/ads",
    icon: FileText,
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
];

const accountItems = [
  {
    title: "Settings",
    href: "/settings",
    icon: Settings,
  },
  {
    title: "Help",
    href: "/help",
    icon: HelpCircle,
  },
];

export function ResponsiveSidebar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  const NavContent = ({ showLabels = true }: { showLabels?: boolean }) => (
    <>
      <div className={cn(
        "flex h-16 items-center border-b",
        showLabels ? "px-6" : "px-3 justify-center"
      )}>
        <Link href="/dashboard" className="flex items-center space-x-2">
          <div className="grid size-10 shrink-0 place-content-center rounded-lg bg-gradient-to-br from-primary to-primary/80 shadow-sm">
            <Target className="h-5 w-5 text-primary-foreground" />
          </div>
          {showLabels && (
            <div>
              <span className="block text-sm font-bold">AdBuilder</span>
              <span className="block text-xs text-muted-foreground">SME Platform</span>
            </div>
          )}
        </Link>
      </div>
      <nav className="space-y-1 p-2 flex-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/');

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className={cn(
                "relative flex h-11 items-center rounded-md transition-all duration-200",
                showLabels ? "px-3" : "justify-center",
                isActive
                  ? "bg-primary/10 text-primary shadow-sm border-l-2 border-primary"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <div className={cn(
                "grid place-content-center",
                showLabels ? "h-full w-8" : "h-full w-full"
              )}>
                <Icon className="h-5 w-5" />
              </div>
              {showLabels && (
                <span className="text-sm font-medium ml-2">{item.title}</span>
              )}
              {item.notifs && showLabels && (
                <span className="absolute right-3 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground font-medium">
                  {item.notifs}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Account Section */}
      {showLabels && (
        <div className="border-t p-2 space-y-1">
          <div className="px-3 py-2 text-xs font-medium text-muted-foreground uppercase tracking-wide">
            Account
          </div>
          {accountItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  "flex h-11 items-center rounded-md px-3 transition-all duration-200",
                  isActive
                    ? "bg-primary/10 text-primary shadow-sm border-l-2 border-primary"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <div className="grid h-full w-8 place-content-center">
                  <Icon className="h-5 w-5" />
                </div>
                <span className="text-sm font-medium ml-2">{item.title}</span>
              </Link>
            );
          })}
        </div>
      )}
    </>
  );

  return (
    <>
      {/* Desktop Sidebar - Hidden on mobile */}
      <aside className={cn(
        "hidden lg:flex flex-col border-r bg-card transition-all duration-300 ease-in-out relative",
        collapsed ? "w-16" : "w-64"
      )}>
        <NavContent showLabels={!collapsed} />

        {/* Toggle Button */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="absolute bottom-0 left-0 right-0 border-t transition-colors hover:bg-muted"
        >
          <div className="flex items-center p-3">
            <div className={cn(
              "grid place-content-center",
              collapsed ? "w-full" : "size-10"
            )}>
              <ChevronsRight
                className={cn(
                  "h-4 w-4 transition-transform duration-300 text-muted-foreground",
                  !collapsed && "rotate-180"
                )}
              />
            </div>
            {!collapsed && (
              <span className="text-sm font-medium text-muted-foreground">
                Hide
              </span>
            )}
          </div>
        </button>
      </aside>

      {/* Mobile Drawer - Hidden on desktop */}
      <div className="lg:hidden">
        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="fixed left-4 top-3 z-40"
            >
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-64 p-0 flex flex-col">
            <NavContent showLabels={true} />
          </SheetContent>
        </Sheet>
      </div>
    </>
  );
}

