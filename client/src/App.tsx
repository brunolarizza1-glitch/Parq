import { Switch, Route } from "wouter";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { useAuth } from "@/hooks/useAuth";
import OfflineState from "@/components/offline-state";
import Header from "@/components/header";
import Home from "@/pages/home";
import Landing from "@/pages/landing";
import ListingDetails from "@/pages/listing-details";
import BookingConfirmation from "@/pages/booking-confirmation";
import BookingDetails from "@/pages/booking-details";
import Profile from "@/pages/profile";
import ListSpace from "@/pages/list-space";
import HostDashboard from "@/pages/host-dashboard";
import Payouts from "@/pages/payouts";
import ProfileDetails from "@/pages/profile/details";
import ProfileVehicle from "@/pages/profile/vehicle";
import ProfilePaymentMethods from "@/pages/profile/payment-methods";
import ProfileNotifications from "@/pages/profile/notifications";
import ProfileHelpSafety from "@/pages/profile/help-safety";
import ProfileLegal from "@/pages/profile/legal";
import ProfilePrivacy from "@/pages/profile-privacy";
import CommunityGuidelines from "@/pages/community-guidelines";
import Bookings from "@/pages/bookings";
import Features from "@/pages/features";
import Onboarding from "@/pages/onboarding";
import ProfileSetup from "@/pages/profile-setup";
import VerificationRequired from "@/pages/verification-required";
import Signup from "@/pages/signup";
import HostSignup from "@/pages/host-signup";
import FakeCheckout from "@/pages/fake-checkout";
import Search from "@/pages/search";
import Map from "@/pages/map";
import Login from "@/pages/login";
import Welcome from "@/pages/welcome";
import DesignSystemDemo from "@/pages/design-system-demo";
import AppShell from "@/components/app-shell";
import Careers from "@/pages/careers";
import Press from "@/pages/press";
import Blog from "@/pages/blog";
import Help from "@/pages/help";
import Safety from "@/pages/safety";
import Privacy from "@/pages/privacy";
import Terms from "@/pages/terms";
import NotFound from "@/pages/not-found";
import { Component, ReactNode } from "react";

class ErrorBoundary extends Component<
  { children: ReactNode },
  { hasError: boolean; error?: Error }
> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error("React Error Boundary caught an error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-lg">
            <h2 className="text-xl font-semibold text-red-600 mb-4">
              Something went wrong
            </h2>
            <p className="text-gray-600 mb-4">
              {this.state.error?.message || "An unexpected error occurred"}
            </p>
            <button
              onClick={() => this.setState({ hasError: false })}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              Try again
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

function Router() {
  const { user, isLoading, isAuthenticated } = useAuth();

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 to-orange-50 dark:from-gray-900 dark:to-gray-800">
        <div className="animate-spin w-8 h-8 border-4 border-pink-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <Switch>
        <Route path="/" component={Welcome} />
        <Route path="/home" component={Home} />
        <Route path="/listing/:id" component={ListingDetails} />
        <Route path="/profile" component={Profile} />
        <Route path="/list-space" component={ListSpace} />
        <Route path="/host-dashboard" component={HostDashboard} />
        <Route path="/payouts" component={Payouts} />
        <Route path="/profile/details" component={ProfileDetails} />
        <Route path="/profile/vehicle" component={ProfileVehicle} />
        <Route path="/profile/payment-methods" component={ProfilePaymentMethods} />
        <Route path="/profile/notifications" component={ProfileNotifications} />
        <Route path="/profile/help-safety" component={ProfileHelpSafety} />
        <Route path="/profile/privacy" component={ProfilePrivacy} />
        <Route path="/profile/legal" component={ProfileLegal} />
        <Route path="/community-guidelines" component={CommunityGuidelines} />
        <Route path="/bookings" component={Bookings} />
        <Route path="/features" component={Features} />
        <Route path="/onboarding" component={Onboarding} />
        <Route path="/profile-setup" component={ProfileSetup} />
        <Route path="/verification-required" component={VerificationRequired} />
        <Route path="/signup" component={Signup} />
        <Route path="/host-signup" component={HostSignup} />
        <Route path="/search" component={Search} />
        <Route path="/map" component={Map} />
        <Route path="/design-system" component={DesignSystemDemo} />
        <Route path="/welcome" component={Welcome} />
        <Route path="/checkout" component={FakeCheckout} />
        <Route path="/booking-confirmation" component={BookingConfirmation} />
        <Route path="/booking-details/:id" component={BookingDetails} />
        <Route path="/login" component={Login} />
        <Route path="/auth" component={Login} />
        <Route path="/careers" component={Careers} />
        <Route path="/press" component={Press} />
        <Route path="/blog" component={Blog} />
        <Route path="/help" component={Help} />
        <Route path="/safety" component={Safety} />
        <Route path="/privacy" component={Privacy} />
        <Route path="/terms" component={Terms} />
        <Route component={NotFound} />
      </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ErrorBoundary>
        <TooltipProvider>
          <OfflineState />
          <AppShell>
            <Router />
            <Toaster />
          </AppShell>
        </TooltipProvider>
      </ErrorBoundary>
    </QueryClientProvider>
  );
}

export default App;
