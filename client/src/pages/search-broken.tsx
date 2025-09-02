import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, MapPin, Filter, Star, DollarSign, Car, Home, Shield, Locate, Search as SearchIcon, Map, Heart, Zap } from "lucide-react";
import { Link } from "wouter";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { SkeletonCard, EmptyState } from "@/components/ds";
import AuthSheet from "@/components/auth-sheet";
import { useAuthSheet } from "@/hooks/useAuthSheet";

// Mock data for parking spaces
const mockParkingSpaces = [
  {
    id: "1",
    title: "Downtown Office Parking",
    address: "123 Main St, San Francisco, CA",
    pricePerHour: 8.50,
    rating: 4.8,
    reviewCount: 124,
    distance: 0.2,
    spaceType: "covered",
    amenities: ["EV Charging", "Security Camera", "Covered"],
    images: ["https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400"],
    availability: "Available now",
    owner: "Sarah M.",
  },
  {
    id: "2", 
    title: "Secure Residential Driveway",
    address: "456 Oak Ave, San Francisco, CA",
    pricePerHour: 6.00,
    rating: 4.9,
    reviewCount: 87,
    distance: 0.4,
    spaceType: "driveway",
    amenities: ["Gated", "Well-lit", "Close to Transit"],
    images: ["https://images.unsplash.com/photo-1558618048-fbd6aa202862?w=400"],
    availability: "Available from 8 AM",
    owner: "Mike T.",
  },
  {
    id: "3",
    title: "Garage Space Near Union Square",
    address: "789 Powell St, San Francisco, CA", 
    pricePerHour: 12.00,
    rating: 4.6,
    reviewCount: 203,
    distance: 0.6,
    spaceType: "garage",
    amenities: ["Indoor", "Elevator Access", "24/7 Access"],
    images: ["https://images.unsplash.com/photo-1590674899484-d5640e854abe?w=400"],
    availability: "Available now",
    owner: "Lisa K.",
  },
];

export default function Search() {
  const [searchLocation, setSearchLocation] = useState("");
  const [currentLocation, setCurrentLocation] = useState<{lat: number, lng: number} | null>(null);
  const [locationLoading, setLocationLoading] = useState(false);
  const [showMap, setShowMap] = useState(false);
  const [searchDate, setSearchDate] = useState(() => {
    // Default to today
    const today = new Date();
    return today.toISOString().split('T')[0];
  });
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [vehicleSize, setVehicleSize] = useState("");
  const [maxPrice, setMaxPrice] = useState([25]);
  const [spaceTypes, setSpaceTypes] = useState<string[]>([]);
  const [amenities, setAmenities] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState("distance");
  const [favorites, setFavorites] = useState<string[]>([]);
  const [activeFilters, setActiveFilters] = useState({
    price: false,
    distance: false,
    ev: false,
    covered: false,
  });
  const [filteredSpaces, setFilteredSpaces] = useState(mockParkingSpaces);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const { isOpen: isAuthOpen, mode: authMode, openSheet: openAuthSheet, closeSheet: closeAuthSheet, toggleMode: toggleAuthMode } = useAuthSheet();

  // Get current location
  const getCurrentLocation = async () => {
    setLocationLoading(true);
    try {
      if (!navigator.geolocation) {
        throw new Error("Geolocation is not supported by this browser");
      }

      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000 // 5 minutes
        });
      });

      const coords = {
        lat: position.coords.latitude,
        lng: position.coords.longitude
      };
      
      setCurrentLocation(coords);
      setSearchLocation("Current Location");
      
      toast({
        title: "Location Found",
        description: "Using your current location to find nearby parking.",
      });
    } catch (error) {
      console.error("Error getting location:", error);
      toast({
        title: "Location Error",
        description: "Could not get your current location. Please enter a location manually.",
        variant: "destructive",
      });
    } finally {
      setLocationLoading(false);
    }
  };

  const handleSearch = () => {
    setIsLoading(true);
    
    // Simulate search
    setTimeout(() => {
      setIsLoading(false);
      toast({
        title: "Search Complete",
        description: `Found ${filteredSpaces.length} parking spaces matching your criteria.`,
      });
    }, 1000);
  };

  const toggleFavorite = (spaceId: string) => {
    setFavorites(prev => 
      prev.includes(spaceId) 
        ? prev.filter(id => id !== spaceId)
        : [...prev, spaceId]
    );
  };

  const toggleFilter = (filterKey: keyof typeof activeFilters) => {
    setActiveFilters(prev => ({
      ...prev,
      [filterKey]: !prev[filterKey]
    }));
  };

  // Filter spaces based on criteria
  useEffect(() => {
    let filtered = mockParkingSpaces.filter(space => {
      const matchesPrice = space.pricePerHour <= maxPrice[0];
      const matchesSpaceType = spaceTypes.length === 0 || spaceTypes.includes(space.spaceType);
      const matchesAmenities = amenities.length === 0 || amenities.some(amenity => 
        space.amenities.some(spaceAmenity => spaceAmenity.toLowerCase().includes(amenity.toLowerCase()))
      );
      
      return matchesPrice && matchesSpaceType && matchesAmenities;
    });

    // Sort spaces
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "price-low":
          return a.pricePerHour - b.pricePerHour;
        case "price-high":
          return b.pricePerHour - a.pricePerHour;
        case "rating":
          return b.rating - a.rating;
        case "distance":
        default:
          return a.distance - b.distance;
      }
    });

    setFilteredSpaces(filtered);
  }, [maxPrice, spaceTypes, amenities, sortBy]);

  const handleSpaceTypeChange = (spaceType: string, checked: boolean) => {
    if (checked) {
      setSpaceTypes([...spaceTypes, spaceType]);
    } else {
      setSpaceTypes(spaceTypes.filter(type => type !== spaceType));
    }
  };

  const handleAmenityChange = (amenity: string, checked: boolean) => {
    if (checked) {
      setAmenities([...amenities, amenity]);
    } else {
      setAmenities(amenities.filter(a => a !== amenity));
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Find Parking</h1>
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
              {/* Location Field */}
              <div className="xl:col-span-2">
                <Label htmlFor="location" className="text-sm font-medium text-gray-700">Location</Label>
                <div className="relative mt-1">
                  <MapPin className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                  <Input
                    id="location"
                    value={searchLocation}
                    onChange={(e) => setSearchLocation(e.target.value)}
                    placeholder="Where to?"
                    className="pl-10 pr-12"
                    data-testid="input-search-location"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={getCurrentLocation}
                    disabled={locationLoading}
                    className="absolute right-1 top-1 h-8 px-2"
                    data-testid="button-current-location"
                  >
                    <Locate className={`w-4 h-4 ${locationLoading ? 'animate-spin' : ''}`} />
                  </Button>
                </div>
              </div>
              
              {/* Date Field */}
              <div>
                <Label htmlFor="search-date" className="text-sm font-medium text-gray-700">Date</Label>
                <div className="relative mt-1">
                  <Calendar className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                  <Input
                    id="search-date"
                    type="date"
                    value={searchDate}
                    onChange={(e) => setSearchDate(e.target.value)}
                    className="pl-10"
                    data-testid="input-search-date"
                  />
                </div>
              </div>

              {/* Start Time */}
              <div>
                <Label htmlFor="start-time" className="text-sm font-medium text-gray-700">Start time</Label>
                <div className="relative mt-1">
                  <Clock className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                  <Input
                    id="start-time"
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="pl-10"
                    data-testid="input-start-time"
                  />
                </div>
              </div>

              {/* End Time */}
              <div>
                <Label htmlFor="end-time" className="text-sm font-medium text-gray-700">End time</Label>
                <div className="relative mt-1">
                  <Clock className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                  <Input
                    id="end-time"
                    type="time"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="pl-10"
                    data-testid="input-end-time"
                  />
                </div>
              </div>

              {/* Vehicle Size */}
              <div>
                <Label htmlFor="vehicle-size" className="text-sm font-medium text-gray-700">Vehicle size</Label>
                <Select value={vehicleSize} onValueChange={setVehicleSize}>
                  <SelectTrigger className="mt-1" data-testid="select-vehicle-size">
                    <div className="flex items-center">
                      <Car className="w-4 h-4 mr-2 text-gray-400" />
                      <SelectValue placeholder="Select size" />
                    </div>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="compact">Compact</SelectItem>
                    <SelectItem value="suv">SUV</SelectItem>
                    <SelectItem value="van">Van</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Search Button */}
              <div className="flex items-end">
                <Button 
                  className="w-full mt-1" 
                  onClick={handleSearch}
                  data-testid="button-search"
                >
                  <SearchIcon className="w-4 h-4 mr-2" />
                  Search
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="flex gap-8">

        {/* Map View */}
        {showMap && (
          <div className="mb-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center">
                    <Map className="w-5 h-5 mr-2" />
                    Map View
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowMap(false)}
                    data-testid="button-close-map"
                  >
                    ×
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64 bg-gray-100 rounded-lg flex items-center justify-center relative overflow-hidden">
                  {/* Simple Map Placeholder with Markers */}
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-green-50">
                    {/* Mock map grid */}
                    <div className="absolute inset-0 opacity-20">
                      {Array.from({ length: 8 }).map((_, i) => (
                        <div
                          key={`v-${i}`}
                          className="absolute w-px bg-gray-300 h-full"
                          style={{ left: `${(i + 1) * 12.5}%` }}
                        />
                      ))}
                      {Array.from({ length: 6 }).map((_, i) => (
                        <div
                          key={`h-${i}`}
                          className="absolute h-px bg-gray-300 w-full"
                          style={{ top: `${(i + 1) * 16.67}%` }}
                        />
                      ))}
                    </div>
                    
                    {/* Mock parking space markers */}
                    <div className="absolute top-4 left-8 w-3 h-3 bg-green-500 rounded-full shadow-lg animate-pulse" />
                    <div className="absolute top-12 right-12 w-3 h-3 bg-blue-500 rounded-full shadow-lg" />
                    <div className="absolute bottom-8 left-1/3 w-3 h-3 bg-yellow-500 rounded-full shadow-lg" />
                    <div className="absolute top-1/2 right-1/4 w-3 h-3 bg-green-500 rounded-full shadow-lg" />
                    
                    {currentLocation && (
                      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                        <div className="w-4 h-4 bg-red-500 rounded-full shadow-lg animate-pulse" />
                        <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 text-xs font-medium text-red-600 whitespace-nowrap">
                          You are here
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <div className="text-center z-10">
                    <p className="text-sm text-gray-600 mb-2">Interactive Map View</p>
                    <p className="text-xs text-gray-500">
                      {currentLocation ? "📍 Current location detected" : "🔍 Search for location to see nearby parking"}
                    </p>
                  </div>
                </div>
                
                <div className="mt-4 flex items-center gap-4 text-xs">
                  <div className="flex items-center">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-1" />
                    Available Now
                  </div>
                  <div className="flex items-center">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mr-1" />
                    Available Later
                  </div>
                  <div className="flex items-center">
                    <div className="w-2 h-2 bg-yellow-500 rounded-full mr-1" />
                    Limited Availability
                  </div>
                  {currentLocation && (
                    <div className="flex items-center">
                      <div className="w-2 h-2 bg-red-500 rounded-full mr-1" />
                      Your Location
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Filter Chips */}
        <div className="mb-6">
          <div className="flex flex-wrap gap-2">
            <Button
              variant={activeFilters.price ? "default" : "outline"}
              size="sm"
              onClick={() => toggleFilter('price')}
              className={`${activeFilters.price ? 'bg-blue-600 text-white' : 'hover:bg-gray-50'}`}
              data-testid="chip-price"
            >
              <DollarSign className="w-4 h-4 mr-1" />
              Price
            </Button>
            <Button
              variant={activeFilters.distance ? "default" : "outline"}
              size="sm"
              onClick={() => toggleFilter('distance')}
              className={`${activeFilters.distance ? 'bg-blue-600 text-white' : 'hover:bg-gray-50'}`}
              data-testid="chip-distance"
            >
              <MapPin className="w-4 h-4 mr-1" />
              Distance
            </Button>
            <Button
              variant={activeFilters.ev ? "default" : "outline"}
              size="sm"
              onClick={() => toggleFilter('ev')}
              className={`${activeFilters.ev ? 'bg-blue-600 text-white' : 'hover:bg-gray-50'}`}
              data-testid="chip-ev"
            >
              <Zap className="w-4 h-4 mr-1" />
              EV
            </Button>
            <Button
              variant={activeFilters.covered ? "default" : "outline"}
              size="sm"
              onClick={() => toggleFilter('covered')}
              className={`${activeFilters.covered ? 'bg-blue-600 text-white' : 'hover:bg-gray-50'}`}
              data-testid="chip-covered"
            >
              <Shield className="w-4 h-4 mr-1" />
              Covered
            </Button>
          </div>
        </div>

        {/* Results Header */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">
            {filteredSpaces.length} parking spaces found
          </h2>
        </div>

        {/* Parking Cards Grid */}
        <div className="space-y-4">
          {/* Loading State */}
          {isLoading && (
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <SkeletonCard key={i} />
              ))}
            </div>
          )}

          {/* Parking Space Cards */}
          {!isLoading && filteredSpaces.map((space) => (
            <Card key={space.id} className="hover:shadow-md transition-shadow duration-200">
              <CardContent className="p-4">
                <div className="flex gap-4">
                  {/* Photo */}
                  <div className="flex-shrink-0">
                    <img
                      src={space.images[0]}
                      alt={space.title}
                      className="w-24 h-24 object-cover rounded-lg"
                      data-testid={`img-parking-${space.id}`}
                    />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-semibold text-gray-900 truncate" data-testid={`title-${space.id}`}>
                          {space.title}
                        </h3>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <MapPin className="w-4 h-4" />
                          <span data-testid={`distance-${space.id}`}>{space.distance} mi away</span>
                        </div>
                      </div>
                      
                      {/* Favorite Heart */}
                      <Button
                        variant="ghost"
                        size="sm"
                        className="p-1 h-auto"
                        onClick={() => toggleFavorite(space.id)}
                        data-testid={`button-favorite-${space.id}`}
                      >
                        <Heart 
                          className={`w-5 h-5 ${
                            favorites.includes(space.id) 
                              ? 'fill-red-500 text-red-500' 
                              : 'text-gray-400 hover:text-red-500'
                          }`} 
                        />
                      </Button>
                    </div>

                    {/* Price and Rating Row */}
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-1">
                        <span className="text-xl font-bold text-gray-900" data-testid={`price-${space.id}`}>
                          ${space.pricePerHour}
                        </span>
                        <span className="text-sm text-gray-600">/hour</span>
                      </div>
                      
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 text-yellow-400 fill-current" />
                        <span className="text-sm font-medium" data-testid={`rating-${space.id}`}>
                          {space.rating}
                        </span>
                        <span className="text-sm text-gray-500">({space.reviewCount})</span>
                      </div>
                    </div>

                    {/* Quick Badges */}
                    <div className="flex flex-wrap gap-2 mb-3">
                      {space.amenities.includes("Covered") && (
                        <Badge variant="secondary" className="text-xs">
                          <Shield className="w-3 h-3 mr-1" />
                          Covered
                        </Badge>
                      )}
                      {space.amenities.includes("EV Charging") && (
                        <Badge variant="secondary" className="text-xs">
                          <Zap className="w-3 h-3 mr-1" />
                          EV
                        </Badge>
                      )}
                      {space.amenities.includes("Security Camera") && (
                        <Badge variant="secondary" className="text-xs">
                          <Shield className="w-3 h-3 mr-1" />
                          Secure
                        </Badge>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" className="flex-1" data-testid={`button-details-${space.id}`}>
                        Details
                      </Button>
                      <Button 
                        size="sm" 
                        className="flex-1"
                        onClick={() => openAuthSheet("signin")}
                        data-testid={`button-book-${space.id}`}
                      >
                        Book Now
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          {/* Empty State */}
          {!isLoading && filteredSpaces.length === 0 && (
            <EmptyState
              icon={<SearchIcon className="w-16 h-16" />}
              title="No parking spaces found"
              description="Try adjusting your search criteria or location to find available parking spaces."
              ctaText="Clear Filters"
              onCtaClick={() => {
                setActiveFilters({ price: false, distance: false, ev: false, covered: false });
              }}
            />
          )}
        </div>
      </div>

      {/* Auth Sheet */}
      <AuthSheet
        isOpen={isAuthOpen}
        onClose={closeAuthSheet}
        mode={authMode}
        onModeChange={toggleAuthMode}
      />
    </div>
  );
}