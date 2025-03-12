import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import Dashboard from "@/pages/dashboard";
import Campaigns from "@/pages/campaigns";
import KeywordOptimization from "@/pages/keyword-optimization";
import AudienceTargeting from "@/pages/audience-targeting";
import Analytics from "@/pages/analytics";
import Settings from "@/pages/settings";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Dashboard}/>
      <Route path="/campaigns" component={Campaigns}/>
      <Route path="/keyword-optimization" component={KeywordOptimization}/>
      <Route path="/audience-targeting" component={AudienceTargeting}/>
      <Route path="/analytics" component={Analytics}/>
      <Route path="/settings" component={Settings}/>
      {/* Fallback to 404 */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router />
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;
