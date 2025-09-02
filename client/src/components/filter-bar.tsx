import { Button } from "@/components/ui/button";
import { useState } from "react";

interface FilterBarProps {
  onFilterChange: (filters: any) => void;
}

export default function FilterBar({ onFilterChange }: FilterBarProps) {
  const [activeFilters, setActiveFilters] = useState<string[]>([]);

  const toggleFilter = (filter: string) => {
    const newFilters = activeFilters.includes(filter)
      ? activeFilters.filter(f => f !== filter)
      : [...activeFilters, filter];
    
    setActiveFilters(newFilters);
    
    // Convert filters to search params
    const filterObj: any = {};
    if (newFilters.includes("security")) {
      filterObj.amenities = ["security"];
    }
    if (newFilters.includes("ev-charging")) {
      filterObj.amenities = [...(filterObj.amenities || []), "ev_charging"];
    }
    
    onFilterChange(filterObj);
  };

  return (
    <section className="bg-background border-b border-border py-4">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4 overflow-x-auto">
            <Button
              variant="outline"
              className="flex items-center space-x-2 whitespace-nowrap"
              data-testid="button-open-filters"
            >
              <i className="fas fa-sliders-h"></i>
              <span>Filters</span>
            </Button>
            
            <Button
              variant={activeFilters.includes("price") ? "default" : "outline"}
              className="whitespace-nowrap"
              onClick={() => toggleFilter("price")}
              data-testid="button-filter-price"
            >
              Price
            </Button>
            
            <Button
              variant={activeFilters.includes("distance") ? "default" : "outline"}
              className="whitespace-nowrap"
              onClick={() => toggleFilter("distance")}
              data-testid="button-filter-distance"
            >
              Distance
            </Button>
            
            <Button
              variant={activeFilters.includes("security") ? "default" : "outline"}
              className="whitespace-nowrap"
              onClick={() => toggleFilter("security")}
              data-testid="button-filter-security"
            >
              Security
            </Button>
            
            <Button
              variant={activeFilters.includes("ev-charging") ? "default" : "outline"}
              className="whitespace-nowrap"
              onClick={() => toggleFilter("ev-charging")}
              data-testid="button-filter-ev-charging"
            >
              EV Charging
            </Button>
          </div>
          
          <Button
            variant="outline"
            className="flex items-center space-x-2"
            data-testid="button-show-map"
          >
            <i className="fas fa-map"></i>
            <span className="hidden sm:inline">Map</span>
          </Button>
        </div>
      </div>
    </section>
  );
}
