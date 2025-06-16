import { Switch, Route } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AppProvider } from "./contexts/AppContext";
import { AccessibilityProvider } from "./contexts/AccessibilityContext";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { offlineService } from "./services/offlineService";
import { useEffect } from "react";
import Account from "@/pages/Account";
import Tickets from "@/pages/Tickets";
import Boarding from "@/pages/Boarding";
import PlanJourney from "@/pages/PlanJourney";
import Validation from "@/pages/Validation";
import Alerts from "@/pages/Alerts";
import Support from "@/pages/Support";
import Settings from "@/pages/Settings";
import Navigation from "@/components/Navigation";
import VoiceCommand from "@/components/VoiceCommand";
import LanguageSelector from "@/components/LanguageSelector";
import LiveRegion from "@/components/LiveRegion";
import StatusIndicator from "@/components/StatusIndicator";
import { Bus } from "lucide-react";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Account} />
      <Route path="/account" component={Account} />
      <Route path="/tickets" component={Tickets} />
      <Route path="/boarding" component={Boarding} />
      <Route path="/plan" component={PlanJourney} />
      <Route path="/validation" component={Validation} />
      <Route path="/alerts" component={Alerts} />
      <Route path="/support" component={Support} />
      <Route path="/settings" component={Settings} />
      <Route component={Account} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AccessibilityProvider>
          <AppProvider>
            <div className="min-h-screen bg-background text-foreground">
              {/* Skip Navigation Link */}
              <a 
                href="#main-content" 
                className="skip-link sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-accent focus:text-accent-foreground focus:rounded"
              >
                Skip to main content
              </a>

              {/* ARIA Live Regions */}
              <LiveRegion />

              {/* Header */}
              <header className="border-b-4 border-border p-4" role="banner">
                <div className="max-w-4xl mx-auto">
                  <div className="flex justify-between items-center">
                    <h1 className="text-2xl font-bold flex items-center">
                      <Bus className="mr-2" aria-hidden="true" />
                      TransitAccess
                    </h1>
                    
                    <VoiceCommand />
                  </div>
                  
                  <div className="mt-4">
                    <LanguageSelector />
                  </div>
                </div>
              </header>

              {/* Navigation */}
              <Navigation />

              {/* Main Content */}
              <main id="main-content" className="p-4" role="main">
                <div className="max-w-4xl mx-auto">
                  <Router />
                </div>
              </main>

              {/* Footer */}
              <footer className="border-t-2 border-border p-4 mt-8" role="contentinfo">
                <div className="max-w-4xl mx-auto text-center">
                  <p className="text-sm">
                    TransitAccess © 2024 | 
                    <a href="#" className="underline hover:no-underline focus-visible ml-2 mr-2">Privacy Policy</a> | 
                    <a href="#" className="underline hover:no-underline focus-visible">Accessibility Statement</a>
                  </p>
                  <p className="text-xs mt-2">
                    Emergency: Call 911 | Transit Info: 1-800-TRANSIT
                  </p>
                </div>
              </footer>

              <Toaster />
            </div>
          </AppProvider>
        </AccessibilityProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
