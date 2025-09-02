import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, MapPin, Filter, Star, DollarSign, Car, Home, Shield, Locate, Search as SearchIcon, Map, Heart, Zap, Info, Navigation, Target, Move, Lasso, X, Zap as EvIcon, Ruler, ShieldCheck, WifiOff, ZoomOut, Clock3, AlertTriangle, Plus, Minus } from "lucide-react";
import { Link } from "wouter";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { SkeletonCard, EmptyState } from "@/components/ds";
import AuthSheet from "@/components/auth-sheet";
import { useAuthSheet } from "@/hooks/useAuthSheet";

export default function Search() {
  const [searchLocation, setSearchLocation] = useState("");
  const [currentLocation, setCurrentLocation] = useState<string | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  const [locationDenied, setLocationDenied] = useState(false);
  const [locationAccuracy, setLocationAccuracy] = useState<number | null>(null);
  const [coordinates, setCoordinates] = useState<{lat: number, lng: number} | null>(null);
  const [suggestions, setSuggestions] = useState<Array<{id: string, text: string, type: string}>>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState(-1);
  const [mapViewport, setMapViewport] = useState({
    center: { lat: 34.0522, lng: -118.2437 }, // Los Angeles default
    zoom: 12
  });
  const [selectedPinId, setSelectedPinId] = useState<string | null>(null);
  const [hoveredCardId, setHoveredCardId] = useState<string | null>(null);
  const [lastUpdateTime, setLastUpdateTime] = useState<Date>(new Date());
  const [changedPins, setChangedPins] = useState<Set<string>>(new Set());
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showLegend, setShowLegend] = useState(false);
  const [mapRotation, setMapRotation] = useState(0); // In degrees
  const [userChosenLocation, setUserChosenLocation] = useState<{lat: number, lng: number} | null>(null);
  const [hasMapMoved, setHasMapMoved] = useState(false);
  const [isDrawingLasso, setIsDrawingLasso] = useState(false);
  const [lassoPoints, setLassoPoints] = useState<{x: number, y: number}[]>([]);
  const [searchPolygon, setSearchPolygon] = useState<{x: number, y: number}[] | null>(null);
  const [originalMapCenter, setOriginalMapCenter] = useState(mapViewport.center);
  
  // Filter state
  const [activeFilters, setActiveFilters] = useState<{
    maxPrice?: number;
    maxDistance?: number;
    evCharging?: boolean;
    covered?: boolean;
    heightLimit?: number;
    security?: boolean;
  }>({});
  const [sortBy, setSortBy] = useState<'distance' | 'price'>('distance');
  
  // Mock flags for testing edge cases
  const [mockGpsFailure, setMockGpsFailure] = useState(false);
  const [mockOfflineMode, setMockOfflineMode] = useState(false);
  const [cachedResults, setCachedResults] = useState<typeof parkingSpots>([]);
  const [lastOnlineUpdate, setLastOnlineUpdate] = useState<Date>(new Date());
  
  // Privacy consent state
  const [showPrivacyConsent, setShowPrivacyConsent] = useState(false);
  const [hasSeenPrivacyNotice, setHasSeenPrivacyNotice] = useState(() => {
    return localStorage.getItem('parq-privacy-consent') === 'true';
  });

  // Clustering logic
  const clusterDistance = 50; // pixels
  const shouldCluster = mapViewport.zoom < 14; // Cluster at zoom levels below 14

  const createClusters = (spots: typeof parkingSpots) => {
    if (!shouldCluster) {
      return spots.map(spot => ({
        type: "individual" as const,
        spot,
        position: {
          x: (spot.lng - mapViewport.center.lng) * 1000 + 200,
          y: (mapViewport.center.lat - spot.lat) * 1000 + 150
        }
      }));
    }

    const clusters: Array<{
      type: "cluster" | "individual";
      spots?: typeof parkingSpots;
      spot?: typeof parkingSpots[0];
      position: { x: number; y: number };
      count?: number;
    }> = [];

    const processed = new Set<string>();

    spots.forEach(spot => {
      if (processed.has(spot.id)) return;

      const position = {
        x: (spot.lng - mapViewport.center.lng) * 1000 + 200,
        y: (mapViewport.center.lat - spot.lat) * 1000 + 150
      };

      // Find nearby spots
      const nearbySpots = spots.filter(otherSpot => {
        if (processed.has(otherSpot.id) || otherSpot.id === spot.id) return false;
        
        const otherPosition = {
          x: (otherSpot.lng - mapViewport.center.lng) * 1000 + 200,
          y: (mapViewport.center.lat - otherSpot.lat) * 1000 + 150
        };

        const distance = Math.sqrt(
          Math.pow(position.x - otherPosition.x, 2) + 
          Math.pow(position.y - otherPosition.y, 2)
        );

        return distance < clusterDistance;
      });

      if (nearbySpots.length > 0) {
        // Create cluster
        const clusterSpots = [spot, ...nearbySpots];
        const avgPosition = {
          x: clusterSpots.reduce((sum, s) => sum + (s.lng - mapViewport.center.lng) * 1000, 0) / clusterSpots.length + 200,
          y: clusterSpots.reduce((sum, s) => sum + (mapViewport.center.lat - s.lat) * 1000, 0) / clusterSpots.length + 150
        };

        clusters.push({
          type: "cluster",
          spots: clusterSpots,
          position: avgPosition,
          count: clusterSpots.length
        });

        // Mark all spots in cluster as processed
        clusterSpots.forEach(s => processed.add(s.id));
      } else {
        // Individual pin
        clusters.push({
          type: "individual",
          spot,
          position
        });
        processed.add(spot.id);
      }
    });

    return clusters;
  };


  // Check if map center is significantly different from user's chosen location
  const isMapOffCenter = userChosenLocation && (
    Math.abs(mapViewport.center.lat - userChosenLocation.lat) > 0.01 ||
    Math.abs(mapViewport.center.lng - userChosenLocation.lng) > 0.01
  );

  const handleRecenter = () => {
    if (userChosenLocation) {
      setMapViewport(prev => ({
        ...prev,
        center: userChosenLocation
      }));
      toast({
        title: "Map recentered",
        description: currentLocation ? "Centered on your location" : "Centered on searched location",
      });
    }
  };

  const handleResetRotation = () => {
    setMapRotation(0);
    toast({
      title: "Orientation reset",
      description: "Map rotation reset to north",
    });
  };

  // Mock rotation for demo (in real map, this would be controlled by map interaction)
  const handleRotateMap = () => {
    setMapRotation(prev => (prev + 45) % 360);
  };

  // Handle map movement detection
  const handleInitialMapMove = (newCenter: {lat: number, lng: number}) => {
    setMapViewport(prev => ({ ...prev, center: newCenter }));
    // Check if map has moved significantly from original position
    const moved = Math.abs(newCenter.lat - originalMapCenter.lat) > 0.005 ||
                  Math.abs(newCenter.lng - originalMapCenter.lng) > 0.005;
    setHasMapMoved(moved);
  };

  const handleSearchThisArea = () => {
    setOriginalMapCenter(mapViewport.center);
    setHasMapMoved(false);
    setSearchPolygon(null); // Clear any existing polygon
    toast({
      title: "Searching this area",
      description: "Updated results for current map view",
    });
  };

  // Lasso drawing functions
  const startLasso = () => {
    setIsDrawingLasso(true);
    setLassoPoints([]);
    setSearchPolygon(null);
  };

  const handleMapMouseDown = (e: React.MouseEvent) => {
    if (!isDrawingLasso) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setLassoPoints([{ x, y }]);
  };

  const handleMapMouseMove = (e: React.MouseEvent) => {
    if (!isDrawingLasso || lassoPoints.length === 0) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setLassoPoints(prev => [...prev, { x, y }]);
  };

  const handleMapMouseUp = () => {
    if (!isDrawingLasso || lassoPoints.length < 3) return;
    setSearchPolygon([...lassoPoints]);
    setIsDrawingLasso(false);
    setHasMapMoved(false); // Hide "Search this area" when polygon is active
    toast({
      title: "Custom area selected",
      description: "Filtering results to drawn area",
    });
  };

  const clearLasso = () => {
    setSearchPolygon(null);
    setLassoPoints([]);
    setIsDrawingLasso(false);
    setHasMapMoved(true); // Show "Search this area" again
    toast({
      title: "Area filter cleared",
      description: "Showing all results in current view",
    });
  };

  // Filter chip handlers
  const toggleFilter = (filterType: keyof typeof activeFilters, value?: any) => {
    setActiveFilters(prev => {
      const newFilters = { ...prev };
      if (newFilters[filterType] === value || (value === undefined && newFilters[filterType])) {
        delete newFilters[filterType];
      } else {
        newFilters[filterType] = value === undefined ? true : value;
      }
      return newFilters;
    });
  };

  const clearAllFilters = () => {
    setActiveFilters({});
  };

  const getActiveFilterCount = () => {
    return Object.keys(activeFilters).length;
  };

  const getFilterSummary = () => {
    const filters = [];
    if (activeFilters.maxPrice) filters.push(`<$${activeFilters.maxPrice}`);
    if (activeFilters.maxDistance) filters.push(`<${activeFilters.maxDistance}mi`);
    if (activeFilters.evCharging) filters.push('EV');
    if (activeFilters.covered) filters.push('Covered');
    if (activeFilters.heightLimit) filters.push(`>${activeFilters.heightLimit}ft`);
    if (activeFilters.security) filters.push('Secure');
    return filters.join(', ');
  };

  // Check if a point is inside the polygon (simplified ray casting)
  const isPointInPolygon = (point: {x: number, y: number}, polygon: {x: number, y: number}[]) => {
    let inside = false;
    for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
      if (((polygon[i].y > point.y) !== (polygon[j].y > point.y)) &&
          (point.x < (polygon[j].x - polygon[i].x) * (point.y - polygon[i].y) / (polygon[j].y - polygon[i].y) + polygon[i].x)) {
        inside = !inside;
      }
    }
    return inside;
  };

  // Apply filters to spots
  const applyFilters = (spots: typeof parkingSpots) => {
    return spots.filter(spot => {
      // Price filter
      if (activeFilters.maxPrice && spot.priceValue > activeFilters.maxPrice) return false;
      
      // Distance filter  
      if (activeFilters.maxDistance && spot.distance > activeFilters.maxDistance) return false;
      
      // EV charging filter
      if (activeFilters.evCharging && !spot.evCharging) return false;
      
      // Covered parking filter
      if (activeFilters.covered && !spot.covered) return false;
      
      // Height limit filter
      if (activeFilters.heightLimit && spot.heightLimit < activeFilters.heightLimit) return false;
      
      // Security filter
      if (activeFilters.security && !spot.security) return false;
      
      return true;
    });
  };

  // Sort spots
  const sortSpots = (spots: typeof parkingSpots) => {
    return [...spots].sort((a, b) => {
      if (sortBy === 'distance') {
        if (a.distance !== b.distance) return a.distance - b.distance;
        return a.priceValue - b.priceValue; // Secondary sort by price
      } else {
        if (a.priceValue !== b.priceValue) return a.priceValue - b.priceValue;
        return a.distance - b.distance; // Secondary sort by distance
      }
    });
  };

  // Filter spots based on polygon and active filters
  // Will be set after parkingSpots declaration below
  let filteredSpots: any[] = [];
  
  if (searchPolygon && filteredSpots.length > 0) {
    filteredSpots = filteredSpots.filter(spot => {
      const spotX = (spot.lng - mapViewport.center.lng) * 1000 + 200;
      const spotY = (mapViewport.center.lat - spot.lat) * 1000 + 150;
      const spotPoint = { x: Math.max(10, Math.min(spotX, 390)), y: Math.max(10, Math.min(spotY, 280)) };
      return isPointInPolygon(spotPoint, searchPolygon);
    });
  }
  
  filteredSpots = sortSpots(filteredSpots);
  
  // Create clustered spots after filtering
  const clusteredSpots = createClusters(filteredSpots);
  
  const [checkInDate, setCheckInDate] = useState("");
  const [checkInTime, setCheckInTime] = useState("");
  const [checkOutTime, setCheckOutTime] = useState("");
  const [vehicleSize, setVehicleSize] = useState("");
  const { toast } = useToast();
  const { isOpen: isAuthOpen, mode: authMode, openSheet: openAuthSheet, closeSheet: closeAuthSheet, toggleMode: toggleAuthMode } = useAuthSheet();
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  
  // Intersection observer for lazy rendering
  const [visibleCardRange, setVisibleCardRange] = useState({ start: 0, end: 10 });
  const cardObserver = useRef<IntersectionObserver | null>(null);

  // Lazy loading for parking cards - moved to after visibleParkingSpots declaration

  // Mock parking spots data with availability, states, and filter attributes
  const [parkingSpots, setParkingSpots] = useState([
    { id: "1", name: "Downtown Office Parking", address: "123 Main St, Los Angeles, CA", price: "$8.50/hour", priceValue: 8.5, lat: 34.0522, lng: -118.2437, rating: 4.5, available: true, spotsLeft: 12, state: "available" as const, distance: 0.5, evCharging: false, covered: true, heightLimit: 6.5, security: true },
    { id: "2", name: "Santa Monica Beach Lot", address: "456 Ocean Ave, Santa Monica, CA", price: "$12.00/hour", priceValue: 12.0, lat: 34.0195, lng: -118.4912, rating: 4.2, available: true, spotsLeft: 8, state: "available" as const, distance: 1.2, evCharging: true, covered: false, heightLimit: 8.0, security: false },
    { id: "3", name: "Hollywood Walk Garage", address: "789 Hollywood Blvd, Hollywood, CA", price: "$15.00/hour", priceValue: 15.0, lat: 34.1022, lng: -118.3405, rating: 4.0, available: false, spotsLeft: 0, state: "booked" as const, distance: 2.1, evCharging: false, covered: true, heightLimit: 7.0, security: true },
    { id: "4", name: "Beverly Hills Shopping", address: "321 Rodeo Dr, Beverly Hills, CA", price: "$20.00/hour", priceValue: 20.0, lat: 34.0696, lng: -118.4003, rating: 4.8, available: true, spotsLeft: 25, state: "available" as const, distance: 3.4, evCharging: true, covered: true, heightLimit: 6.0, security: true },
    { id: "5", name: "Venice Beach Parking", address: "654 Venice Blvd, Venice, CA", price: "$10.00/hour", priceValue: 10.0, lat: 34.0259, lng: -118.4696, rating: 4.1, available: false, spotsLeft: 3, state: "temporarily-unavailable" as const, distance: 1.8, evCharging: false, covered: false, heightLimit: 10.0, security: false },
    { id: "6", name: "Griffith Park Entrance", address: "987 Los Feliz Blvd, Los Angeles, CA", price: "$5.00/hour", priceValue: 5.0, lat: 34.1365, lng: -118.2940, rating: 4.3, available: true, spotsLeft: 45, state: "available" as const, distance: 4.2, evCharging: false, covered: false, heightLimit: 12.0, security: false },
  ]);

  // Now properly assign filtered spots after parkingSpots is available
  filteredSpots = applyFilters(parkingSpots);

  // Mock location data - in a real app, this would come from a geocoding service
  const mockLocations = [
    { id: "1", text: "Union Station, Los Angeles", type: "landmark" },
    { id: "2", text: "Santa Monica Pier", type: "landmark" },
    { id: "3", text: "Hollywood Boulevard", type: "address" },
    { id: "4", text: "Beverly Hills, CA", type: "neighborhood" },
    { id: "5", text: "Downtown Los Angeles", type: "neighborhood" },
    { id: "6", text: "Venice Beach", type: "landmark" },
    { id: "7", text: "Griffith Observatory", type: "landmark" },
    { id: "8", text: "Manhattan Beach", type: "neighborhood" },
    { id: "9", text: "Sunset Strip", type: "address" },
    { id: "10", text: "LAX Airport", type: "landmark" },
    { id: "11", text: "Rodeo Drive", type: "address" },
    { id: "12", text: "Pacific Palisades", type: "neighborhood" },
    { id: "13", text: "Chinatown, Los Angeles", type: "neighborhood" },
    { id: "14", text: "The Grove", type: "landmark" },
    { id: "15", text: "West Hollywood", type: "neighborhood" },
  ];

  // Debounced search function
  const debouncedSearch = useCallback(
    debounce((query: string) => {
      if (!query.trim()) {
        setSuggestions([]);
        setShowSuggestions(false);
        return;
      }

      const filtered = mockLocations
        .filter(location => 
          location.text.toLowerCase().includes(query.toLowerCase())
        )
        .slice(0, 5);
      
      setSuggestions(filtered);
      setShowSuggestions(filtered.length > 0);
      setSelectedSuggestionIndex(-1);
    }, 300),
    []
  );

  // Simple debounce utility
  function debounce(func: Function, wait: number) {
    let timeout: NodeJS.Timeout;
    return function executedFunction(...args: any[]) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }

  // Throttle function for map interactions - limits to max every 400ms
  function throttle(func: Function, wait: number) {
    let lastTime = 0;
    return function executedFunction(...args: any[]) {
      const now = Date.now();
      if (now - lastTime >= wait) {
        lastTime = now;
        func(...args);
      }
    };
  }

  const handleUseCurrentLocation = async () => {
    // Show privacy consent on first use
    if (!hasSeenPrivacyNotice) {
      setShowPrivacyConsent(true);
      return;
    }

    setIsLocating(true);
    setLocationDenied(false);
    
    if (!navigator.geolocation) {
      setLocationDenied(true);
      setIsLocating(false);
      return;
    }

    // Check mock GPS failure flag for testing
    if (mockGpsFailure) {
      setTimeout(() => {
        setLocationDenied(true);
        setIsLocating(false);
        toast({
          title: "GPS unavailable",
          description: "Unable to get your location. Try using address search instead.",
          variant: "destructive"
        });
      }, 2000);
      return;
    }

    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 60000,
        });
      });

      // Store coordinates and accuracy
      setCoordinates({ lat: position.coords.latitude, lng: position.coords.longitude });
      setLocationAccuracy(position.coords.accuracy);
      setUserChosenLocation({ lat: position.coords.latitude, lng: position.coords.longitude });
      
      // Center map on user location
      setMapViewport(prev => ({
        ...prev,
        center: { lat: position.coords.latitude, lng: position.coords.longitude }
      }));
      
      // In a real app, you'd reverse geocode the coordinates to get an address
      // For now, we'll show a generic current location
      setCurrentLocation("Current location");
      setSearchLocation(""); // Clear the manual search input
      setLocationDenied(false);
      
      toast({
        title: "Location found",
        description: `Parq is now showing parking near you (±${Math.round(position.coords.accuracy)}m)`,
      });
    } catch (error: any) {
      setLocationDenied(true);
      // Don't show toast error, we'll show inline notice instead
    } finally {
      setIsLocating(false);
    }
  };

  const handleAcceptPrivacyConsent = () => {
    localStorage.setItem('parq-privacy-consent', 'true');
    setHasSeenPrivacyNotice(true);
    setShowPrivacyConsent(false);
    // Proceed with location request
    handleUseCurrentLocation();
  };

  const handleDeclinePrivacyConsent = () => {
    setShowPrivacyConsent(false);
    toast({
      title: "Location access declined",
      description: "You can still search by entering an address manually.",
    });
  };

  const handleEnableLocationHelp = () => {
    // Show instructions based on user agent
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    const isAndroid = /Android/.test(navigator.userAgent);
    
    let instructions = "To enable location access:\n\n";
    
    if (isIOS) {
      instructions += "1. Go to Settings > Privacy & Security > Location Services\n";
      instructions += "2. Make sure Location Services is on\n";
      instructions += "3. Find your browser (Safari/Chrome) and set to 'While Using App'";
    } else if (isAndroid) {
      instructions += "1. Go to Settings > Apps > [Your Browser]\n";
      instructions += "2. Tap Permissions > Location\n";
      instructions += "3. Select 'Allow only while using the app'";
    } else {
      instructions += "1. Click the location icon in your browser's address bar\n";
      instructions += "2. Select 'Always allow' or 'Allow'\n";
      instructions += "3. Refresh the page and try again";
    }
    
    toast({
      title: "How to enable location",
      description: instructions,
      duration: 8000,
    });
  };

  const handleSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchLocation(value);
    debouncedSearch(value);
    
    if (value && locationDenied) {
      setLocationDenied(false); // Hide notice when user starts typing
    }
  };

  const handleSuggestionSelect = (suggestion: {id: string, text: string, type: string}) => {
    setSearchLocation(suggestion.text);
    setCurrentLocation(null); // Clear GPS location
    setCoordinates(null);
    setLocationAccuracy(null);
    setSuggestions([]);
    setShowSuggestions(false);
    
    // Mock coordinates for selected suggestion (in real app, would geocode)
    const mockCoords = {
      lat: 34.0522 + (Math.random() - 0.5) * 0.1,
      lng: -118.2437 + (Math.random() - 0.5) * 0.1
    };
    setUserChosenLocation(mockCoords);
    setMapViewport(prev => ({
      ...prev,
      center: mockCoords
    }));
    
    toast({
      title: "Location updated",
      description: `Searching near ${suggestion.text}`,
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showSuggestions) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedSuggestionIndex(prev => 
          prev < suggestions.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedSuggestionIndex(prev => prev > 0 ? prev - 1 : -1);
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedSuggestionIndex >= 0) {
          handleSuggestionSelect(suggestions[selectedSuggestionIndex]);
        } else if (suggestions.length > 0) {
          handleSuggestionSelect(suggestions[0]);
        }
        break;
      case 'Escape':
        setSuggestions([]);
        setShowSuggestions(false);
        setSelectedSuggestionIndex(-1);
        inputRef.current?.blur();
        break;
    }
  };

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (inputRef.current && !inputRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Throttled map viewport update for performance
  const throttledUpdateAvailability = useCallback(
    throttle(() => {
      refreshAvailability();
    }, 400),
    []
  );

  // Handle offline mode with cached results
  useEffect(() => {
    if (mockOfflineMode && cachedResults.length === 0) {
      setCachedResults([...filteredSpots]);
      setLastOnlineUpdate(new Date());
    }
  }, [mockOfflineMode, filteredSpots]);

  // Filter parking spots based on current viewport
  const baseSpots = mockOfflineMode && cachedResults.length > 0 ? cachedResults : filteredSpots;
  const visibleParkingSpots = baseSpots.filter(spot => {
    const latRange = 0.05; // Approximate viewport range
    const lngRange = 0.05;
    return (
      spot.lat >= mapViewport.center.lat - latRange &&
      spot.lat <= mapViewport.center.lat + latRange &&
      spot.lng >= mapViewport.center.lng - lngRange &&
      spot.lng <= mapViewport.center.lng + lngRange
    );
  });

  // Check for empty results state
  const hasNoResults = visibleParkingSpots.length === 0;
  const hasActiveFilters = getActiveFilterCount() > 0;

  // Memoized map pins for performance
  const mapPins = useMemo(() => {
    if (!shouldCluster) return visibleParkingSpots.map(spot => ({ type: "spot" as const, spot }));
    
    const clustered: Array<{type: "cluster" | "spot", count?: number, lat?: number, lng?: number, spot?: any}> = [];
    const processed = new Set<string>();
    
    visibleParkingSpots.forEach(spot => {
      if (processed.has(spot.id)) return;
      
      const nearby = visibleParkingSpots.filter(otherSpot => {
        if (processed.has(otherSpot.id) || otherSpot.id === spot.id) return false;
        const distance = Math.sqrt(
          Math.pow((spot.lat - otherSpot.lat) * 111000, 2) + 
          Math.pow((spot.lng - otherSpot.lng) * 111000 * Math.cos(spot.lat * Math.PI / 180), 2)
        );
        return distance < clusterDistance;
      });
      
      if (nearby.length > 0) {
        // Convert Set to Array for iteration
        [...nearby].forEach(s => processed.add(s.id));
        processed.add(spot.id);
        const allSpots = [spot, ...nearby];
        const avgLat = allSpots.reduce((sum, s) => sum + s.lat, 0) / allSpots.length;
        const avgLng = allSpots.reduce((sum, s) => sum + s.lng, 0) / allSpots.length;
        clustered.push({ type: "cluster", count: allSpots.length, lat: avgLat, lng: avgLng });
      } else {
        processed.add(spot.id);
        clustered.push({ type: "spot", spot });
      }
    });
    
    return clustered;
  }, [visibleParkingSpots, shouldCluster, clusterDistance]);

  // Lazy loading for parking cards
  useEffect(() => {
    if (!listRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && entry.target.getAttribute('data-lazy-trigger')) {
            setVisibleCardRange(prev => ({ 
              ...prev, 
              end: Math.min(prev.end + 5, visibleParkingSpots.length) 
            }));
          }
        });
      },
      { threshold: 0.1 }
    );

    cardObserver.current = observer;

    // Observe the last few cards
    const cards = listRef.current.querySelectorAll('[data-card-index]');
    const triggerIndex = Math.max(0, cards.length - 3);
    if (cards[triggerIndex]) {
      cards[triggerIndex].setAttribute('data-lazy-trigger', 'true');
      observer.observe(cards[triggerIndex]);
    }

    return () => observer.disconnect();
  }, [visibleParkingSpots.length, visibleCardRange.end]);

  // Mock API call to refresh availability
  const refreshAvailability = useCallback(async () => {
    setIsRefreshing(true);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    setParkingSpots(prevSpots => {
      const updatedSpots = prevSpots.map(spot => {
        // Randomly change availability for some spots (20% chance)
        if (Math.random() < 0.2) {
          const wasState = spot.state;
          const rand = Math.random();
          let newState: "available" | "booked" | "temporarily-unavailable";
          let newAvailable: boolean;
          let newSpotsLeft: number;
          
          if (rand < 0.6) {
            newState = "available";
            newAvailable = true;
            newSpotsLeft = Math.floor(Math.random() * 50) + 1;
          } else if (rand < 0.8) {
            newState = "booked";
            newAvailable = false;
            newSpotsLeft = 0;
          } else {
            newState = "temporarily-unavailable";
            newAvailable = false;
            newSpotsLeft = Math.floor(Math.random() * 20) + 1; // Spots exist but unavailable
          }
          
          // Track changed pins for animation
          if (wasState !== newState) {
            setChangedPins(prev => new Set([...prev, spot.id]));
            // Clear animation after 2 seconds
            setTimeout(() => {
              setChangedPins(prev => {
                const newSet = new Set(prev);
                newSet.delete(spot.id);
                return newSet;
              });
            }, 2000);
          }
          
          return {
            ...spot,
            state: newState,
            available: newAvailable,
            spotsLeft: newSpotsLeft
          };
        }
        
        // Minor changes to spots left for available spots (50% chance)
        if (spot.state === "available" && Math.random() < 0.5) {
          const change = Math.floor(Math.random() * 6) - 3; // -3 to +3
          const newSpotsLeft = Math.max(1, spot.spotsLeft + change); // Keep at least 1 for available spots
          return {
            ...spot,
            spotsLeft: newSpotsLeft
          };
        }
        
        return spot;
      });
      
      return updatedSpots;
    });
    
    setLastUpdateTime(new Date());
    setIsRefreshing(false);
  }, []);

  // Format time since last update
  const getTimeSinceUpdate = () => {
    const now = new Date();
    const diff = Math.floor((now.getTime() - lastUpdateTime.getTime()) / 1000);
    
    if (diff < 60) {
      return `0:${diff.toString().padStart(2, '0')}`;
    } else {
      const minutes = Math.floor(diff / 60);
      const seconds = diff % 60;
      return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    }
  };

  // Auto-refresh every 15 seconds
  useEffect(() => {
    const interval = setInterval(refreshAvailability, 15000);
    return () => clearInterval(interval);
  }, [refreshAvailability]);

  // Handle page visibility change (when user returns after 1+ min)
  useEffect(() => {
    let lastVisibleTime = Date.now();
    
    const handleVisibilityChange = () => {
      if (document.hidden) {
        lastVisibleTime = Date.now();
      } else {
        const timeAway = Date.now() - lastVisibleTime;
        // If user was away for more than 1 minute, refresh immediately
        if (timeAway > 60000) {
          refreshAvailability();
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [refreshAvailability]);

  // Update ticker every second
  const [tickerTime, setTickerTime] = useState(getTimeSinceUpdate());
  useEffect(() => {
    const ticker = setInterval(() => {
      setTickerTime(getTimeSinceUpdate());
    }, 1000);
    return () => clearInterval(ticker);
  }, [lastUpdateTime]);

  const handleMapMove = (newCenter: {lat: number, lng: number}, newZoom: number) => {
    setMapViewport({ center: newCenter, zoom: newZoom });
  };

  const handlePinClick = (spotId: string) => {
    setSelectedPinId(spotId);
    // Scroll to corresponding card in list
    const cardElement = document.querySelector(`[data-spot-id="${spotId}"]`);
    if (cardElement) {
      cardElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  const handleCardHover = (spotId: string | null) => {
    setHoveredCardId(spotId);
  };

  const handleCardClick = (spotId: string) => {
    setSelectedPinId(spotId);
    // Center map on selected spot
    const spot = parkingSpots.find(s => s.id === spotId);
    if (spot) {
      setMapViewport(prev => ({
        ...prev,
        center: { lat: spot.lat, lng: spot.lng }
      }));
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Find Parking</h1>
          <div className="bg-white rounded-lg shadow-sm border p-6">
            {/* Location Row */}
            <div className="mb-4">
              <div className="flex items-center gap-3 mb-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleUseCurrentLocation}
                  disabled={isLocating}
                  className="flex items-center gap-2 px-3 py-2"
                  data-testid="button-current-location"
                >
                  {isLocating ? (
                    <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Locate className="w-4 h-4" />
                  )}
                  Use current location
                </Button>
                
                {/* Location Pill */}
                {currentLocation && (
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="px-3 py-1 bg-blue-50 text-blue-700 border-blue-200">
                      <MapPin className="w-3 h-3 mr-1" />
                      {isLocating ? "Locating..." : currentLocation}
                    </Badge>
                    
                    {/* GPS Accuracy Status */}
                    {locationAccuracy && !isLocating && (
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-600">
                          Using GPS (±{Math.round(locationAccuracy)}m)
                        </span>
                        
                        {/* Low Accuracy Warning */}
                        {locationAccuracy > 100 && (
                          <Badge variant="outline" className="px-2 py-0.5 text-xs bg-yellow-50 text-yellow-700 border-yellow-200">
                            <div className="w-2 h-2 bg-yellow-400 rounded-full mr-1" />
                            Low accuracy — try moving near open sky
                          </Badge>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Location Permission Notice */}
              {locationDenied && (
                <div className="mb-3 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                    <div className="flex-1">
                      <p className="text-sm text-amber-800 font-medium">GPS unavailable</p>
                      <p className="text-sm text-amber-700 mt-1">
                        Can't get your location right now. Use the address search below to find parking spots.
                      </p>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="mt-2 h-8 text-xs border-amber-300 hover:bg-amber-100"
                        onClick={() => inputRef.current?.focus()}
                        data-testid="use-address-search-cta"
                      >
                        <SearchIcon className="w-3 h-3 mr-1" />
                        Use address search
                      </Button>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Offline banner */}
              {mockOfflineMode && (
                <div className="mb-3 p-3 bg-gray-50 border border-gray-200 rounded-lg">
                  <div className="flex items-start gap-2">
                    <WifiOff className="w-4 h-4 text-gray-600 mt-0.5 flex-shrink-0" />
                    <div className="flex-1">
                      <p className="text-sm text-gray-800 font-medium">You're offline</p>
                      <p className="text-sm text-gray-600 mt-1">
                        Showing cached results from {lastOnlineUpdate.toLocaleTimeString()}. Some info may be outdated.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              
              {/* Manual Location Input */}
              {!currentLocation && (
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 w-4 h-4 text-gray-400 z-10" />
                  <Input
                    ref={inputRef}
                    id="location"
                    value={searchLocation}
                    onChange={handleSearchInputChange}
                    onKeyDown={handleKeyDown}
                    onFocus={() => {
                      if (suggestions.length > 0) {
                        setShowSuggestions(true);
                      }
                    }}
                    placeholder="Enter address, neighborhood, or landmark"
                    className="pl-10"
                    data-testid="input-search-location"
                    autoComplete="off"
                  />
                  
                  {/* Autocomplete Suggestions */}
                  {showSuggestions && suggestions.length > 0 && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto">
                      {suggestions.map((suggestion, index) => (
                        <button
                          key={suggestion.id}
                          onClick={() => handleSuggestionSelect(suggestion)}
                          className={`w-full text-left px-4 py-3 hover:bg-gray-50 border-b border-gray-100 last:border-b-0 transition-colors ${
                            index === selectedSuggestionIndex ? 'bg-blue-50' : ''
                          }`}
                          data-testid={`suggestion-${suggestion.id}`}
                        >
                          <div className="flex items-center gap-3">
                            <div className="flex-shrink-0">
                              {suggestion.type === 'landmark' && (
                                <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                                  <MapPin className="w-3 h-3 text-blue-600" />
                                </div>
                              )}
                              {suggestion.type === 'neighborhood' && (
                                <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                                  <Home className="w-3 h-3 text-green-600" />
                                </div>
                              )}
                              {suggestion.type === 'address' && (
                                <div className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center">
                                  <MapPin className="w-3 h-3 text-gray-600" />
                                </div>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-900 truncate">
                                {suggestion.text}
                              </p>
                              <p className="text-xs text-gray-500 capitalize">
                                {suggestion.type}
                              </p>
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* GPS Accuracy Visualization */}
              {coordinates && locationAccuracy && !isLocating && (
                <div className="mb-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="relative flex-shrink-0">
                      {/* User Dot */}
                      <div className="w-3 h-3 bg-blue-600 rounded-full relative z-10"></div>
                      
                      {/* Accuracy Ring */}
                      <div 
                        className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 border-2 border-blue-300 rounded-full opacity-50"
                        style={{
                          width: `${Math.min(Math.max(locationAccuracy / 10, 20), 60)}px`,
                          height: `${Math.min(Math.max(locationAccuracy / 10, 20), 60)}px`
                        }}
                      ></div>
                      
                      {/* Additional ring for very high accuracy (small ring) */}
                      {locationAccuracy < 20 && (
                        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-5 h-5 border border-blue-400 rounded-full opacity-30"></div>
                      )}
                    </div>
                    
                    <div className="flex-1">
                      <p className="text-sm text-blue-800 font-medium">
                        GPS Location Active
                      </p>
                      <p className="text-xs text-blue-700">
                        Accuracy: ±{Math.round(locationAccuracy)}m • 
                        {locationAccuracy < 20 ? ' Excellent' : 
                         locationAccuracy < 50 ? ' Good' : 
                         locationAccuracy < 100 ? ' Fair' : ' Poor'} signal
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Search Filters Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
              {/* Date */}
              <div>
                <Label htmlFor="check-in-date" className="text-sm font-medium text-gray-700">Date</Label>
                <div className="relative mt-1">
                  <Calendar className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                  <Input
                    id="check-in-date"
                    type="date"
                    value={checkInDate}
                    onChange={(e) => setCheckInDate(e.target.value)}
                    className="pl-10"
                    data-testid="input-check-in-date"
                  />
                </div>
              </div>

              {/* Start Time */}
              <div>
                <Label htmlFor="check-in-time" className="text-sm font-medium text-gray-700">Start Time</Label>
                <div className="relative mt-1">
                  <Clock className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                  <Input
                    id="check-in-time"
                    type="time"
                    value={checkInTime}
                    onChange={(e) => setCheckInTime(e.target.value)}
                    className="pl-10"
                    data-testid="input-check-in-time"
                  />
                </div>
              </div>

              {/* End Time */}
              <div>
                <Label htmlFor="check-out-time" className="text-sm font-medium text-gray-700">End Time</Label>
                <div className="relative mt-1">
                  <Clock className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                  <Input
                    id="check-out-time"
                    type="time"
                    value={checkOutTime}
                    onChange={(e) => setCheckOutTime(e.target.value)}
                    className="pl-10"
                    data-testid="input-check-out-time"
                  />
                </div>
              </div>

              {/* Vehicle Size */}
              <div>
                <Label htmlFor="vehicle-size" className="text-sm font-medium text-gray-700">Vehicle Size</Label>
                <div className="relative mt-1">
                  <Car className="absolute left-3 top-3 w-4 h-4 text-gray-400 z-10" />
                  <Select value={vehicleSize} onValueChange={setVehicleSize}>
                    <SelectTrigger className="pl-10" data-testid="select-vehicle-size">
                      <SelectValue placeholder="Any size" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="small">Small Car</SelectItem>
                      <SelectItem value="medium">Medium Car</SelectItem>
                      <SelectItem value="large">Large Car</SelectItem>
                      <SelectItem value="suv">SUV</SelectItem>
                      <SelectItem value="truck">Truck</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Search Button */}
            <div className="flex gap-3">
              <Button className="flex-1" data-testid="button-search-parking">
                <SearchIcon className="w-4 h-4 mr-2" />
                Search Parking
              </Button>
              {currentLocation && (
                <Button
                  variant="outline"
                  onClick={() => {
                    setCurrentLocation(null);
                    setSearchLocation("");
                  }}
                  data-testid="button-clear-location"
                >
                  Change Location
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Two-Pane Layout: Map + Results */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[600px]">
          {/* Map Pane */}
          <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
            <div className="h-full relative bg-gray-100 flex items-center justify-center">
              {/* Mock Map Interface */}
              <div 
                className="absolute inset-0 bg-gradient-to-br from-blue-50 to-green-50 transition-transform duration-300"
                onMouseDown={handleMapMouseDown}
                onMouseMove={handleMapMouseMove}
                onMouseUp={handleMapMouseUp}
                style={{
                  transform: `rotate(${mapRotation}deg)`,
                  cursor: isDrawingLasso ? 'crosshair' : 'default'
                }}
              >
                <div className="absolute top-4 left-4 bg-white px-3 py-1 rounded-full shadow-sm text-sm">
                  Zoom: {mapViewport.zoom} | Center: {mapViewport.center.lat.toFixed(4)}, {mapViewport.center.lng.toFixed(4)}
                  {shouldCluster && <span className="ml-2 text-blue-600">• Clustered</span>}
                  {mapRotation !== 0 && <span className="ml-2 text-orange-600">• Rotated {mapRotation}°</span>}
                </div>

                {/* Demo Controls (for testing) */}
                <div className="absolute top-4 right-16 flex flex-col gap-1">
                  <button
                    onClick={handleRotateMap}
                    className="bg-white px-2 py-1 rounded shadow-sm text-xs hover:bg-gray-50"
                    title="Rotate map (demo)"
                  >
                    Rotate
                  </button>
                  <button
                    onClick={() => setMockGpsFailure(!mockGpsFailure)}
                    className={`px-2 py-1 rounded shadow-sm text-xs hover:bg-gray-50 ${
                      mockGpsFailure ? 'bg-red-100 text-red-700' : 'bg-white'
                    }`}
                    title="Test GPS failure"
                    data-testid="mock-gps-failure"
                  >
                    GPS: {mockGpsFailure ? 'OFF' : 'ON'}
                  </button>
                  <button
                    onClick={() => setMockOfflineMode(!mockOfflineMode)}
                    className={`px-2 py-1 rounded shadow-sm text-xs hover:bg-gray-50 ${
                      mockOfflineMode ? 'bg-gray-100 text-gray-700' : 'bg-white'
                    }`}
                    title="Test offline mode"
                    data-testid="mock-offline-mode"
                  >
                    {mockOfflineMode ? 'OFFLINE' : 'ONLINE'}
                  </button>
                </div>
                
                {/* Clustered Map Pins */}
                {clusteredSpots.map((cluster, index) => {
                  const clusterKey = cluster.type === "cluster" ? `cluster-${index}` : cluster.spot!.id;
                  const offsetX = Math.max(10, Math.min(cluster.position.x, 390));
                  const offsetY = Math.max(10, Math.min(cluster.position.y, 280));
                  
                  if (cluster.type === "cluster") {
                    // Cluster marker
                    const availableCount = cluster.spots!.filter(s => s.state === "available").length;
                    const bookedCount = cluster.spots!.filter(s => s.state === "booked").length;
                    const unavailableCount = cluster.spots!.filter(s => s.state === "temporarily-unavailable").length;
                    
                    return (
                      <button
                        key={clusterKey}
                        onClick={() => {
                          // Zoom in to expand cluster
                          setMapViewport(prev => ({
                            center: {
                              lat: cluster.spots!.reduce((sum, s) => sum + s.lat, 0) / cluster.spots!.length,
                              lng: cluster.spots!.reduce((sum, s) => sum + s.lng, 0) / cluster.spots!.length
                            },
                            zoom: Math.min(prev.zoom + 2, 18)
                          }));
                        }}
                        className="absolute bg-blue-600 text-white rounded-full border-2 border-white shadow-lg transition-all duration-300 hover:scale-110 z-10 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none"
                        style={{
                          left: `${offsetX}px`,
                          top: `${offsetY}px`,
                          width: `${Math.max(48, Math.min(56, 32 + cluster.count! * 2))}px`,
                          height: `${Math.max(48, Math.min(56, 32 + cluster.count! * 2))}px`,
                          minWidth: '48px',
                          minHeight: '48px'
                        }}
                        data-testid={`cluster-${index}`}
                        title={`${cluster.count} parking spots (${availableCount} available, ${bookedCount} booked, ${unavailableCount} unavailable)`}
                        aria-label={`Cluster of ${cluster.count} parking spots. ${availableCount} available, ${bookedCount} booked, ${unavailableCount} unavailable. Click to zoom in.`}
                      >
                        <div className="flex flex-col items-center justify-center h-full">
                          <span className="text-sm font-bold">{cluster.count}</span>
                          <div className="flex gap-0.5">
                            {availableCount > 0 && <div className="w-1 h-1 bg-green-300 rounded-full" />}
                            {bookedCount > 0 && <div className="w-1 h-1 bg-red-300 rounded-full" />}
                            {unavailableCount > 0 && <div className="w-1 h-1 bg-gray-300 rounded-full" />}
                          </div>
                        </div>
                      </button>
                    );
                  } else {
                    // Individual pin
                    const spot = cluster.spot!;
                    const isSelected = selectedPinId === spot.id;
                    const isHovered = hoveredCardId === spot.id;
                    const hasChanged = changedPins.has(spot.id);
                    
                    // Pin styling based on state with minimum 48px touch target
                    let pinClass = "absolute w-12 h-12 rounded-full border-2 border-white shadow-lg transition-all duration-300 cursor-pointer focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none flex items-center justify-center";
                    
                    if (isSelected) {
                      pinClass += " bg-red-500 scale-125 z-20";
                    } else if (isHovered) {
                      pinClass += " bg-yellow-500 scale-110 z-10";
                    } else if (hasChanged) {
                      pinClass += " bg-green-500 scale-125 z-15 animate-pulse";
                    } else {
                      switch (spot.state) {
                        case "available":
                          pinClass += " bg-blue-500 hover:scale-110 z-0"; // Solid pin
                          break;
                        case "booked":
                          pinClass += " bg-transparent border-red-500 border-4 hover:scale-110 z-0"; // Hollow pin
                          break;
                        case "temporarily-unavailable":
                          pinClass += " bg-gray-400 opacity-50 hover:scale-110 z-0"; // Dimmed pin
                          break;
                      }
                    }
                    
                    return (
                      <button
                        key={clusterKey}
                        onClick={() => handlePinClick(spot.id)}
                        className={pinClass}
                        style={{
                          left: `${offsetX - 24}px`, // Offset for larger touch target
                          top: `${offsetY - 24}px`,
                          minWidth: '48px',
                          minHeight: '48px'
                        }}
                        data-testid={`pin-${spot.id}`}
                        title={`${spot.name} - ${
                          spot.state === "available" ? `${spot.spotsLeft} spots available` :
                          spot.state === "booked" ? "Fully booked" :
                          "Temporarily unavailable"
                        }`}
                        aria-label={`${spot.name} parking spot. ${
                          spot.state === "available" ? `${spot.spotsLeft} spots available, $${spot.priceValue}/hour` :
                          spot.state === "booked" ? "Fully booked" :
                          "Temporarily unavailable"
                        }. Click for details.`}
                      >
                        {/* Visual pin indicator */}
                        <div className="w-6 h-6 rounded-full border-2 border-white shadow-lg">
                          {/* Inner dot for hollow pins */}
                          {spot.state === "booked" && (
                            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-2 h-2 bg-red-500 rounded-full" />
                          )}
                        </div>
                        <span className="sr-only">{spot.name}</span>
                      </button>
                    );
                  }
                })}
                
                {/* Map Controls */}
                <div className="absolute bottom-4 right-4 flex flex-col gap-2">
                  <button 
                    onClick={() => setShowLegend(!showLegend)}
                    className="w-12 h-12 bg-white rounded shadow-sm flex items-center justify-center hover:bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none border border-gray-200"
                    data-testid="legend-toggle"
                    aria-label={showLegend ? "Hide legend" : "Show legend"}
                    title={showLegend ? "Hide legend" : "Show legend"}
                  >
                    <Info className="w-4 h-4 text-gray-700" />
                  </button>
                  <button 
                    onClick={() => {
                      setMapViewport(prev => ({ ...prev, zoom: Math.min(prev.zoom + 1, 18) }));
                      throttledUpdateAvailability();
                    }}
                    className="w-12 h-12 bg-white rounded shadow-sm flex items-center justify-center text-lg font-bold hover:bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none border border-gray-200 text-gray-700"
                    data-testid="zoom-in"
                    aria-label="Zoom in"
                    title="Zoom in"
                  >
                    <Plus className="w-5 h-5" />
                  </button>
                  <button 
                    onClick={() => {
                      setMapViewport(prev => ({ ...prev, zoom: Math.max(prev.zoom - 1, 8) }));
                      throttledUpdateAvailability();
                    }}
                    className="w-12 h-12 bg-white rounded shadow-sm flex items-center justify-center text-lg font-bold hover:bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none border border-gray-200 text-gray-700"
                    data-testid="zoom-out"
                    aria-label="Zoom out"
                    title="Zoom out"
                  >
                    <Minus className="w-5 h-5" />
                  </button>
                </div>

                {/* Legend */}
                {showLegend && (
                  <div className="absolute bottom-4 left-4 bg-white rounded-lg shadow-lg border p-4 min-w-48" data-testid="map-legend" role="dialog" aria-label="Parking spot legend">
                    <h4 className="font-semibold text-gray-900 mb-3 text-sm">Parking Spot States</h4>
                    <div className="space-y-2">
                      <div className="flex items-center gap-3">
                        <div className="w-4 h-4 bg-blue-500 rounded-full border border-white shadow-sm" />
                        <span className="text-sm text-gray-800 font-medium">Available</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-4 h-4 bg-transparent border-red-500 border-2 rounded-full shadow-sm relative">
                          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-1.5 h-1.5 bg-red-500 rounded-full" />
                        </div>
                        <span className="text-sm text-gray-800 font-medium">Booked</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-4 h-4 bg-gray-500 opacity-70 rounded-full border border-white shadow-sm" />
                        <span className="text-sm text-gray-800 font-medium">Temporarily unavailable</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-4 h-4 bg-red-500 rounded-full border border-white shadow-sm" />
                        <span className="text-sm text-gray-800 font-medium">Selected</span>
                      </div>
                      {shouldCluster && (
                        <div className="flex items-center gap-3 pt-2 border-t border-gray-200">
                          <div className="w-6 h-6 bg-blue-600 text-white rounded-full border border-white shadow-sm flex items-center justify-center text-xs font-bold">
                            3
                          </div>
                          <span className="text-sm text-gray-800 font-medium">Cluster (zoom to expand)</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
                
                {/* Pan controls for demo */}
                <div className="absolute top-1/2 left-4 transform -translate-y-1/2 flex flex-col gap-1">
                  <button 
                    onClick={() => handleMapMove({ ...mapViewport.center, lat: mapViewport.center.lat + 0.01 }, mapViewport.zoom)}
                    className="w-6 h-6 bg-white rounded shadow-sm flex items-center justify-center text-xs hover:bg-gray-50"
                  >
                    ↑
                  </button>
                  <button 
                    onClick={() => handleMapMove({ ...mapViewport.center, lat: mapViewport.center.lat - 0.01 }, mapViewport.zoom)}
                    className="w-6 h-6 bg-white rounded shadow-sm flex items-center justify-center text-xs hover:bg-gray-50"
                  >
                    ↓
                  </button>
                </div>

                {/* Floating Action Buttons */}
                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-3">
                  {/* Recenter FAB */}
                  {isMapOffCenter && (
                    <button
                      onClick={handleRecenter}
                      className="bg-blue-600 text-white p-3 rounded-full shadow-lg hover:bg-blue-700 transition-all duration-300 hover:scale-105"
                      data-testid="recenter-fab"
                      title={currentLocation ? "Recenter on your location" : "Recenter on searched location"}
                    >
                      <Target className="w-5 h-5" />
                    </button>
                  )}

                  {/* Compass Badge */}
                  {mapRotation !== 0 && (
                    <button
                      onClick={handleResetRotation}
                      className="bg-white text-gray-700 p-3 rounded-full shadow-lg hover:bg-gray-50 transition-all duration-300 border border-gray-200"
                      data-testid="compass-badge"
                      title={`Reset orientation (currently ${mapRotation}°)`}
                    >
                      <div 
                        className="transition-transform duration-300"
                        style={{ transform: `rotate(${-mapRotation}deg)` }}
                      >
                        <Navigation className="w-5 h-5" />
                      </div>
                    </button>
                  )}
                </div>

                {/* Search This Area Button */}
                {hasMapMoved && !searchPolygon && (
                  <div className="absolute top-4 left-1/2 transform -translate-x-1/2">
                    <button
                      onClick={handleSearchThisArea}
                      className="bg-blue-600 text-white px-4 py-2 rounded-full shadow-lg hover:bg-blue-700 transition-all duration-300 flex items-center gap-2 text-sm font-medium"
                      data-testid="search-this-area"
                    >
                      <Move className="w-4 h-4" />
                      Search this area
                    </button>
                  </div>
                )}

                {/* Lasso Drawing Tools */}
                <div className="absolute top-4 right-4 flex flex-col gap-2">
                  {!searchPolygon && !isDrawingLasso && (
                    <button
                      onClick={startLasso}
                      className="bg-white text-gray-700 p-2 rounded shadow-sm hover:bg-gray-50 transition-all duration-300"
                      data-testid="start-lasso"
                      title="Draw custom search area"
                    >
                      <Lasso className="w-4 h-4" />
                    </button>
                  )}
                  
                  {searchPolygon && (
                    <button
                      onClick={clearLasso}
                      className="bg-red-500 text-white p-2 rounded shadow-sm hover:bg-red-600 transition-all duration-300"
                      data-testid="clear-lasso"
                      title="Clear custom area"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>

                {/* Lasso Drawing Overlay */}
                {(isDrawingLasso || searchPolygon) && (
                  <svg className="absolute inset-0 pointer-events-none" style={{ zIndex: 15 }}>
                    {/* Current drawing path */}
                    {isDrawingLasso && lassoPoints.length > 1 && (
                      <polyline
                        points={lassoPoints.map(p => `${p.x},${p.y}`).join(' ')}
                        fill="none"
                        stroke="rgba(59, 130, 246, 0.8)"
                        strokeWidth="2"
                        strokeDasharray="5,5"
                      />
                    )}
                    
                    {/* Completed polygon */}
                    {searchPolygon && (
                      <polygon
                        points={searchPolygon.map(p => `${p.x},${p.y}`).join(' ')}
                        fill="rgba(59, 130, 246, 0.1)"
                        stroke="rgba(59, 130, 246, 0.8)"
                        strokeWidth="2"
                      />
                    )}
                  </svg>
                )}

                {/* Drawing Instructions */}
                {isDrawingLasso && (
                  <div className="absolute top-16 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-75 text-white px-3 py-2 rounded text-sm">
                    Draw to create search area
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Results List Pane */}
          <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
            {/* Filter Chips */}
            <div className="p-4 border-b bg-gray-50">
              <div className="space-y-3">
                {/* Sort and Filter Summary */}
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium text-gray-900">
                      Parking in View ({visibleParkingSpots.length} spots)
                    </h3>
                    <div className="flex items-center gap-2 mt-1">
                      <p className="text-sm text-gray-600">
                        Sorted by {sortBy === 'distance' ? 'Nearest' : 'Price'}
                      </p>
                      {getActiveFilterCount() > 0 && (
                        <Badge variant="secondary" className="text-xs">
                          {getFilterSummary()}
                        </Badge>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSortBy(sortBy === 'distance' ? 'price' : 'distance')}
                      className="text-xs"
                      data-testid="toggle-sort"
                    >
                      Sort: {sortBy === 'distance' ? 'Nearest' : 'Price'}
                    </Button>
                    {getActiveFilterCount() > 0 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={clearAllFilters}
                        className="text-xs text-red-600 hover:text-red-700"
                        data-testid="clear-filters"
                      >
                        Clear all
                      </Button>
                    )}
                  </div>
                </div>

                {/* Filter Chips Row */}
                <div className="flex flex-wrap gap-2">
                  {/* Price Filter */}
                  <div className="flex gap-1">
                    <Badge
                      variant={activeFilters.maxPrice === 10 ? "default" : "outline"}
                      className="cursor-pointer hover:bg-blue-100 text-xs"
                      onClick={() => toggleFilter('maxPrice', 10)}
                      data-testid="filter-price-10"
                    >
                      <DollarSign className="w-3 h-3 mr-1" />
                      Under $10
                    </Badge>
                    <Badge
                      variant={activeFilters.maxPrice === 15 ? "default" : "outline"}
                      className="cursor-pointer hover:bg-blue-100 text-xs"
                      onClick={() => toggleFilter('maxPrice', 15)}
                      data-testid="filter-price-15"
                    >
                      <DollarSign className="w-3 h-3 mr-1" />
                      Under $15
                    </Badge>
                  </div>

                  {/* Distance Filter */}
                  <div className="flex gap-1">
                    <Badge
                      variant={activeFilters.maxDistance === 1 ? "default" : "outline"}
                      className="cursor-pointer hover:bg-blue-100 text-xs"
                      onClick={() => toggleFilter('maxDistance', 1)}
                      data-testid="filter-distance-1"
                    >
                      <MapPin className="w-3 h-3 mr-1" />
                      Under 1mi
                    </Badge>
                    <Badge
                      variant={activeFilters.maxDistance === 2 ? "default" : "outline"}
                      className="cursor-pointer hover:bg-blue-100 text-xs"
                      onClick={() => toggleFilter('maxDistance', 2)}
                      data-testid="filter-distance-2"
                    >
                      <MapPin className="w-3 h-3 mr-1" />
                      Under 2mi
                    </Badge>
                  </div>

                  {/* Feature Filters */}
                  <Badge
                    variant={activeFilters.evCharging ? "default" : "outline"}
                    className="cursor-pointer hover:bg-blue-100 text-xs"
                    onClick={() => toggleFilter('evCharging')}
                    data-testid="filter-ev"
                  >
                    <EvIcon className="w-3 h-3 mr-1" />
                    EV Charging
                  </Badge>

                  <Badge
                    variant={activeFilters.covered ? "default" : "outline"}
                    className="cursor-pointer hover:bg-blue-100 text-xs"
                    onClick={() => toggleFilter('covered')}
                    data-testid="filter-covered"
                  >
                    <Home className="w-3 h-3 mr-1" />
                    Covered
                  </Badge>

                  <Badge
                    variant={activeFilters.security ? "default" : "outline"}
                    className="cursor-pointer hover:bg-blue-100 text-xs"
                    onClick={() => toggleFilter('security')}
                    data-testid="filter-security"
                  >
                    <ShieldCheck className="w-3 h-3 mr-1" />
                    Security
                  </Badge>

                  {/* Height Limit Filter */}
                  <div className="flex gap-1">
                    <Badge
                      variant={activeFilters.heightLimit === 7 ? "default" : "outline"}
                      className="cursor-pointer hover:bg-blue-100 text-xs"
                      onClick={() => toggleFilter('heightLimit', 7)}
                      data-testid="filter-height-7"
                    >
                      <Ruler className="w-3 h-3 mr-1" />
                      7ft+ High
                    </Badge>
                    <Badge
                      variant={activeFilters.heightLimit === 8 ? "default" : "outline"}
                      className="cursor-pointer hover:bg-blue-100 text-xs"
                      onClick={() => toggleFilter('heightLimit', 8)}
                      data-testid="filter-height-8"
                    >
                      <Ruler className="w-3 h-3 mr-1" />
                      8ft+ High
                    </Badge>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-4 border-b bg-gray-50">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mt-1">
                    Move the map to see different results
                  </p>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    {isRefreshing ? (
                      <>
                        <div className="w-3 h-3 border border-blue-500 border-t-transparent rounded-full animate-spin" />
                        <span>Updating...</span>
                      </>
                    ) : (
                      <>
                        <div className="w-2 h-2 bg-green-500 rounded-full" />
                        <span>Updated {tickerTime} ago</span>
                      </>
                    )}
                  </div>
                  <button
                    onClick={refreshAvailability}
                    disabled={isRefreshing}
                    className="text-xs text-blue-600 hover:text-blue-800 mt-1 disabled:opacity-50"
                    data-testid="button-refresh-now"
                  >
                    Refresh now
                  </button>
                </div>
              </div>
            </div>
            
            <div ref={listRef} className="overflow-y-auto h-full pb-4">
              {hasNoResults ? (
                <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                    <MapPin className="w-8 h-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    {hasActiveFilters ? 'No spots match your filters' : 'No parking spots in this area'}
                  </h3>
                  <p className="text-sm text-gray-600 mb-6 max-w-sm">
                    {hasActiveFilters 
                      ? 'Try removing some filters or expanding your search area'
                      : 'Try zooming out to see more areas or adjusting your time window'
                    }
                  </p>
                  
                  <div className="flex flex-col sm:flex-row gap-3">
                    {hasActiveFilters ? (
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={clearAllFilters}
                        data-testid="clear-filters-empty-state"
                      >
                        <X className="w-4 h-4 mr-2" />
                        Clear all filters
                      </Button>
                    ) : (
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => setMapViewport(prev => ({ ...prev, zoom: Math.max(prev.zoom - 1, 8) }))}
                        data-testid="zoom-out-empty-state"
                      >
                        <ZoomOut className="w-4 h-4 mr-2" />
                        Zoom out
                      </Button>
                    )}
                    
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => {
                        // Mock: expand time window
                        toast({
                          title: "Time window expanded",
                          description: "Now showing spots for a wider time range",
                        });
                      }}
                      data-testid="expand-time-window"
                    >
                      <Clock3 className="w-4 h-4 mr-2" />
                      Wider time window
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4 p-4">
                  {visibleParkingSpots.slice(0, visibleCardRange.end).map((spot, index) => (
                    <Card 
                      key={spot.id} 
                      data-spot-id={spot.id}
                      data-card-index={index}
                      className={`cursor-pointer transition-all duration-200 ${
                        selectedPinId === spot.id ? 'ring-2 ring-blue-500 bg-blue-50' : 
                        hoveredCardId === spot.id ? 'shadow-md' : 'hover:shadow-md'
                      }`}
                      onMouseEnter={() => handleCardHover(spot.id)}
                      onMouseLeave={() => handleCardHover(null)}
                      onClick={() => handleCardClick(spot.id)}
                      data-testid={`card-${spot.id}`}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <Link href={`/listing/${spot.id}`}>
                              <h4 className="text-lg font-medium text-blue-600 hover:text-blue-800 mb-1">
                                {spot.name}
                              </h4>
                            </Link>
                            <p className="text-gray-600 text-sm mb-2">{spot.address}</p>
                            <div className="space-y-2">
                              <div className="flex items-center gap-3">
                                <p className="text-green-600 font-medium">{spot.price}</p>
                                <span className="text-gray-400">•</span>
                                <span className="text-sm text-gray-600">{spot.distance}mi away</span>
                                <div className="flex items-center gap-1">
                                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                                  <span className="text-sm text-gray-600">{spot.rating}</span>
                                </div>
                                <div className={`flex items-center gap-1 text-xs px-2 py-1 rounded-full ${
                                  spot.state === "available" ? 
                                    spot.spotsLeft <= 3 ? 'bg-orange-100 text-orange-700' : 'bg-green-100 text-green-700'
                                    : spot.state === "booked" ? 'bg-red-100 text-red-700'
                                    : 'bg-gray-100 text-gray-700'
                                }`}>
                                  <div className={`w-1.5 h-1.5 rounded-full ${
                                    spot.state === "available" ? 
                                      spot.spotsLeft <= 3 ? 'bg-orange-500' : 'bg-green-500'
                                      : spot.state === "booked" ? 'bg-red-500'
                                      : 'bg-gray-500'
                                  }`} />
                                  {spot.state === "available" ? `${spot.spotsLeft} left` :
                                   spot.state === "booked" ? 'Booked' :
                                   'Temp. unavailable'}
                                </div>
                              </div>
                              
                              {/* Feature Badges */}
                              <div className="flex flex-wrap gap-1">
                                {spot.evCharging && (
                                  <Badge variant="secondary" className="text-xs">
                                    <EvIcon className="w-3 h-3 mr-1" />
                                    EV
                                  </Badge>
                                )}
                                {spot.covered && (
                                  <Badge variant="secondary" className="text-xs">
                                    <Home className="w-3 h-3 mr-1" />
                                    Covered
                                  </Badge>
                                )}
                                {spot.security && (
                                  <Badge variant="secondary" className="text-xs">
                                    <ShieldCheck className="w-3 h-3 mr-1" />
                                    Security
                                  </Badge>
                                )}
                                <Badge variant="outline" className="text-xs">
                                  <Ruler className="w-3 h-3 mr-1" />
                                  {spot.heightLimit}ft
                                </Badge>
                              </div>
                            </div>
                          </div>
                          {selectedPinId === spot.id && (
                            <div className="flex items-center gap-1 text-blue-600 text-xs">
                              <MapPin className="w-3 h-3" />
                              Selected
                            </div>
                          )}
                        </div>
                        
                        <div className="flex gap-2 items-center">
                          <Button variant="outline" size="sm" className="h-9" data-testid={`button-view-details-${spot.id}`}>
                            <Link href={`/listing/${spot.id}`}>View Details</Link>
                          </Button>
                          <Button 
                            size="sm" 
                            className="h-9" 
                            disabled={spot.state !== "available"}
                            onClick={(e) => {
                              e.stopPropagation();
                              openAuthSheet("signin");
                            }} 
                            data-testid={`button-book-now-${spot.id}`}
                          >
                            {spot.state === "available" ? 'Book Now' : 
                             spot.state === "booked" ? 'Booked' : 
                             'Unavailable'}
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Auth Sheet */}
      <AuthSheet
        isOpen={isAuthOpen}
        onClose={closeAuthSheet}
        mode={authMode}
        onModeChange={toggleAuthMode}
      />

      {/* Privacy Consent Dialog */}
      <Dialog open={showPrivacyConsent} onOpenChange={setShowPrivacyConsent}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <MapPin className="w-5 h-5 text-blue-600" />
              Allow location access?
            </DialogTitle>
            <DialogDescription className="text-left space-y-3 pt-2">
              <p className="text-gray-700">
                Location is used to show nearby parking and is not shared without a booking.
              </p>
              <p className="text-sm text-gray-600">
                You can change this setting anytime in your{" "}
                <Link 
                  href="/profile/privacy" 
                  className="text-blue-600 underline hover:text-blue-700"
                  onClick={() => setShowPrivacyConsent(false)}
                >
                  Profile → Privacy
                </Link>
                {" "}settings.
              </p>
              <p className="text-xs text-gray-500">
                <button 
                  className="text-blue-600 underline hover:text-blue-700"
                  onClick={() => {
                    // Mock privacy policy link
                    toast({
                      title: "Privacy Policy",
                      description: "Privacy policy will open in a new tab.",
                    });
                  }}
                >
                  View Privacy Policy
                </button>
              </p>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button 
              variant="outline" 
              onClick={handleDeclinePrivacyConsent}
              className="w-full sm:w-auto"
              data-testid="decline-location-consent"
            >
              Not now
            </Button>
            <Button 
              onClick={handleAcceptPrivacyConsent}
              className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700"
              data-testid="accept-location-consent"
            >
              Allow location
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}