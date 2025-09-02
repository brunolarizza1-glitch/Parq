import { useLocation } from "wouter";
import { DSH1, DSH2, DSBody, DSButton } from "@/components/ds";
import { MapPin, DollarSign, Shield, Car, Plus } from "lucide-react";

export default function Welcome() {
  const [, navigate] = useLocation();

  const handleNavigation = (path: string) => {
    // Mark that user has seen welcome screen
    localStorage.setItem('hasSeenWelcome', 'true');
    navigate(path);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col justify-center p-6">
      <div className="max-w-md mx-auto text-center space-y-8">
        
        {/* Logo/Brand */}
        <div className="mb-8">
          <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center mx-auto mb-4">
            <MapPin className="w-8 h-8 text-primary-foreground" />
          </div>
          <DSH1 className="text-foreground mb-2">Parq</DSH1>
          <DSBody className="text-muted-foreground">
            Your local parking marketplace
          </DSBody>
        </div>

        {/* Value Props */}
        <div className="space-y-6">
          <div className="flex items-center space-x-4 text-left">
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center flex-shrink-0">
              <Car className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <DSH2 className="text-foreground text-lg">Save time</DSH2>
              <DSBody className="text-muted-foreground text-sm">
                Find parking instantly, skip the stress
              </DSBody>
            </div>
          </div>

          <div className="flex items-center space-x-4 text-left">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
              <Shield className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <DSH2 className="text-foreground text-lg">Safe spots</DSH2>
              <DSBody className="text-muted-foreground text-sm">
                Verified locations with trusted hosts
              </DSBody>
            </div>
          </div>

          <div className="flex items-center space-x-4 text-left">
            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center flex-shrink-0">
              <DollarSign className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <DSH2 className="text-foreground text-lg">Easy payouts</DSH2>
              <DSBody className="text-muted-foreground text-sm">
                Earn money from your unused parking space
              </DSBody>
            </div>
          </div>
        </div>

        {/* Main CTAs */}
        <div className="space-y-3 pt-8">
          <DSButton 
            variant="primary" 
            size="lg" 
            className="w-full"
            onClick={() => handleNavigation("/search")}
            data-testid="button-find-parking"
          >
            <Car className="w-5 h-5 mr-2" />
            Find Parking
          </DSButton>

          <DSButton 
            variant="outline" 
            size="lg" 
            className="w-full"
            onClick={() => handleNavigation("/list-space")}
            data-testid="button-list-spot"
          >
            <Plus className="w-5 h-5 mr-2" />
            List My Spot
          </DSButton>
        </div>

        {/* Continue Button */}
        <div className="pt-4">
          <DSButton 
            variant="ghost" 
            size="sm"
            onClick={() => handleNavigation("/search")}
            data-testid="button-continue"
            className="text-muted-foreground"
          >
            Continue →
          </DSButton>
        </div>

        {/* Footer */}
        <div className="pt-8 text-center">
          <DSBody className="text-muted-foreground text-xs">
            Hourly parking • Book instantly
          </DSBody>
        </div>
      </div>
    </div>
  );
}