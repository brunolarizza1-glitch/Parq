import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MapPin, Locate, Search } from "lucide-react";
import { SkeletonMap, EmptyState } from "@/components/ds";

export default function Map() {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [searchLocation, setSearchLocation] = useState("");
  const [, navigate] = useLocation();

  // Simulate loading map data
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
      // Simulate no location services available
      setHasError(true);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background p-4 pb-20">
        <div className="max-w-4xl mx-auto">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-foreground mb-2">Map View</h1>
            <p className="text-muted-foreground">Loading parking locations...</p>
          </div>
          
          {/* Map Search */}
          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search location..."
                value={searchLocation}
                onChange={(e) => setSearchLocation(e.target.value)}
                className="pl-10"
                disabled
              />
            </div>
          </div>

          {/* Loading Map */}
          <SkeletonMap className="h-[500px] w-full" />
        </div>
      </div>
    );
  }

  if (hasError) {
    return (
      <div className="min-h-screen bg-background p-4 pb-20">
        <div className="max-w-4xl mx-auto">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-foreground mb-2">Map View</h1>
            <p className="text-muted-foreground">Find parking spaces on the map</p>
          </div>
          
          {/* Map Search */}
          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search location..."
                value={searchLocation}
                onChange={(e) => setSearchLocation(e.target.value)}
                className="pl-10"
                data-testid="input-map-search"
              />
            </div>
          </div>

          {/* Empty State */}
          <EmptyState
            icon={<MapPin className="w-16 h-16" />}
            title="Interactive map coming soon"
            description="Our map feature is in development. For now, use the Find tab to browse available parking spaces in San Francisco."
            ctaText="Browse Parking Spaces"
            onCtaClick={() => navigate("/")}
          />
        </div>
      </div>
    );
  }

  return null;
}