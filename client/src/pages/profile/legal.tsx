import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import Footer from "@/components/footer";
import { type User } from "@shared/schema";
import { 
  ArrowLeft, 
  FileText, 
  User as UserIcon, 
  Shield, 
  Scale,
  ExternalLink,
  ChevronRight
} from "lucide-react";

export default function ProfileLegal() {
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
            <p className="text-muted-foreground mb-6">Please sign in to view legal information</p>
            <Button asChild>
              <a href="/api/login">Sign In</a>
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const legalItems = [
    {
      id: "terms",
      title: "Terms of Service",
      description: "Our terms and conditions for using ParkEasy",
      icon: Scale,
      href: "/terms"
    },
    {
      id: "privacy",
      title: "Privacy Policy",
      description: "How we collect, use, and protect your data",
      icon: Shield,
      href: "/privacy"
    },
    {
      id: "community-guidelines",
      title: "Community Guidelines",
      description: "Rules and expectations for all users",
      icon: FileText,
      href: "/community-guidelines"
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <main className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link href="/profile" className="inline-flex items-center text-muted-foreground hover:text-foreground mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Profile
          </Link>
          <h1 className="text-3xl font-bold text-foreground">Legal</h1>
          <p className="text-muted-foreground">Terms, privacy, and legal information</p>
        </div>

        {/* Legal Documents */}
        <div className="space-y-2 mb-8">
          {legalItems.map((item) => (
            <Card key={item.id} className="hover:bg-muted/50 transition-colors">
              <CardContent className="p-0">
                {item.href === "#" ? (
                  <div className="flex items-center justify-between p-4 opacity-50">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <item.icon className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-medium text-foreground">{item.title}</h3>
                        <p className="text-sm text-muted-foreground">{item.description}</p>
                      </div>
                    </div>
                    <span className="text-xs text-muted-foreground">Coming Soon</span>
                  </div>
                ) : (
                  <Link href={item.href} className="block">
                    <div className="flex items-center justify-between p-4" data-testid={`link-${item.id}`}>
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <item.icon className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-medium text-foreground">{item.title}</h3>
                          <p className="text-sm text-muted-foreground">{item.description}</p>
                        </div>
                      </div>
                      <ChevronRight className="w-5 h-5 text-muted-foreground" />
                    </div>
                  </Link>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* App Info */}
        <Card>
          <CardContent className="p-6 text-center">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <FileText className="w-8 h-8 text-primary" />
            </div>
            <h3 className="font-semibold text-foreground mb-2">ParkEasy v1.0.0</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Your urban parking marketplace
            </p>
            <div className="text-xs text-muted-foreground space-y-1">
              <p>© 2024 ParkEasy. All rights reserved.</p>
              <p>Last updated: December 2024</p>
            </div>
          </CardContent>
        </Card>
      </main>

      <Footer />
    </div>
  );
}