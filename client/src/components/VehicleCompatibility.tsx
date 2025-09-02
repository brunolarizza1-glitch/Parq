import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Car, Truck, Zap, AlertTriangle, CheckCircle2, Plus } from "lucide-react";
import type { Vehicle } from "@shared/schema";

interface VehicleCompatibilityProps {
  userId: string;
  onVehicleSelect?: (vehicle: Vehicle) => void;
}

interface CompatibilityCheck {
  isCompatible: boolean;
  issues: string[];
  warnings: string[];
}

export function VehicleCompatibility({ userId, onVehicleSelect }: VehicleCompatibilityProps) {
  const [isAddingVehicle, setIsAddingVehicle] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState<string>("");
  const [newVehicle, setNewVehicle] = useState({
    make: "",
    model: "",
    year: new Date().getFullYear(),
    vehicleType: "sedan",
    length: 16.0, // feet
    width: 6.0,   // feet
    height: 5.5,  // feet
    isElectric: false,
  });

  // Mock vehicle data for demo
  const { data: vehicles = [] } = useQuery<Vehicle[]>({
    queryKey: [`/api/vehicles/user/${userId}`],
    queryFn: () => {
      // Mock data matching the actual schema types
      return Promise.resolve([
        {
          id: "1",
          userId,
          make: "Tesla",
          model: "Model 3",
          year: 2023,
          vehicleType: "sedan",
          length: "15.1", // string to match schema
          width: "6.1",   // string to match schema
          height: "4.9",  // string to match schema
          isElectric: true,
          isDefault: true,
          createdAt: new Date(),
        },
        {
          id: "2", 
          userId,
          make: "Toyota",
          model: "Prius",
          year: 2022,
          vehicleType: "sedan",
          length: "14.9", // string to match schema
          width: "5.8",   // string to match schema
          height: "4.9",  // string to match schema
          isElectric: false,
          isDefault: false,
          createdAt: new Date(),
        },
      ] as Vehicle[]);
    },
  });

  const defaultVehicle = vehicles.find(v => v.isDefault) || vehicles[0];

  // Mock compatibility check for a parking space
  const checkCompatibility = (vehicle: Vehicle): CompatibilityCheck => {
    const issues: string[] = [];
    const warnings: string[] = [];

    // Sample parking space constraints (would come from actual space data)
    const spaceConstraints = {
      maxLength: 18.0,
      maxWidth: 7.0,
      maxHeight: 6.5,
      hasEvCharging: true,
      allowsTrucks: false,
    };

    // Check size compatibility - convert strings to numbers with validation
    const vehicleLength = vehicle.length ? parseFloat(vehicle.length) : 0;
    const vehicleWidth = vehicle.width ? parseFloat(vehicle.width) : 0;
    const vehicleHeight = vehicle.height ? parseFloat(vehicle.height) : 0;

    // Validate that the parsed values are valid numbers
    if (isNaN(vehicleLength) || isNaN(vehicleWidth) || isNaN(vehicleHeight)) {
      issues.push("Vehicle dimensions are invalid. Please update your vehicle information.");
      return { isCompatible: false, issues, warnings };
    }

    if (vehicleLength > spaceConstraints.maxLength) {
      issues.push(`Vehicle too long: ${vehicle.length}' (max: ${spaceConstraints.maxLength}')`);
    }
    if (vehicleWidth > spaceConstraints.maxWidth) {
      issues.push(`Vehicle too wide: ${vehicle.width}' (max: ${spaceConstraints.maxWidth}')`);
    }
    if (vehicleHeight > spaceConstraints.maxHeight) {
      issues.push(`Vehicle too tall: ${vehicle.height}' (max: ${spaceConstraints.maxHeight}')`);
    }

    // Check vehicle type restrictions
    if (vehicle.vehicleType === "truck" && !spaceConstraints.allowsTrucks) {
      issues.push("Trucks not permitted in this space");
    }

    // EV compatibility
    if (vehicle.isElectric && !spaceConstraints.hasEvCharging) {
      warnings.push("No EV charging available at this location");
    }

    return {
      isCompatible: issues.length === 0,
      issues,
      warnings,
    };
  };

  const getVehicleIcon = (type: string) => {
    switch (type) {
      case "truck":
      case "suv":
        return <Truck className="h-5 w-5" />;
      default:
        return <Car className="h-5 w-5" />;
    }
  };

  const getVehicleTypeColor = (type: string) => {
    switch (type) {
      case "truck": return "bg-orange-100 text-orange-800";
      case "suv": return "bg-blue-100 text-blue-800";
      case "sedan": return "bg-green-100 text-green-800";
      case "motorcycle": return "bg-purple-100 text-purple-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const compatibility = defaultVehicle ? checkCompatibility(defaultVehicle) : null;

  return (
    <Card data-testid="vehicle-compatibility-card" className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Car className="h-5 w-5 text-blue-600" />
          Vehicle Compatibility
        </CardTitle>
        <CardDescription>
          Make sure your vehicle fits this parking space
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Current Vehicle Selection */}
        {vehicles.length > 0 && (
          <div>
            <Label htmlFor="vehicle-select">Select Vehicle</Label>
            <Select value={selectedVehicle || defaultVehicle?.id} onValueChange={setSelectedVehicle}>
              <SelectTrigger data-testid="vehicle-select">
                <SelectValue placeholder="Choose your vehicle" />
              </SelectTrigger>
              <SelectContent>
                {vehicles.map((vehicle) => (
                  <SelectItem key={vehicle.id} value={vehicle.id}>
                    <div className="flex items-center gap-2">
                      {getVehicleIcon(vehicle.vehicleType)}
                      <span>{vehicle.year} {vehicle.make} {vehicle.model}</span>
                      {vehicle.isElectric && <Zap className="h-3 w-3 text-green-500" />}
                      {vehicle.isDefault && <Badge className="text-xs">Default</Badge>}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Current Vehicle Details */}
        {defaultVehicle && (
          <div className="p-4 border rounded-lg">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                {getVehicleIcon(defaultVehicle.vehicleType)}
                <span className="font-semibold">
                  {defaultVehicle.year} {defaultVehicle.make} {defaultVehicle.model}
                </span>
                {defaultVehicle.isElectric && <Zap className="h-4 w-4 text-green-500" />}
              </div>
              <Badge className={getVehicleTypeColor(defaultVehicle.vehicleType)}>
                {defaultVehicle.vehicleType}
              </Badge>
            </div>
            
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Length:</span>
                <div className="font-medium">{defaultVehicle.length}' ft</div>
              </div>
              <div>
                <span className="text-gray-600">Width:</span>
                <div className="font-medium">{defaultVehicle.width}' ft</div>
              </div>
              <div>
                <span className="text-gray-600">Height:</span>
                <div className="font-medium">{defaultVehicle.height}' ft</div>
              </div>
            </div>
          </div>
        )}

        {/* Compatibility Check Results */}
        {compatibility && (
          <div className="space-y-3">
            <h4 className="font-semibold">Compatibility Check</h4>
            
            {compatibility.isCompatible ? (
              <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                <CheckCircle2 className="h-5 w-5 text-green-600" />
                <span className="text-green-800 font-medium">Vehicle is compatible!</span>
              </div>
            ) : (
              <div className="space-y-2">
                {compatibility.issues.map((issue, index) => (
                  <div key={index} className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <AlertTriangle className="h-5 w-5 text-red-600" />
                    <span className="text-red-800">{issue}</span>
                  </div>
                ))}
              </div>
            )}

            {compatibility.warnings.map((warning, index) => (
              <div key={index} className="flex items-center gap-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <AlertTriangle className="h-5 w-5 text-yellow-600" />
                <span className="text-yellow-800">{warning}</span>
              </div>
            ))}
          </div>
        )}

        {/* Add Vehicle Form */}
        {!isAddingVehicle ? (
          <Button
            onClick={() => setIsAddingVehicle(true)}
            variant="outline"
            className="w-full"
            data-testid="add-vehicle-button"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Vehicle
          </Button>
        ) : (
          <div className="space-y-4 p-4 border rounded-lg bg-gray-50">
            <h4 className="font-semibold">Add New Vehicle</h4>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="make">Make</Label>
                <Input
                  id="make"
                  value={newVehicle.make}
                  onChange={(e) => setNewVehicle({ ...newVehicle, make: e.target.value })}
                  placeholder="Tesla, Toyota, etc."
                  data-testid="vehicle-make-input"
                />
              </div>
              <div>
                <Label htmlFor="model">Model</Label>
                <Input
                  id="model"
                  value={newVehicle.model}
                  onChange={(e) => setNewVehicle({ ...newVehicle, model: e.target.value })}
                  placeholder="Model 3, Prius, etc."
                  data-testid="vehicle-model-input"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="year">Year</Label>
                <Input
                  id="year"
                  type="number"
                  value={newVehicle.year}
                  onChange={(e) => setNewVehicle({ ...newVehicle, year: parseInt(e.target.value) })}
                  data-testid="vehicle-year-input"
                />
              </div>
              <div>
                <Label htmlFor="vehicle-type">Vehicle Type</Label>
                <Select
                  value={newVehicle.vehicleType}
                  onValueChange={(value) => setNewVehicle({ ...newVehicle, vehicleType: value })}
                >
                  <SelectTrigger data-testid="vehicle-type-select">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sedan">Sedan</SelectItem>
                    <SelectItem value="suv">SUV</SelectItem>
                    <SelectItem value="truck">Truck</SelectItem>
                    <SelectItem value="motorcycle">Motorcycle</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="length">Length (ft)</Label>
                <Input
                  id="length"
                  type="number"
                  step="0.1"
                  value={newVehicle.length}
                  onChange={(e) => setNewVehicle({ ...newVehicle, length: parseFloat(e.target.value) })}
                  data-testid="vehicle-length-input"
                />
              </div>
              <div>
                <Label htmlFor="width">Width (ft)</Label>
                <Input
                  id="width"
                  type="number"
                  step="0.1"
                  value={newVehicle.width}
                  onChange={(e) => setNewVehicle({ ...newVehicle, width: parseFloat(e.target.value) })}
                  data-testid="vehicle-width-input"
                />
              </div>
              <div>
                <Label htmlFor="height">Height (ft)</Label>
                <Input
                  id="height"
                  type="number"
                  step="0.1"
                  value={newVehicle.height}
                  onChange={(e) => setNewVehicle({ ...newVehicle, height: parseFloat(e.target.value) })}
                  data-testid="vehicle-height-input"
                />
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="is-electric"
                checked={newVehicle.isElectric}
                onCheckedChange={(checked) => setNewVehicle({ ...newVehicle, isElectric: checked })}
                data-testid="vehicle-electric-switch"
              />
              <Label htmlFor="is-electric" className="flex items-center gap-2">
                <Zap className="h-4 w-4 text-green-500" />
                Electric Vehicle (needs charging)
              </Label>
            </div>

            <div className="flex gap-2">
              <Button
                onClick={() => {
                  // Would call API to create vehicle
                  setIsAddingVehicle(false);
                }}
                className="flex-1"
                data-testid="save-vehicle-button"
              >
                Save Vehicle
              </Button>
              <Button
                onClick={() => setIsAddingVehicle(false)}
                variant="outline"
                data-testid="cancel-add-vehicle-button"
              >
                Cancel
              </Button>
            </div>
          </div>
        )}

        {/* Compatibility Guidelines */}
        <div className="text-xs text-gray-500 bg-gray-50 p-3 rounded">
          <p className="font-semibold mb-1">Compatibility Guidelines:</p>
          <ul className="space-y-1">
            <li>• Compact spaces: Usually fit sedans up to 16' long</li>
            <li>• Standard spaces: Accommodate most vehicles up to 18' long</li>
            <li>• Height clearances: Typical garages allow up to 6.5' tall vehicles</li>
            <li>• EV charging: Look for ⚡ icon on parking space listings</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}