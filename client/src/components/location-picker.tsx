import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useGeolocation, geocodeAddress } from "@/hooks/use-geolocation";
import { useToast } from "@/hooks/use-toast";

interface LocationPickerProps {
  onLocationSelect: (location: { latitude: string; longitude: string; address: string }) => void;
  defaultLatitude?: string;
  defaultLongitude?: string;
  defaultAddress?: string;
}

export default function LocationPicker({ 
  onLocationSelect, 
  defaultLatitude = "", 
  defaultLongitude = "",
  defaultAddress = ""
}: LocationPickerProps) {
  const [address, setAddress] = useState(defaultAddress);
  const [latitude, setLatitude] = useState(defaultLatitude);
  const [longitude, setLongitude] = useState(defaultLongitude);
  const { toast } = useToast();
  const geolocation = useGeolocation();

  const handleUseCurrentLocation = () => {
    geolocation.getCurrentPosition();
    
    if (geolocation.error) {
      toast({
        title: "Location Error",
        description: geolocation.error,
        variant: "destructive",
      });
    }
  };

  // Update coordinates when geolocation is available
  useEffect(() => {
    if (geolocation.latitude && geolocation.longitude) {
      const lat = geolocation.latitude.toString();
      const lng = geolocation.longitude.toString();
      setLatitude(lat);
      setLongitude(lng);
      setAddress("Current Location");
      onLocationSelect({
        latitude: lat,
        longitude: lng,
        address: "Current Location"
      });
      toast({
        title: "Location Found",
        description: "Your current location has been set",
      });
    }
  }, [geolocation.latitude, geolocation.longitude, onLocationSelect, toast]);

  const handleGeocodeAddress = async () => {
    if (!address) return;
    
    const coords = await geocodeAddress(address);
    if (coords) {
      const lat = coords.lat.toString();
      const lng = coords.lng.toString();
      setLatitude(lat);
      setLongitude(lng);
      onLocationSelect({
        latitude: lat,
        longitude: lng,
        address
      });
      toast({
        title: "Address Found",
        description: "Location coordinates have been set",
      });
    } else {
      toast({
        title: "Address Not Found",
        description: "Could not find coordinates for this address",
        variant: "destructive",
      });
    }
  };

  const handleManualCoordinates = () => {
    if (latitude && longitude && address) {
      onLocationSelect({ latitude, longitude, address });
      toast({
        title: "Location Set",
        description: "Manual coordinates have been applied",
      });
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="address">Address</Label>
        <div className="flex space-x-2">
          <Input
            id="address"
            placeholder="Enter full address"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            className="flex-1"
            data-testid="input-location-address"
          />
          <Button
            type="button"
            variant="outline"
            onClick={handleGeocodeAddress}
            disabled={!address}
            data-testid="button-geocode-address"
          >
            <i className="fas fa-search mr-2"></i>
            Find
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="latitude">Latitude</Label>
          <Input
            id="latitude"
            placeholder="37.7749"
            value={latitude}
            onChange={(e) => setLatitude(e.target.value)}
            data-testid="input-location-latitude"
          />
        </div>
        <div>
          <Label htmlFor="longitude">Longitude</Label>
          <Input
            id="longitude"
            placeholder="-122.4194"
            value={longitude}
            onChange={(e) => setLongitude(e.target.value)}
            data-testid="input-location-longitude"
          />
        </div>
      </div>

      <div className="flex space-x-2">
        <Button
          type="button"
          variant="outline"
          onClick={handleUseCurrentLocation}
          disabled={geolocation.loading}
          className="flex-1"
          data-testid="button-use-current-location"
        >
          {geolocation.loading ? (
            <>
              <i className="fas fa-spinner fa-spin mr-2"></i>
              Getting Location...
            </>
          ) : (
            <>
              <i className="fas fa-crosshairs mr-2"></i>
              Use Current Location
            </>
          )}
        </Button>
        
        <Button
          type="button"
          variant="outline"
          onClick={handleManualCoordinates}
          disabled={!latitude || !longitude || !address}
          data-testid="button-set-manual-location"
        >
          <i className="fas fa-check mr-2"></i>
          Set Location
        </Button>
      </div>

      {geolocation.error && (
        <p className="text-sm text-destructive">{geolocation.error}</p>
      )}
    </div>
  );
}