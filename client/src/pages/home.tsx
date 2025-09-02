import HeroSearch from "@/components/hero-search";
import FilterBar from "@/components/filter-bar";
import ParkingCard from "@/components/parking-card";
import { LazyComponent } from "@/components/lazy-component";
import { useQuery } from "@tanstack/react-query";
import { type ParkingSpace } from "@shared/schema";
import { useState, lazy, Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { LocationDetector } from "@/components/LocationDetector";
import { EmptyState } from "@/components/ds";
import { Search } from "lucide-react";

// Lazy load components below the fold
const FeaturesSection = lazy(() => import("@/components/features-section"));
const Footer = lazy(() => import("@/components/footer"));

export default function Home() {
  const [userLocation, setUserLocation] = useState<{
    latitude: number;
    longitude: number;
    address?: string;
  } | null>(null);
  const [searchFilters, setSearchFilters] = useState<{
    city?: string;
    minPrice?: number;
    maxPrice?: number;
    spaceType?: string;
    amenities?: string[];
    latitude?: number;
    longitude?: number;
    radius?: number;
  }>({});

  const { data: parkingSpaces, isLoading } = useQuery<ParkingSpace[]>({
    queryKey: ["/api/parking-spaces", searchFilters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (searchFilters.city) params.append("city", searchFilters.city);
      if (searchFilters.minPrice) params.append("minPrice", searchFilters.minPrice.toString());
      if (searchFilters.maxPrice) params.append("maxPrice", searchFilters.maxPrice.toString());
      if (searchFilters.spaceType) params.append("spaceType", searchFilters.spaceType);
      if (searchFilters.amenities) params.append("amenities", searchFilters.amenities.join(","));
      if (searchFilters.latitude) params.append("latitude", searchFilters.latitude.toString());
      if (searchFilters.longitude) params.append("longitude", searchFilters.longitude.toString());
      if (searchFilters.radius) params.append("radius", searchFilters.radius.toString());
      
      const response = await fetch(`/api/parking-spaces?${params}`);
      if (!response.ok) throw new Error("Failed to fetch parking spaces");
      return response.json();
    },
  });

  const handleSearch = (filters: typeof searchFilters) => {
    setSearchFilters(filters);
  };

  const handleLocationDetected = (lat: number, lng: number, address?: string) => {
    setUserLocation({ latitude: lat, longitude: lng, address });
    // Automatically search for nearby parking spaces
    setSearchFilters(prev => ({
      ...prev,
      latitude: lat,
      longitude: lng,
      radius: 10, // 10km radius
    }));
  };

  return (
    <div className="min-h-screen bg-background">
      <HeroSearch onSearch={handleSearch} userLocation={userLocation} />
      
      {/* Filter Bar - Lazy loaded to keep initial paint fast */}
      <LazyComponent fallback={<Skeleton className="h-16 w-full" />} rootMargin="0px">
        <FilterBar onFilterChange={setSearchFilters} />
      </LazyComponent>
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Location Detection */}
        <div className="mb-6">
          <LocationDetector 
            onLocationDetected={handleLocationDetected}
            autoDetect={true}
          />
        </div>

        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-semibold text-foreground" data-testid="text-listing-count">
            {parkingSpaces ? parkingSpaces.length : 0} parking spaces available
          </h2>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-muted-foreground">Sort by:</span>
            <select 
              className="border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              data-testid="select-sort"
              onChange={(e) => {
                const sortValue = e.target.value;
                if (sortValue === "distance" && userLocation) {
                  setSearchFilters(prev => ({
                    ...prev,
                    latitude: userLocation.latitude,
                    longitude: userLocation.longitude,
                    radius: 10
                  }));
                }
              }}
            >
              <option value="default">Recommended</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="distance" disabled={!userLocation}>
                {userLocation ? "Distance" : "Distance (Enable location)"}
              </option>
              <option value="rating">Rating</option>
            </select>
          </div>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="bg-card rounded-2xl shadow-lg overflow-hidden">
                <Skeleton className="w-full h-48" />
                <div className="p-4 space-y-3">
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                  <Skeleton className="h-4 w-full" />
                  <div className="flex justify-between items-center">
                    <Skeleton className="h-6 w-20" />
                    <Skeleton className="h-10 w-24" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {parkingSpaces?.map((space) => (
              <ParkingCard 
                key={space.id} 
                space={space} 
                userLatitude={userLocation?.latitude}
                userLongitude={userLocation?.longitude}
              />
            ))}
          </div>
        )}

        {!isLoading && parkingSpaces && parkingSpaces.length === 0 && (
          <EmptyState
            icon={<Search className="w-16 h-16" />}
            title="No parking spaces found"
            description={searchFilters.city || searchFilters.latitude ? 
              "No parking spots match what you searched for. Try a bigger area or change your filters." :
              "Search for parking in your city or turn on location to find nearby spots."
            }
            ctaText={searchFilters.city || searchFilters.latitude ? "Clear Filters" : "Show All Spots"}
            onCtaClick={() => {
              if (searchFilters.city || searchFilters.latitude) {
                setSearchFilters({});
              } else {
                setSearchFilters({ city: "San Francisco" });
              }
            }}
          />
        )}
      </main>

      {/* Features Section - Lazy loaded below the fold */}
      <LazyComponent fallback={<Skeleton className="h-96 w-full" />}>
        <Suspense fallback={<Skeleton className="h-96 w-full" />}>
          <FeaturesSection />
        </Suspense>
      </LazyComponent>
      
      {/* Footer - Lazy loaded */}
      <LazyComponent fallback={<Skeleton className="h-32 w-full" />}>
        <Suspense fallback={<Skeleton className="h-32 w-full" />}>
          <Footer />
        </Suspense>
      </LazyComponent>
    </div>
  );
}
