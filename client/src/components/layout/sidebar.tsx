import { useState } from "react";
import { Link, useLocation } from "wouter";
import { 
  LayoutDashboard, 
  Calendar, 
  Target, 
  Users, 
  BarChart2, 
  Settings,
  Menu,
  X
} from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface SidebarProps {
  user?: {
    name: string;
    businessName: string;
    avatarUrl?: string;
  };
}

export function Sidebar({ user = { name: "Sarah Johnson", businessName: "Coastal Creations" } }: SidebarProps) {
  const [location] = useLocation();
  const [open, setOpen] = useState(false);

  const routes = [
    {
      href: "/",
      label: "Dashboard",
      icon: LayoutDashboard,
    },
    {
      href: "/campaigns",
      label: "Campaigns",
      icon: Calendar,
    },
    {
      href: "/keyword-optimization",
      label: "Keyword Optimization",
      icon: Target,
    },
    {
      href: "/audience-targeting",
      label: "Audience Targeting",
      icon: Users,
    },
    {
      href: "/analytics",
      label: "Analytics",
      icon: BarChart2,
    },
    {
      href: "/settings",
      label: "Settings",
      icon: Settings,
    },
  ];

  const SidebarContent = () => (
    <div className="flex h-full flex-col">
      <div className="p-4 border-b border-slate-200">
        <div className="flex items-center">
          <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary text-white">
            <BarChart2 className="h-6 w-6" />
          </div>
          <h1 className="ml-3 text-xl font-bold text-slate-800">Thirty Twenty</h1>
        </div>
      </div>
      <ScrollArea className="flex-1 px-2 py-4">
        <nav className="space-y-1">
          {routes.map((route) => (
            <Link 
              key={route.href} 
              href={route.href}
              onClick={() => setOpen(false)}
              className={cn(
                "flex items-center px-4 py-3 text-sm font-medium rounded-lg group",
                location === route.href 
                  ? "bg-primary-50 text-primary-700" 
                  : "text-slate-600 hover:bg-slate-50"
              )}
            >
              <route.icon className="mr-3 h-5 w-5" />
              <span>{route.label}</span>
            </Link>
          ))}
        </nav>
      </ScrollArea>
      {user && (
        <div className="p-4 border-t border-slate-200">
          <div className="flex items-center">
            <Avatar>
              <AvatarImage src={user.avatarUrl} />
              <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="ml-3">
              <p className="text-sm font-medium text-slate-800">{user.name}</p>
              <p className="text-xs text-slate-500">{user.businessName}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <>
      {/* Mobile sidebar */}
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild className="lg:hidden">
          <button className="p-2 rounded-md text-slate-600 hover:bg-slate-100">
            <Menu className="h-6 w-6" />
            <span className="sr-only">Open menu</span>
          </button>
        </SheetTrigger>
        <SheetContent side="left" className="p-0 w-64">
          <SidebarContent />
        </SheetContent>
      </Sheet>

      {/* Desktop sidebar */}
      <aside className="hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:inset-y-0 lg:border-r lg:border-slate-200 lg:bg-white">
        <SidebarContent />
      </aside>
    </>
  );
}
