import { XCircle } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";

export function WelcomeCard() {
  const [dismissed, setDismissed] = useState(false);
  
  if (dismissed) return null;
  
  return (
    <div className="relative mb-6 bg-white rounded-xl overflow-hidden shadow-sm border border-slate-200">
      <div className="md:flex">
        <div className="px-6 py-6 md:flex-1">
          <h2 className="text-xl font-bold text-slate-800 mb-2">Welcome to Thirty Twenty!</h2>
          <p className="text-slate-600 mb-4">
            Your AI-driven advertising platform to boost your business visibility online. 
            Let's get started with setting up your first campaign.
          </p>
          <div className="flex flex-wrap gap-2">
            <Button>
              Quick Setup Guide
            </Button>
            <Button variant="outline">
              Watch Tutorial
            </Button>
          </div>
        </div>
        <div className="hidden md:block md:w-1/3 bg-primary-50 p-6 relative">
          <div className="h-full w-full rounded-lg bg-gradient-to-r from-primary-100 to-primary-50 flex items-center justify-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="120"
              height="120"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-primary"
            >
              <path d="M8.4 10.6a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5z" />
              <path d="M11.5 6.6a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5z" />
              <path d="M15.5 10.6a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5z" />
              <path d="M11.5 15.6a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5z" />
              <path d="m10 15-1.5-3" />
              <path d="m13.5 7.5-2 3" />
              <path d="m10 9-1.5-1.5" />
              <path d="m13.5 9.5-.5 3" />
              <path d="M21 21h-8v-5h8z" />
              <path d="M11 21v-5l-9-4v-3.9a2 2 0 0 1 2.1-2h3.7" />
            </svg>
          </div>
        </div>
      </div>
      <button 
        className="absolute top-3 right-3 p-1.5 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 focus:outline-none"
        aria-label="Dismiss"
        onClick={() => setDismissed(true)}
      >
        <XCircle className="h-5 w-5" />
      </button>
    </div>
  );
}
