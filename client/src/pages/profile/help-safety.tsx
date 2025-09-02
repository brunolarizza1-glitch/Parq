import { Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import Footer from "@/components/footer";
import { type User } from "@shared/schema";
import { 
  ArrowLeft, 
  Shield, 
  User as UserIcon, 
  Mail, 
  MapPin,
  Plus,
  X,
  ChevronRight,
  Lightbulb,
  AlertTriangle,
  Eye
} from "lucide-react";

export default function ProfileHelpSafety() {
  const { user: authUser, isAuthenticated, isLoading: authLoading } = useAuth();
  const user = authUser as User | undefined;

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background">
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-16">
            <UserIcon className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">Authentication Required</h2>
            <p className="text-muted-foreground mb-6">Please sign in to access help and safety</p>
            <Button asChild>
              <a href="/api/login">Sign In</a>
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <main className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link href="/profile" className="inline-flex items-center text-muted-foreground hover:text-foreground mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Profile
          </Link>
          <h1 className="text-3xl font-bold text-foreground">Help & Safety</h1>
          <p className="text-muted-foreground">Get help and safety resources</p>
        </div>

        {/* Contact Support */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Mail className="w-6 h-6 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-foreground">Need Help?</h3>
                <p className="text-sm text-muted-foreground">
                  Our support team is here to help with any questions or issues
                </p>
              </div>
              <Button asChild data-testid="button-contact-support">
                <a href="mailto:support@parkeasy.com">
                  Contact Support
                </a>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Help Center Topics */}
        <div className="space-y-6 mb-8">
          {/* Finding a Spot */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-blue-600" />
                Finding a Spot
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div>
                  <h4 className="font-medium text-foreground">How to search for parking</h4>
                  <p className="text-sm text-muted-foreground">
                    Use the search bar to enter your destination, then filter by price, amenities, and space type
                  </p>
                </div>
                <div>
                  <h4 className="font-medium text-foreground">Booking a space</h4>
                  <p className="text-sm text-muted-foreground">
                    Select your dates and times, complete your vehicle information, then confirm your booking
                  </p>
                </div>
                <div>
                  <h4 className="font-medium text-foreground">Payment and confirmation</h4>
                  <p className="text-sm text-muted-foreground">
                    You'll receive instant confirmation with parking instructions and host contact info
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Listing a Spot */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="w-5 h-5 text-green-600" />
                Listing a Spot
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div>
                  <h4 className="font-medium text-foreground">Getting started as a host</h4>
                  <p className="text-sm text-muted-foreground">
                    Complete the 5-step listing process: photos, description, amenities, pricing, and availability
                  </p>
                </div>
                <div>
                  <h4 className="font-medium text-foreground">Setting your price</h4>
                  <p className="text-sm text-muted-foreground">
                    Research similar spots in your area and consider location, safety, and convenience
                  </p>
                </div>
                <div>
                  <h4 className="font-medium text-foreground">Managing bookings</h4>
                  <p className="text-sm text-muted-foreground">
                    Use auto-accept for convenience or manual review for more control over who parks
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Cancellations */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <X className="w-5 h-5 text-red-600" />
                Cancellations
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div>
                  <h4 className="font-medium text-foreground">Cancellation policy</h4>
                  <p className="text-sm text-muted-foreground">
                    Free cancellation up to 1 hour before your booking start time
                  </p>
                </div>
                <div>
                  <h4 className="font-medium text-foreground">How to cancel</h4>
                  <p className="text-sm text-muted-foreground">
                    Go to "My Bookings" and tap "Cancel" on the booking you want to cancel
                  </p>
                </div>
                <div>
                  <h4 className="font-medium text-foreground">Refunds</h4>
                  <p className="text-sm text-muted-foreground">
                    Eligible cancellations receive full refunds within 3-5 business days
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Safety Tips */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-green-600" />
              Safety Tips
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <Eye className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium">Meet in lit areas</p>
                  <p className="text-sm text-muted-foreground">
                    When meeting hosts or accessing parking, choose well-lit, visible locations
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium">Respect signage</p>
                  <p className="text-sm text-muted-foreground">
                    Always follow posted parking signs and respect private property rules
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <Shield className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium">Verify parking details</p>
                  <p className="text-sm text-muted-foreground">
                    Confirm the parking space matches the listing photos and description
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <Lightbulb className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium">Trust your instincts</p>
                  <p className="text-sm text-muted-foreground">
                    If something doesn't feel right, contact support immediately
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium">Share your location</p>
                  <p className="text-sm text-muted-foreground">
                    Let someone know where you're parking, especially for longer stays
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>

      <Footer />
    </div>
  );
}