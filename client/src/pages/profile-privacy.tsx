import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { MapPin, ArrowLeft, Shield, ExternalLink, Info } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";

export default function ProfilePrivacy() {
  const { toast } = useToast();
  const [locationAccess, setLocationAccess] = useState(() => {
    try {
      return localStorage.getItem('parq-privacy-consent') === 'true';
    } catch (error) {
      console.warn('Failed to access localStorage:', error);
      return false;
    }
  });

  const handleLocationToggle = (enabled: boolean) => {
    try {
      if (enabled) {
        localStorage.setItem('parq-privacy-consent', 'true');
        setLocationAccess(true);
        toast({
          title: "Location access enabled",
          description: "Parq can now access your location to find nearby parking.",
        });
      } else {
        localStorage.removeItem('parq-privacy-consent');
        setLocationAccess(false);
        toast({
          title: "Location access disabled", 
          description: "You can still search by entering addresses manually.",
        });
      }
    } catch (error) {
      console.warn('Failed to update localStorage:', error);
      toast({
        title: "Settings update failed",
        description: "Unable to save your preference. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleReEnableLocationHelp = () => {
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    const isAndroid = /Android/.test(navigator.userAgent);
    
    let instructions = "";
    if (isIOS) {
      instructions = "Go to Settings → Privacy & Security → Location Services → Safari → Allow";
    } else if (isAndroid) {
      instructions = "Go to Settings → Apps → Browser → Permissions → Location → Allow";
    } else {
      instructions = "Click the location icon in your browser's address bar and select 'Allow'";
    }

    toast({
      title: "How to re-enable location",
      description: instructions,
      duration: 6000,
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <main className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <Button variant="ghost" asChild className="mb-4 -ml-2" data-testid="back-to-profile">
            <Link href="/profile">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Profile
            </Link>
          </Button>
          <h1 className="text-3xl font-bold text-foreground mb-2">Privacy Settings</h1>
          <p className="text-muted-foreground">Manage your location access and privacy preferences</p>
        </div>

        {/* Privacy & Location Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-primary" />
              Location Access
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Location Access Setting */}
            <div className="flex items-start justify-between">
              <div className="space-y-2 flex-1">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-muted-foreground" />
                  <Label htmlFor="location-access" className="text-base font-medium">
                    Allow location access
                  </Label>
                </div>
                <p className="text-sm text-muted-foreground pl-6">
                  Location is used to show nearby parking and is not shared without a booking.
                  This helps find the best spots close to you.
                </p>
                
                {!locationAccess && (
                  <div className="pl-6 pt-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={handleReEnableLocationHelp}
                      className="text-xs"
                      data-testid="re-enable-location-help"
                    >
                      <Info className="w-3 h-3 mr-1" />
                      How to re-enable in browser
                    </Button>
                  </div>
                )}
              </div>
              <Switch 
                id="location-access"
                checked={locationAccess}
                onCheckedChange={handleLocationToggle}
                data-testid="location-access-toggle"
              />
            </div>

            <Separator />

            {/* Privacy Policy Link */}
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-base font-medium">Privacy Policy</h4>
                <p className="text-sm text-muted-foreground">
                  Learn how we collect, use, and protect your data
                </p>
              </div>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => {
                  toast({
                    title: "Privacy Policy",
                    description: "Privacy policy would open in a new tab.",
                  });
                }}
                data-testid="privacy-policy-link"
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                View Policy
              </Button>
            </div>

            {/* Data Usage Information */}
            <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <Info className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                <div className="text-sm">
                  <p className="text-foreground font-medium mb-1">Your data is secure</p>
                  <p className="text-muted-foreground">
                    We only use your location to show nearby parking spots. Your exact location
                    is never shared with parking space owners until you make a booking.
                  </p>
                </div>
              </div>
            </div>

            {/* Location Access Status */}
            <div className="bg-card border rounded-lg p-4">
              <h4 className="font-medium mb-2">Current Status</h4>
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${locationAccess ? 'bg-green-500' : 'bg-gray-400'}`} />
                <span className="text-sm text-muted-foreground">
                  Location access is {locationAccess ? 'enabled' : 'disabled'}
                </span>
              </div>
              {locationAccess && (
                <p className="text-xs text-muted-foreground mt-2">
                  Parq can request your location to find nearby parking spots.
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}