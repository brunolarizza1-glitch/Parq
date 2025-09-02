import { useState, useEffect } from "react";
import { Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import Footer from "@/components/footer";
import { type User } from "@shared/schema";
import { ArrowLeft, Bell, User as UserIcon, Calendar, AlertTriangle, Gift, Save } from "lucide-react";

export default function ProfileNotifications() {
  const { user: authUser, isAuthenticated, isLoading: authLoading } = useAuth();
  const user = authUser as User | undefined;
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [notifications, setNotifications] = useState({
    bookingUpdates: true,  // Default: ON (critical)
    hostAlerts: true,      // Default: ON (critical) 
    promotions: false      // Default: OFF (non-critical)
  });

  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    if (user) {
      setNotifications({
        bookingUpdates: user.notificationBookingUpdates ?? true,
        hostAlerts: user.notificationHostAlerts ?? true,
        promotions: user.notificationPromotions ?? false
      });
    }
  }, [user]);

  const updateNotificationsMutation = useMutation({
    mutationFn: (data: typeof notifications) => 
      apiRequest(`/api/users/${user?.id}/notifications`, {
        method: "PATCH",
        body: JSON.stringify({
          notificationBookingUpdates: data.bookingUpdates,
          notificationHostAlerts: data.hostAlerts,
          notificationPromotions: data.promotions
        })
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/auth/user'] });
      toast({
        title: "Preferences Saved",
        description: "Your notification preferences have been updated.",
      });
      setHasChanges(false);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update notification preferences. Please try again.",
        variant: "destructive"
      });
    }
  });

  const handleToggle = (setting: keyof typeof notifications) => {
    setNotifications(prev => ({
      ...prev,
      [setting]: !prev[setting]
    }));
    setHasChanges(true);
  };

  const handleSave = () => {
    updateNotificationsMutation.mutate(notifications);
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
            <p className="text-muted-foreground mb-6">Please sign in to manage notifications</p>
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
          <h1 className="text-3xl font-bold text-foreground">Notifications</h1>
          <p className="text-muted-foreground">Control how and when you receive notifications</p>
        </div>

        <div className="space-y-6">
          {/* Booking Updates - Critical */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-blue-600" />
                  Booking Updates
                </div>
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-orange-600" />
                  <span className="text-sm text-orange-600 font-medium">Critical</span>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Booking confirmations & updates</p>
                  <p className="text-sm text-muted-foreground">
                    Get notified about booking confirmations, cancellations, and changes
                  </p>
                </div>
                <Switch 
                  checked={notifications.bookingUpdates}
                  onCheckedChange={() => handleToggle('bookingUpdates')}
                  data-testid="switch-booking-updates"
                />
              </div>
            </CardContent>
          </Card>

          {/* Host Alerts - Critical */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Bell className="w-5 h-5 text-green-600" />
                  Host Alerts
                </div>
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-orange-600" />
                  <span className="text-sm text-orange-600 font-medium">Critical</span>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Host communications & alerts</p>
                  <p className="text-sm text-muted-foreground">
                    Important messages from parking space hosts and safety alerts
                  </p>
                </div>
                <Switch 
                  checked={notifications.hostAlerts}
                  onCheckedChange={() => handleToggle('hostAlerts')}
                  data-testid="switch-host-alerts"
                />
              </div>
            </CardContent>
          </Card>

          {/* Promotions - Optional */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Gift className="w-5 h-5 text-purple-600" />
                  Promotions
                </div>
                <span className="text-sm text-muted-foreground">Optional</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Promotions & offers</p>
                  <p className="text-sm text-muted-foreground">
                    Special deals, discounts, and promotional announcements
                  </p>
                </div>
                <Switch 
                  checked={notifications.promotions}
                  onCheckedChange={() => handleToggle('promotions')}
                  data-testid="switch-promotions"
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Save Button */}
        <div className="mt-8">
          <Button 
            onClick={handleSave}
            disabled={!hasChanges || updateNotificationsMutation.isPending}
            className="w-full" 
            data-testid="button-save-notifications"
          >
            {updateNotificationsMutation.isPending ? (
              <>
                <div className="animate-spin w-4 h-4 border-2 border-current border-t-transparent rounded-full mr-2" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Save Notification Preferences
              </>
            )}
          </Button>
        </div>

        {/* Info */}
        <Card className="mt-6">
          <CardContent className="p-6">
            <div className="text-center space-y-2">
              <Bell className="w-8 h-8 text-muted-foreground mx-auto" />
              <h3 className="font-medium">Notification Delivery</h3>
              <p className="text-sm text-muted-foreground">
                Critical notifications (Booking updates & Host alerts) are recommended to stay enabled
                for the best parking experience and safety.
              </p>
            </div>
          </CardContent>
        </Card>
      </main>

      <Footer />
    </div>
  );
}