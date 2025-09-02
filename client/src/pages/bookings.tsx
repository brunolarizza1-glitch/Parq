import { useQuery } from "@tanstack/react-query";
import { useLocation, Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MapPin, Clock, Calendar, ChevronRight, Search } from "lucide-react";
import { format, isAfter, isBefore, differenceInHours } from "date-fns";
import type { Booking, ParkingSpace } from "@shared/schema";
import { EmptyState } from "@/components/ds";

interface BookingWithSpace extends Booking {
  parkingSpace: ParkingSpace;
}

export default function Bookings() {
  const { data: bookings, isLoading } = useQuery<BookingWithSpace[]>({
    queryKey: ["/api/bookings"],
  });
  const [, navigate] = useLocation();

  const getStatusBadge = (status: string) => {
    const variants = {
      pending: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
      confirmed: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
      active: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
      completed: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300",
      cancelled: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
      issue_reported: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300",
    };
    
    return (
      <Badge className={variants[status as keyof typeof variants] || variants.pending}>
        {status.replace('_', ' ').toUpperCase()}
      </Badge>
    );
  };

  const getTimeStatus = (booking: Booking) => {
    const now = new Date();
    const startTime = new Date(booking.startTime);
    const endTime = new Date(booking.endTime);
    
    if (isBefore(now, startTime)) {
      const hoursUntil = differenceInHours(startTime, now);
      return {
        status: "upcoming",
        message: hoursUntil < 24 ? `Starts in ${hoursUntil}h` : `Starts ${format(startTime, "MMM d")}`,
        color: "text-blue-600 dark:text-blue-400"
      };
    } else if (isAfter(now, endTime)) {
      return {
        status: "ended",
        message: "Ended",
        color: "text-gray-600 dark:text-gray-400"
      };
    } else {
      const hoursLeft = differenceInHours(endTime, now);
      return {
        status: "active",
        message: hoursLeft > 0 ? `${hoursLeft}h left` : "Ending soon",
        color: hoursLeft <= 1 ? "text-red-600 dark:text-red-400" : "text-green-600 dark:text-green-400"
      };
    }
  };

  const categorizeBookings = (bookings: BookingWithSpace[]) => {
    const now = new Date();
    
    return {
      upcoming: bookings.filter(b => {
        const start = new Date(b.startTime);
        const end = new Date(b.endTime);
        return (isAfter(start, now) || (isAfter(now, start) && isBefore(now, end))) && ["confirmed", "pending", "active"].includes(b.status);
      }),
      past: bookings.filter(b => {
        const end = new Date(b.endTime);
        return isAfter(now, end) || ["completed", "cancelled"].includes(b.status);
      }),
    };
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-4">
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-4"></div>
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  const categorized = categorizeBookings(bookings || []);

  const BookingCard = ({ booking }: { booking: BookingWithSpace }) => {
    const startDate = new Date(booking.startTime);
    const endDate = new Date(booking.endTime);
    
    return (
      <Card key={booking.id} className="transition-shadow hover:shadow-md">
        <CardContent className="p-4">
          <div className="flex items-center space-x-4">
            {/* Thumbnail */}
            <div className="flex-shrink-0">
              <img
                src={booking.parkingSpace.images?.[0] || 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=100&h=100&fit=crop'}
                alt={booking.parkingSpace.title}
                className="w-16 h-16 rounded-lg object-cover"
                data-testid={`img-booking-thumbnail-${booking.id}`}
              />
            </div>
            
            {/* Content */}
            <div className="flex-1 min-w-0">
              <h3 className="font-medium text-gray-900 dark:text-gray-100 truncate" data-testid={`text-booking-title-${booking.id}`}>
                {booking.parkingSpace.title}
              </h3>
              
              {/* Date/Time */}
              <div className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-300 mt-1">
                <Clock className="h-3 w-3" />
                <span data-testid={`text-booking-datetime-${booking.id}`}>
                  {format(startDate, "MMM d, h:mm a")} - {format(endDate, "h:mm a")}
                </span>
              </div>
              
              {/* Address */}
              <div className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-300 mt-1">
                <MapPin className="h-3 w-3" />
                <span className="truncate" data-testid={`text-booking-address-${booking.id}`}>
                  {booking.parkingSpace.address}
                </span>
              </div>
            </div>
            
            {/* Details Button */}
            <div className="flex-shrink-0">
              <Link href={`/booking-details/${booking.id}`}>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="flex items-center gap-1"
                  data-testid={`button-booking-details-${booking.id}`}
                >
                  Details
                  <ChevronRight className="h-3 w-3" />
                </Button>
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">My Bookings</h1>
        <p className="text-gray-600 dark:text-gray-300">
          Manage your parking reservations and extend time when needed
        </p>
      </div>

      <Tabs defaultValue="upcoming" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="upcoming" className="flex items-center gap-2" data-testid="tab-upcoming">
            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
            Upcoming ({categorized.upcoming.length})
          </TabsTrigger>
          <TabsTrigger value="past" className="flex items-center gap-2" data-testid="tab-past">
            <div className="w-2 h-2 bg-gray-500 rounded-full"></div>
            Past ({categorized.past.length})
          </TabsTrigger>
        </TabsList>


        <TabsContent value="upcoming" className="space-y-4">
          {categorized.upcoming.length === 0 ? (
            <EmptyState
              icon={<Search className="w-16 h-16" />}
              title="No upcoming bookings"
              description="You don't have any parking booked yet. Find and book a spot to see your reservations here."
              ctaText="Find Parking"
              onCtaClick={() => navigate("/")}
            />
          ) : (
            categorized.upcoming.map(booking => (
              <BookingCard key={booking.id} booking={booking} />
            ))
          )}
        </TabsContent>

        <TabsContent value="past" className="space-y-4">
          {categorized.past.length === 0 ? (
            <EmptyState
              icon={<Calendar className="w-16 h-16" />}
              title="No past bookings"
              description="Your completed parking sessions will show up here after you start using spots."
              ctaText="Book Your First Spot"
              onCtaClick={() => navigate("/")}
            />
          ) : (
            categorized.past.map(booking => (
              <BookingCard key={booking.id} booking={booking} />
            ))
          )}
        </TabsContent>

      </Tabs>
    </div>
  );
}