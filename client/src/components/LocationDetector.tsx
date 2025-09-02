import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { MapPin, Navigation, AlertCircle, Loader2 } from 'lucide-react';
import { useGeolocation } from '@/hooks/useGeolocation';
import { useToast } from '@/hooks/use-toast';

interface LocationDetectorProps {
  onLocationDetected: (lat: number, lng: number, address?: string) => void;
  autoDetect?: boolean;
}

export function LocationDetector({ onLocationDetected, autoDetect = true }: LocationDetectorProps) {
  const { latitude, longitude, accuracy, error, loading, getCurrentPosition, isSupported } = useGeolocation();
  const [detectedAddress, setDetectedAddress] = useState<string>('');
  const { toast } = useToast();

  // Reverse geocoding to get readable address
  const getAddressFromCoords = async (lat: number, lng: number) => {
    try {
      // Using a free geocoding service - in production you'd use Google Maps or similar
      const response = await fetch(
        `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lng}&localityLanguage=en`
      );
      const data = await response.json();
      
      if (data.locality && data.principalSubdivision) {
        return `${data.locality}, ${data.principalSubdivision}`;
      }
      return `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
    } catch (err) {
      return `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
    }
  };

  // Handle successful location detection
  useEffect(() => {
    if (latitude && longitude) {
      getAddressFromCoords(latitude, longitude).then(address => {
        setDetectedAddress(address);
        onLocationDetected(latitude, longitude, address);
        
        // Only show toast if autoDetect is enabled and it's the first time detecting
        if (autoDetect && !detectedAddress) {
          toast({
            title: "Location detected",
            description: `Using your current location: ${address}`,
          });
        }
      });
    }
  }, [latitude, longitude, onLocationDetected, autoDetect, toast, detectedAddress]);

  // Handle location errors
  useEffect(() => {
    if (error && autoDetect) {
      toast({
        title: "Location access needed",
        description: "Please allow location access to find nearby parking spaces",
        variant: "destructive",
      });
    }
  }, [error, autoDetect, toast]);

  if (!isSupported) {
    return (
      <Card className="border-orange-200 bg-orange-50">
        <CardContent className="flex items-center gap-3 p-4">
          <AlertCircle className="h-5 w-5 text-orange-600" />
          <div>
            <p className="font-medium text-orange-800">Location not supported</p>
            <p className="text-sm text-orange-600">Your browser doesn't support location services</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="border-red-200 bg-red-50">
        <CardContent className="p-4">
          <div className="flex items-center gap-3 mb-3">
            <AlertCircle className="h-5 w-5 text-red-600" />
            <div>
              <p className="font-medium text-red-800">Location access needed</p>
              <p className="text-sm text-red-600">{error}</p>
            </div>
          </div>
          <Button
            onClick={getCurrentPosition}
            size="sm"
            className="bg-red-600 hover:bg-red-700"
            data-testid="retry-location-button"
          >
            <Navigation className="h-4 w-4 mr-2" />
            Allow Location Access
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (loading) {
    return (
      <Card className="border-blue-200 bg-blue-50">
        <CardContent className="flex items-center gap-3 p-4">
          <Loader2 className="h-5 w-5 text-blue-600 animate-spin" />
          <div>
            <p className="font-medium text-blue-800">Getting your location...</p>
            <p className="text-sm text-blue-600">This may take a few seconds</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (latitude && longitude) {
    return (
      <Card className="border-green-200 bg-green-50">
        <CardContent className="p-4">
          <div className="flex items-center gap-3 mb-2">
            <MapPin className="h-5 w-5 text-green-600" />
            <div className="flex-1">
              <p className="font-medium text-green-800">Location detected</p>
              <p className="text-sm text-green-600">{detectedAddress}</p>
              {accuracy && (
                <p className="text-xs text-green-500">
                  Accuracy: ~{Math.round(accuracy)}m
                </p>
              )}
            </div>
          </div>
          <Button
            onClick={getCurrentPosition}
            size="sm"
            variant="outline"
            className="border-green-300 text-green-700 hover:bg-green-100"
            data-testid="refresh-location-button"
          >
            <Navigation className="h-4 w-4 mr-2" />
            Update Location
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-gray-200">
      <CardContent className="p-4">
        <div className="text-center">
          <Navigation className="h-8 w-8 text-gray-400 mx-auto mb-3" />
          <p className="font-medium text-gray-700 mb-2">Find nearby parking</p>
          <p className="text-sm text-gray-500 mb-4">
            Allow location access to see parking spaces near you
          </p>
          <Button
            onClick={getCurrentPosition}
            className="w-full"
            data-testid="detect-location-button"
          >
            <MapPin className="h-4 w-4 mr-2" />
            Use My Location
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}