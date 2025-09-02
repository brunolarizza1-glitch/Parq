import { Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import Footer from "@/components/footer";
import { type User } from "@shared/schema";
import { ArrowLeft, CreditCard, Plus, User as UserIcon, Info } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function ProfilePaymentMethods() {
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
            <p className="text-muted-foreground mb-6">Please sign in to manage payment methods</p>
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
          <h1 className="text-3xl font-bold text-foreground">Payment Methods</h1>
          <p className="text-muted-foreground">Add and manage your payment cards</p>
        </div>

        {/* MVP Status Alert */}
        <Alert className="mb-8 border-blue-200 bg-blue-50 dark:bg-blue-950 dark:border-blue-800">
          <Info className="h-4 w-4" />
          <AlertDescription>
            <strong>Coming Soon:</strong> Payment method management is in development. 
            Currently, all transactions are handled through our demo system.
          </AlertDescription>
        </Alert>

        {/* No Payment Methods State */}
        <Card>
          <CardContent className="text-center py-12">
            <CreditCard className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">No payment methods</h3>
            <p className="text-muted-foreground mb-6">
              Add a credit or debit card to book parking spaces
            </p>
            <Button disabled data-testid="button-add-payment">
              <Plus className="w-4 h-4 mr-2" />
              Add Payment Method
              <Badge variant="secondary" className="ml-2">Coming Soon</Badge>
            </Button>
          </CardContent>
        </Card>

        {/* Security Info */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Security & Privacy</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 rounded-full bg-green-500 mt-2 flex-shrink-0"></div>
              <div>
                <p className="font-medium">Bank-level encryption</p>
                <p className="text-sm text-muted-foreground">All payment data is encrypted and secure</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 rounded-full bg-green-500 mt-2 flex-shrink-0"></div>
              <div>
                <p className="font-medium">PCI compliant</p>
                <p className="text-sm text-muted-foreground">We never store your full card details</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 rounded-full bg-green-500 mt-2 flex-shrink-0"></div>
              <div>
                <p className="font-medium">Fraud protection</p>
                <p className="text-sm text-muted-foreground">Monitor and protect against unauthorized use</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>

      <Footer />
    </div>
  );
}