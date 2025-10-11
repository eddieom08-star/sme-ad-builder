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
} from "lucide-react";

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

export function MobileBottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t bg-card lg:hidden">
      <div className="grid h-16 grid-cols-5">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center space-y-1 transition-colors",
                isActive
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Icon className="h-5 w-5" />
              <span className="text-xs font-medium">{item.title}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

export function MobileHeader() {
  const pathname = usePathname();

  const currentPage = navItems.find((item) => pathname === item.href);
  const pageTitle = currentPage?.title || "AdBuilder";

  return (
    <header className="sticky top-0 z-40 border-b bg-card lg:hidden">
      <div className="flex h-14 items-center justify-between px-4">
        <div className="flex items-center space-x-2">
          <Target className="h-5 w-5 text-primary" />
          <h1 className="text-lg font-semibold">{pageTitle}</h1>
        </div>
        <Link href="/settings">
          <Settings className="h-5 w-5 text-muted-foreground" />
        </Link>
      </div>
    </header>
  );
}
