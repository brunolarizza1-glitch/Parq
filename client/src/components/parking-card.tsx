import { type ParkingSpace } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useState } from "react";
import { Link } from "wouter";
import BookingModal from "./booking-modal";
import LazyImage from "./lazy-image";
import { calculateDistance } from "@/hooks/use-geolocation";

interface ParkingCardProps {
  space: ParkingSpace;
  userLatitude?: number;
  userLongitude?: number;
}

export default function ParkingCard({ space, userLatitude, userLongitude }: ParkingCardProps) {
  const [isLiked, setIsLiked] = useState(false);
  const [showBookingModal, setShowBookingModal] = useState(false);

  const getSpaceTypeIcon = (type: string) => {
    switch (type) {
      case "covered":
        return "fas fa-shield-alt";
      case "surface":
        return "fas fa-charging-station";
      case "valet":
        return "fas fa-car";
      case "street":
        return "fas fa-clock";
      case "private":
        return "fas fa-home";
      case "corporate":
        return "fas fa-building";
      default:
        return "fas fa-parking";
    }
  };

  const getSpaceTypeLabel = (type: string) => {
    switch (type) {
      case "covered":
        return "Secure";
      case "surface":
        return "EV Charging";
      case "valet":
        return "Valet";
      case "street":
        return "24/7";
      case "private":
        return "Private";
      case "corporate":
        return "Corporate";
      default:
        return type;
    }
  };

  const getSpaceTypeColor = (type: string) => {
    switch (type) {
      case "covered":
        return "bg-accent text-accent-foreground";
      case "surface":
        return "bg-green-500 text-white";
      case "valet":
        return "bg-blue-500 text-white";
      case "street":
        return "bg-orange-500 text-white";
      case "private":
        return "bg-purple-500 text-white";
      case "corporate":
        return "bg-indigo-500 text-white";
      default:
        return "bg-gray-500 text-white";
    }
  };

  return (
    <>
      <Card className="bg-card rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow cursor-pointer group touch-target active:scale-[0.98] transition-transform">
        <Link href={`/listing/${space.id}`}>
          <div className="relative">
            <LazyImage
              src={space.images[0]}
              alt={space.title}
              className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
              data-testid={`img-space-${space.id}`}
            />
            <button
              onClick={(e) => {
                e.preventDefault();
                setIsLiked(!isLiked);
              }}
              className="absolute top-3 right-3 p-2 bg-white/80 hover:bg-white rounded-full transition-colors touch-target active:scale-90"
              data-testid={`button-like-${space.id}`}
            >
              <i className={`${isLiked ? "fas" : "far"} fa-heart ${isLiked ? "text-red-500" : "text-gray-600 hover:text-red-500"}`}></i>
            </button>
            <div className="absolute bottom-3 left-3">
              <span className={`${getSpaceTypeColor(space.spaceType)} px-2 py-1 rounded-full text-xs font-medium`}>
                <i className={`${getSpaceTypeIcon(space.spaceType)} mr-1`}></i>
                {getSpaceTypeLabel(space.spaceType)}
              </span>
            </div>
          </div>
        </Link>

        <div className="p-4">
          <div className="flex items-start justify-between mb-2">
            <h3 className="font-semibold text-foreground" data-testid={`text-title-${space.id}`}>
              {space.title}
            </h3>
            <div className="flex items-center space-x-1">
              <i className="fas fa-star text-blue-500 text-sm"></i>
              <span className="text-sm font-medium" data-testid={`text-rating-${space.id}`}>
                {space.rating}
              </span>
            </div>
          </div>
          
          <p className="text-sm text-muted-foreground mb-2" data-testid={`text-location-${space.id}`}>
            {space.city} • {space.address.split(',')[0]}
            {userLatitude && userLongitude && space.latitude && space.longitude && (
              <span className="ml-2 text-xs bg-muted px-2 py-1 rounded-full">
                {calculateDistance(
                  userLatitude,
                  userLongitude,
                  parseFloat(space.latitude),
                  parseFloat(space.longitude)
                ).toFixed(1)} mi
              </span>
            )}
          </p>
          
          <p className="text-sm text-muted-foreground mb-3" data-testid={`text-description-${space.id}`}>
            {space.description.substring(0, 50)}...
          </p>
          
          <div className="flex items-center justify-between">
            <div>
              <span className="text-lg font-bold text-foreground" data-testid={`text-price-${space.id}`}>
                ${space.pricePerHour}
              </span>
              <span className="text-sm text-muted-foreground">/hour</span>
            </div>
            <Button
              onClick={(e) => {
                e.preventDefault();
                setShowBookingModal(true);
              }}
              className="px-4 py-2 text-sm font-medium touch-target active:scale-95 transition-transform"
              data-testid={`button-book-${space.id}`}
            >
              Book Now
            </Button>
          </div>
        </div>
      </Card>

      <BookingModal
        space={space}
        isOpen={showBookingModal}
        onClose={() => setShowBookingModal(false)}
      />
    </>
  );
}
