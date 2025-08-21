import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { LanguageProvider } from "@/contexts/LanguageContext";
import Home from "@/pages/home";
import Dashboard from "./pages/dashboard";
import Privacy from "@/pages/privacy";
import Terms from "@/pages/terms";
import Disclaimer from "@/pages/disclaimer";
import AdminLogin from "@/pages/admin/login";
import AdminDashboard from "@/pages/admin/dashboard";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/:lang" component={Home} />
      <Route path="/dashboard/:accountId" component={Dashboard} />
      <Route path="/:lang/dashboard/:accountId" component={Dashboard} />
      <Route path="/privacy" component={Privacy} />
      <Route path="/:lang/privacy" component={Privacy} />
      <Route path="/terms" component={Terms} />
      <Route path="/:lang/terms" component={Terms} />
      <Route path="/disclaimer" component={Disclaimer} />
      <Route path="/:lang/disclaimer" component={Disclaimer} />
      <Route path="/nordmail-admin" component={AdminLogin} />
      <Route path="/nordmail-admin/login" component={AdminLogin} />
      <Route path="/nordmail-admin/dashboard" component={AdminDashboard} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <LanguageProvider>
        <TooltipProvider>
          <div className="min-h-screen bg-black text-white">
            <Toaster />
            <Router />
          </div>
        </TooltipProvider>
      </LanguageProvider>
    </QueryClientProvider>
  );
}

export default App;
