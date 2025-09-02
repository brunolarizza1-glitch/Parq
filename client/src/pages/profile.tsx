import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import Footer from "@/components/footer";
import { type User } from "@shared/schema";
import { 
  User as UserIcon,
  Car,
  CreditCard,
  Bell,
  Shield,
  FileText,
  ChevronRight,
  LogOut,
  Settings
} from "lucide-react";

export default function Profile() {
  const { user: authUser, isAuthenticated, isLoading: authLoading } = useAuth();
  const user = authUser as User | undefined;

  const handleSignOut = () => {
    // In real app, this would clear auth and redirect
    window.location.href = "/api/logout";
  };

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
            <p className="text-muted-foreground mb-6">Please sign in to view your profile</p>
            <Button asChild>
              <a href="/api/login">Sign In</a>
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const menuItems = [
    {
      id: "details",
      title: "My Details",
      description: "Manage your personal information",
      icon: UserIcon,
      href: "/profile/details",
      badge: null
    },
    {
      id: "vehicle",
      title: "Vehicle",
      description: "Manage your vehicle information",
      icon: Car,
      href: "/profile/vehicle",
      badge: null
    },
    {
      id: "payment",
      title: "Payment Methods",
      description: "Add and manage payment cards",
      icon: CreditCard,
      href: "/profile/payment-methods",
      badge: "Coming Soon"
    },
    {
      id: "notifications",
      title: "Notifications",
      description: "Control your notification preferences",
      icon: Bell,
      href: "/profile/notifications",
      badge: null
    },
    {
      id: "help-safety",
      title: "Help & Safety",
      description: "Get help and safety resources",
      icon: Shield,
      href: "/profile/help-safety",
      badge: null
    },
    {
      id: "privacy",
      title: "Privacy",
      description: "Location access and privacy settings",
      icon: Shield,
      href: "/profile/privacy",
      badge: null
    },
    {
      id: "legal",
      title: "Legal",
      description: "Terms, privacy, and legal information",
      icon: FileText,
      href: "/profile/legal",
      badge: null
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <main className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
              {user?.profileImageUrl ? (
                <img 
                  src={user.profileImageUrl} 
                  alt="Profile" 
                  className="w-16 h-16 rounded-full object-cover"
                />
              ) : (
                <UserIcon className="w-8 h-8 text-primary" />
              )}
            </div>
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-foreground">
                {user?.firstName && user?.lastName 
                  ? `${user.firstName} ${user.lastName}`
                  : user?.email || "User"
                }
              </h1>
              <div className="flex items-center gap-2 mt-1">
                <p className="text-muted-foreground">{user?.email}</p>
                {user?.verificationStatus === "verified" && (
                  <Badge variant="default" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                    Verified
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Menu Items */}
        <div className="space-y-2">
          {menuItems.map((item) => (
            <Card key={item.id} className="hover:bg-muted/50 transition-colors">
              <CardContent className="p-0">
                <Link href={item.href} className="block">
                  <div className="flex items-center justify-between p-4" data-testid={`link-${item.id}`}>
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <item.icon className="w-5 h-5 text-primary" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium text-foreground">{item.title}</h3>
                          {item.badge && (
                            <Badge variant="secondary" className="text-xs">
                              {item.badge}
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">{item.description}</p>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-muted-foreground" />
                  </div>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Sign Out */}
        <div className="mt-8">
          <Card>
            <CardContent className="p-0">
              <Button 
                variant="ghost" 
                onClick={handleSignOut}
                className="w-full justify-start p-4 h-auto text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950"
                data-testid="button-sign-out"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-900 flex items-center justify-center flex-shrink-0">
                    <LogOut className="w-5 h-5 text-red-600" />
                  </div>
                  <div className="text-left">
                    <h3 className="font-medium">Sign Out</h3>
                    <p className="text-sm text-muted-foreground">Sign out of your account</p>
                  </div>
                </div>
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
}