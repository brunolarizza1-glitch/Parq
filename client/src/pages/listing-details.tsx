import { useParams } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { type ParkingSpace, type Review } from "@shared/schema";
import Footer from "@/components/footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import BookingModal from "@/components/booking-modal";
import { useState } from "react";
import { Star, MapPin, Calendar, Flag, Zap, Shield, Ruler, Clock, User, AlertTriangle } from "lucide-react";

export default function ListingDetails() {
  const { id } = useParams();
  const [showBookingModal, setShowBookingModal] = useState(false);

  const { data: space, isLoading: spaceLoading } = useQuery<ParkingSpace>({
    queryKey: ["/api/parking-spaces", id],
    enabled: !!id,
  });

  const { data: reviews, isLoading: reviewsLoading } = useQuery<Review[]>({
    queryKey: ["/api/parking-spaces", id, "reviews"],
    enabled: !!id,
  });

  if (spaceLoading) {
    return (
      <div className="min-h-screen bg-background">

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Skeleton className="h-96 rounded-2xl" />
            <div className="space-y-4">
              <Skeleton className="h-8 w-3/4" />
              <Skeleton className="h-6 w-1/2" />
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!space) {
    return (
      <div className="min-h-screen bg-background">

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-foreground mb-4">Parking Space Not Found</h1>
            <p className="text-muted-foreground">The parking space you're looking for doesn't exist or has been removed.</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Image Carousel */}
          <div className="space-y-4">
            <div className="relative">
              <img
                src={space.images[0] || 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80'}
                alt={space.title}
                className="w-full h-96 object-cover rounded-2xl"
                data-testid="img-space-main"
              />
            </div>
            <div className="grid grid-cols-3 gap-2">
              {/* Always show 3 images - use placeholders if needed */}
              {Array.from({ length: 3 }).map((_, index) => {
                const imageUrl = space.images[index + 1] || [
                  'https://images.unsplash.com/photo-1540574163026-643ea20ade25?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80',
                  'https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80',
                  'https://images.unsplash.com/photo-1590674899484-d5640e854abe?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80'
                ][index];
                
                return (
                  <img
                    key={index}
                    src={imageUrl}
                    alt={`${space.title} view ${index + 2}`}
                    className="w-full h-24 object-cover rounded-lg"
                    data-testid={`img-space-gallery-${index}`}
                  />
                );
              })}
            </div>
          </div>

          {/* Space Details */}
          <div className="space-y-6">
            <div>
              <div className="flex items-center justify-between mb-2">
                <h1 className="text-3xl font-bold text-foreground" data-testid="text-space-title">
                  {space.title}
                </h1>
                <div className="flex items-center space-x-1">
                  <div className="flex items-center space-x-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${
                          i < Math.floor(parseFloat(space.rating || "0")) ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
                        }`}
                        data-testid={`star-rating-${i}`}
                      />
                    ))}
                  </div>
                  <span className="font-medium" data-testid="text-space-rating">
                    {space.rating}
                  </span>
                  <span className="text-muted-foreground">({space.reviewCount} reviews)</span>
                </div>
              </div>
              <button 
                onClick={() => window.open(`https://maps.google.com/?q=${encodeURIComponent(space.address)}`, '_blank')}
                className="flex items-center space-x-2 text-muted-foreground hover:text-primary transition-colors group"
                data-testid="button-open-maps"
              >
                <MapPin className="w-4 h-4 group-hover:text-primary" />
                <span className="underline">{space.address}</span>
              </button>
            </div>

            <div>
              <h2 className="text-xl font-semibold text-foreground mb-3">Description</h2>
              <p className="text-foreground" data-testid="text-space-description">
                {space.description}
              </p>
            </div>

            {/* Features */}
            <div>
              <h2 className="text-xl font-semibold text-foreground mb-3">Features</h2>
              <div className="flex flex-wrap gap-2">
                {space.amenities.map((amenity, index) => {
                  const getAmenityIcon = (amenity: string) => {
                    switch (amenity.toLowerCase()) {
                      case 'ev_charging':
                      case 'ev':
                        return <Zap className="w-3 h-3" />;
                      case 'covered':
                      case 'indoor':
                        return <Shield className="w-3 h-3" />;
                      case 'height_limit':
                      case 'height_restriction':
                        return <Ruler className="w-3 h-3" />;
                      default:
                        return null;
                    }
                  };
                  return (
                    <Badge key={index} variant="secondary" className="flex items-center gap-1" data-testid={`badge-amenity-${index}`}>
                      {getAmenityIcon(amenity)}
                      {amenity.replace("_", " ").replace(/\b\w/g, l => l.toUpperCase())}
                    </Badge>
                  );
                })}
                {/* Add common features if not in amenities */}
                {!space.amenities.some(a => a.toLowerCase().includes('ev')) && (
                  <Badge variant="outline" className="flex items-center gap-1">
                    <Zap className="w-3 h-3" />
                    EV Charging
                  </Badge>
                )}
                {!space.amenities.some(a => a.toLowerCase().includes('covered')) && (
                  <Badge variant="outline" className="flex items-center gap-1">
                    <Shield className="w-3 h-3" />
                    Covered
                  </Badge>
                )}
                <Badge variant="outline" className="flex items-center gap-1">
                  <Ruler className="w-3 h-3" />
                  Height limit: 6'8"
                </Badge>
              </div>
            </div>

            {/* Availability Calendar */}
            <div>
              <h2 className="text-xl font-semibold text-foreground mb-3 flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Availability
              </h2>
              <Card>
                <CardContent className="p-4">
                  <div className="text-sm text-muted-foreground mb-3">Available times for booking</div>
                  <div className="grid grid-cols-7 gap-1 text-xs">
                    {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
                      <div key={day} className="text-center font-medium p-2">{day}</div>
                    ))}
                    {/* Sample availability grid */}
                    {Array.from({ length: 28 }).map((_, i) => (
                      <div 
                        key={i} 
                        className={`h-8 rounded border ${
                          i % 7 === 0 || i % 7 === 6 ? 'bg-muted text-muted-foreground' : 
                          Math.random() > 0.3 ? 'bg-green-100 border-green-300 text-green-800' : 
                          'bg-red-100 border-red-300 text-red-800'
                        } flex items-center justify-center`}
                        data-testid={`calendar-day-${i}`}
                      >
                        {i + 1}
                      </div>
                    ))}
                  </div>
                  <div className="flex justify-center space-x-4 mt-3 text-xs">
                    <div className="flex items-center gap-1">
                      <div className="w-3 h-3 bg-green-100 border border-green-300 rounded"></div>
                      <span>Available</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="w-3 h-3 bg-red-100 border border-red-300 rounded"></div>
                      <span>Booked</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Price Breakdown */}
            <div>
              <h2 className="text-xl font-semibold text-foreground mb-3 flex items-center gap-2">
                <Clock className="w-5 h-5" />
                Pricing
              </h2>
              <Card>
                <CardContent className="p-6">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Hourly rate</span>
                      <span className="text-2xl font-bold text-primary" data-testid="text-hourly-rate">
                        ${space.pricePerHour}
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-muted-foreground">Service fee</span>
                      <span>$2.50</span>
                    </div>
                    <div className="border-t pt-2">
                      <div className="flex justify-between items-center text-sm text-muted-foreground">
                        <span>Total for 2 hours</span>
                        <span>${(parseFloat(space.pricePerHour) * 2 + 2.5).toFixed(2)}</span>
                      </div>
                    </div>
                    <Button
                      onClick={() => setShowBookingModal(true)}
                      className="w-full mt-4"
                      size="lg"
                      data-testid="button-continue-book"
                    >
                      Continue to book
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        {/* Host Information */}
        <div className="mt-12">
          <h2 className="text-2xl font-bold text-foreground mb-6 flex items-center gap-2">
            <User className="w-6 h-6" />
            About the host
          </h2>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-start space-x-4">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                  <User className="w-8 h-8 text-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-lg mb-2">Sarah M.</h3>
                  <p className="text-muted-foreground mb-3">
                    Hi! I'm Sarah, and I've been hosting parking spaces for over 2 years. 
                    I live nearby and am always available to help if you need anything. 
                    My space is perfect for daily commuters and weekend visitors alike.
                  </p>
                  <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                    <span>⭐ 4.9 host rating</span>
                    <span>📅 Member since 2022</span>
                    <span>💬 Responds within 1 hour</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Parking Rules */}
        <div className="mt-8">
          <h2 className="text-2xl font-bold text-foreground mb-6 flex items-center gap-2">
            <AlertTriangle className="w-6 h-6" />
            Parking rules
          </h2>
          <Card>
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
                  <div>
                    <h4 className="font-medium">Vehicle size restrictions</h4>
                    <p className="text-sm text-muted-foreground">Maximum height: 6'8". No trucks or RVs permitted.</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
                  <div>
                    <h4 className="font-medium">Access hours</h4>
                    <p className="text-sm text-muted-foreground">Available 24/7. Gate code will be provided upon booking confirmation.</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
                  <div>
                    <h4 className="font-medium">Prohibited items</h4>
                    <p className="text-sm text-muted-foreground">No overnight parking. No vehicle repairs or maintenance on premises.</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
                  <div>
                    <h4 className="font-medium">Cancellation policy</h4>
                    <p className="text-sm text-muted-foreground">Free cancellation up to 2 hours before booking start time.</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Reviews Section */}
        <div className="mt-12">
          <h2 className="text-2xl font-bold text-foreground mb-6">Reviews</h2>
          {reviewsLoading ? (
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <Card key={i}>
                  <CardContent className="p-6">
                    <div className="flex items-start space-x-4">
                      <Skeleton className="w-12 h-12 rounded-full" />
                      <div className="flex-1 space-y-2">
                        <Skeleton className="h-4 w-1/4" />
                        <Skeleton className="h-20 w-full" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : reviews && reviews.length > 0 ? (
            <div className="space-y-4">
              {reviews.map((review) => (
                <Card key={review.id}>
                  <CardContent className="p-6">
                    <div className="flex items-start space-x-4">
                      <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                        <i className="fas fa-user text-primary"></i>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <span className="font-medium text-foreground">Anonymous User</span>
                          <div className="flex items-center space-x-1">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <i
                                key={i}
                                className={`fas fa-star text-sm ${
                                  i < review.rating ? "text-yellow-400" : "text-gray-300"
                                }`}
                              ></i>
                            ))}
                          </div>
                        </div>
                        {review.comment && (
                          <p className="text-foreground" data-testid={`text-review-${review.id}`}>
                            {review.comment}
                          </p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground text-center py-8">No reviews yet. Be the first to review this space!</p>
          )}
        </div>

        {/* Report Listing */}
        <div className="mt-8 pb-8 text-center">
          <button 
            onClick={() => {
              // In a real app, this would open a report modal or navigate to a report page
              alert('Report listing functionality would be implemented here');
            }}
            className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1 mx-auto"
            data-testid="button-report-listing"
          >
            <Flag className="w-4 h-4" />
            Report listing
          </button>
        </div>
      </main>

      <Footer />

      <BookingModal
        space={space}
        isOpen={showBookingModal}
        onClose={() => setShowBookingModal(false)}
      />
    </div>
  );
}
