import { Bell, PlusCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Sidebar } from "./sidebar";
import { CampaignForm } from "@/components/campaign/campaign-form";

interface HeaderProps {
  title: string;
}

export function Header({ title }: HeaderProps) {
  return (
    <header className="bg-white shadow-sm z-10">
      <div className="px-4 py-3 flex items-center justify-between">
        <div className="flex items-center">
          <Sidebar />
          <h2 className="text-lg font-semibold text-slate-800 ml-2">{title}</h2>
        </div>
        
        <div className="flex items-center space-x-3">
          <div className="relative">
            <Button variant="ghost" size="icon" aria-label="Notifications">
              <Bell className="h-5 w-5" />
              <span className="absolute top-0 right-0 w-2 h-2 rounded-full bg-amber-500"></span>
            </Button>
          </div>
          
          <Dialog>
            <DialogTrigger asChild>
              <Button size="sm">
                <PlusCircle className="h-4 w-4 mr-1.5" />
                <span>New Campaign</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
              <CampaignForm />
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </header>
  );
}
