import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useGeolocation } from "@/hooks/useGeolocation";
import { MapPin, Navigation, Search } from "lucide-react";

interface SearchFilters {
  city?: string;
  minPrice?: number;
  maxPrice?: number;
  spaceType?: string;
  amenities?: string[];
  latitude?: number;
  longitude?: number;
  radius?: number;
}

interface HeroSearchProps {
  onSearch: (filters: SearchFilters) => void;
  userLocation?: {
    latitude: number;
    longitude: number;
    address?: string;
  } | null;
}

export default function HeroSearch({ onSearch, userLocation }: HeroSearchProps) {
  const [location, setLocation] = useState("");
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [useCurrentLocation, setUseCurrentLocation] = useState(false);
  const { toast } = useToast();
  const { latitude, longitude, loading: locationLoading, getCurrentPosition } = useGeolocation();

  // Get current date and time in the required format
  const getCurrentDateTime = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  const minDateTime = getCurrentDateTime();

  // Update location input when GPS location is detected
  useEffect(() => {
    if (userLocation?.address) {
      setLocation(userLocation.address);
      setUseCurrentLocation(true);
    }
  }, [userLocation]);

  const handleUseCurrentLocation = () => {
    if (userLocation) {
      setLocation(userLocation.address || "Current Location");
      setUseCurrentLocation(true);
      // Don't show toast here - LocationDetector already handles it
    } else {
      getCurrentPosition();
      // Only show this specific toast for manual trigger
      toast({
        title: "Detecting Location",
        description: "Please allow location access",
      });
    }
  };

  const handleSearch = () => {
    const searchFilters: SearchFilters = {
      city: !useCurrentLocation ? location || undefined : undefined,
      latitude: useCurrentLocation && userLocation ? userLocation.latitude : undefined,
      longitude: useCurrentLocation && userLocation ? userLocation.longitude : undefined,
      radius: useCurrentLocation ? 10 : undefined, // 10km radius when using GPS
    };

    onSearch(searchFilters);
  };

  return (
    <section className="hero-gradient text-white py-16 md:py-24">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* Optimized for first paint - keep this minimal and fast */}
        <h1 className="text-4xl md:text-6xl font-bold mb-6">
          Find parking now<br />
          wherever you are
        </h1>
        <p className="text-xl md:text-2xl mb-12 opacity-90">
          Book parking spots instantly. Skip the drive-around.
        </p>

        {/* Search Form */}
        <div className="bg-white rounded-2xl shadow-2xl p-4 md:p-8 max-w-4xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            {/* Location Input */}
            <div className="md:col-span-1">
              <Label 
                htmlFor="search-location" 
                className="block text-sm font-medium text-black mb-2"
              >
                Where
              </Label>
              <div className="relative">
                <MapPin 
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-600 w-4 h-4" 
                  aria-hidden="true"
                />
                <Input
                  id="search-location"
                  type="text"
                  placeholder={useCurrentLocation ? userLocation?.address || "Current Location" : "Enter city or address"}
                  value={useCurrentLocation ? (userLocation?.address || "Current Location") : location}
                  onChange={(e) => {
                    setLocation(e.target.value);
                    setUseCurrentLocation(false);
                  }}
                  className="pl-10 pr-12 text-black placeholder:text-gray-500 min-h-[44px]"
                  data-testid="input-search-location"
                  disabled={useCurrentLocation}
                  aria-describedby="location-help"
                />
                <div id="location-help" className="sr-only">
                  Type where you need parking
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={handleUseCurrentLocation}
                  disabled={locationLoading}
                  className="absolute right-1 top-1/2 transform -translate-y-1/2"
                  data-testid="button-use-location"
                  aria-label={useCurrentLocation ? "Using current location" : "Use my current location"}
                  title={useCurrentLocation ? "Using current location" : "Use my current location"}
                >
                  <Navigation 
                    className={`w-4 h-4 ${useCurrentLocation ? 'text-blue-600' : 'text-gray-600'}`}
                    aria-hidden="true"
                  />
                </Button>
              </div>
            </div>

            {/* Check-in */}
            <div className="md:col-span-1">
              <Label 
                htmlFor="search-checkin" 
                className="block text-sm font-medium text-black mb-2"
              >
                Check-in
              </Label>
              <Input
                id="search-checkin"
                type="datetime-local"
                value={checkIn}
                min={minDateTime}
                onChange={(e) => {
                  setCheckIn(e.target.value);
                  // Auto-set check-out to 1 hour later if not set
                  if (!checkOut && e.target.value) {
                    const checkInDate = new Date(e.target.value);
                    checkInDate.setHours(checkInDate.getHours() + 1);
                    const checkOutValue = checkInDate.toISOString().slice(0, 16);
                    setCheckOut(checkOutValue);
                  }
                }}
                className="text-black min-h-[44px]"
                data-testid="input-search-checkin"
                aria-describedby="checkin-help"
              />
              <div id="checkin-help" className="sr-only">
                When do you need to start parking?
              </div>
            </div>

            {/* Check-out */}
            <div className="md:col-span-1">
              <Label 
                htmlFor="search-checkout" 
                className="block text-sm font-medium text-black mb-2"
              >
                Check-out
              </Label>
              <Input
                id="search-checkout"
                type="datetime-local"
                value={checkOut}
                min={checkIn || minDateTime}
                onChange={(e) => setCheckOut(e.target.value)}
                className="text-black min-h-[44px]"
                data-testid="input-search-checkout"
                aria-describedby="checkout-help"
              />
              <div id="checkout-help" className="sr-only">
                When will you leave?
              </div>
            </div>

            {/* Search Button */}
            <div className="sm:col-span-2 md:col-span-1 flex items-end">
              <Button
                onClick={handleSearch}
                className="w-full flex items-center justify-center touch-target active:scale-95 transition-transform text-base py-3 min-h-[48px]"
                data-testid="button-hero-search"
                aria-label="Find parking now"
                type="button"
              >
                <Search className="mr-2 h-4 w-4" aria-hidden="true" />
                Search
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
