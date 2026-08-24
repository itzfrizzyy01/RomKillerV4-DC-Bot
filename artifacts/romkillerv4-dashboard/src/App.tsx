import { type ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ErrorBoundary } from '@/components/error-boundary';
import { Shell } from '@/components/control-center';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import NotFound from '@/pages/not-found';
import {
  AIPage, AnalyticsPage, EconomyPage, GiveawaysPage, MinecraftPage, ModerationPage,
  OverviewPage, SecurityPage, SettingsPage, TicketsPage,
} from '@/pages/control-pages';
import {
  Route,
  Switch,
  useLocation,
  Router as WouterRouter,
} from 'wouter';

const queryClient = new QueryClient();

function Router() {
  return (
    // Keep a shared shell (sidebar, navbar) outside the boundary so it
    // survives a page crash.
    <RoutedErrorBoundary>
      <Shell>
        <Switch>
          <Route path="/" component={OverviewPage} />
          <Route path="/moderation" component={ModerationPage} />
          <Route path="/tickets" component={TicketsPage} />
          <Route path="/minecraft" component={MinecraftPage} />
          <Route path="/economy" component={EconomyPage} />
          <Route path="/giveaways" component={GiveawaysPage} />
          <Route path="/analytics" component={AnalyticsPage} />
          <Route path="/ai" component={AIPage} />
          <Route path="/security" component={SecurityPage} />
          <Route path="/settings" component={SettingsPage} />
          <Route component={NotFound} />
        </Switch>
      </Shell>
    </RoutedErrorBoundary>
  );
}

function RoutedErrorBoundary({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  return <ErrorBoundary resetKey={location}>{children}</ErrorBoundary>;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
