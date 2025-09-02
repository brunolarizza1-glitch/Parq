import { useParams, useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { 
  ArrowLeft, 
  MapPin, 
  Clock, 
  DollarSign, 
  QrCode,
  Copy,
  Check,
  Car,
  Key,
  Smartphone,
  AlertTriangle
} from "lucide-react";
import { format, isBefore, addHours } from "date-fns";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import type { Booking, ParkingSpace } from "@shared/schema";

interface BookingWithSpace extends Booking {
  parkingSpace: ParkingSpace;
}

export default function BookingDetails() {
  const { id } = useParams();
  const [, setLocation] = useLocation();
  const [copiedCode, setCopiedCode] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const { data: booking, isLoading } = useQuery<BookingWithSpace>({
    queryKey: ["/api/bookings", id],
    enabled: !!id,
  });

  const cancelMutation = useMutation({
    mutationFn: async (bookingId: string) => {
      return apiRequest("PATCH", `/api/bookings/${bookingId}`, {
        status: "cancelled"
      });
    },
    onSuccess: () => {
      toast({
        title: "Booking Cancelled",
        description: "Your booking has been successfully cancelled.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/bookings"] });
      queryClient.invalidateQueries({ queryKey: ["/api/bookings", id] });
      setShowCancelModal(false);
      // Redirect back to bookings after a short delay
      setTimeout(() => {
        setLocation("/bookings");
      }, 1500);
    },
    onError: () => {
      toast({
        title: "Cancellation Failed",
        description: "Unable to cancel booking. Please try again or contact support.",
        variant: "destructive",
      });
    },
  });

  const copyBookingCode = async () => {
    if (!booking) return;
    
    try {
      // Generate a booking code from the booking ID
      const bookingCode = `PRQ${booking.id.substring(0, 6).toUpperCase()}`;
      await navigator.clipboard.writeText(bookingCode);
      setCopiedCode(true);
      toast({
        title: "Copied!",
        description: "Booking code copied to clipboard",
      });
      setTimeout(() => setCopiedCode(false), 2000);
    } catch (err) {
      toast({
        title: "Copy failed",
        description: "Please copy the booking code manually",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Booking Not Found</h1>
          <p className="text-gray-600 mb-4">The booking you're looking for doesn't exist.</p>
          <Button onClick={() => setLocation("/bookings")}>
            Back to Bookings
          </Button>
        </div>
      </div>
    );
  }

  const startDate = new Date(booking.startTime);
  const endDate = new Date(booking.endTime);
  const bookingCode = `PRQ${booking.id.substring(0, 6).toUpperCase()}`;

  const handleCancelBooking = () => {
    if (booking) {
      cancelMutation.mutate(booking.id);
    }
  };

  const canCancelBooking = () => {
    if (!booking) return false;
    
    // Can't cancel if already cancelled or completed
    if (["cancelled", "completed"].includes(booking.status)) return false;
    
    // Can cancel if booking hasn't started yet, or if it's within 2 hours of start time
    const startTime = new Date(booking.startTime);
    const now = new Date();
    const twoHoursBeforeStart = addHours(startTime, -2);
    
    return isBefore(now, twoHoursBeforeStart);
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      pending: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
      confirmed: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
      active: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
      completed: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300",
      cancelled: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
    };
    
    return (
      <Badge className={variants[status as keyof typeof variants] || variants.pending}>
        {status.replace('_', ' ').toUpperCase()}
      </Badge>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 py-6">
      <div className="max-w-2xl mx-auto px-4">
        
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setLocation("/bookings")}
            data-testid="button-back-to-bookings"
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            Back
          </Button>
          <h1 className="text-2xl font-bold text-gray-900" data-testid="text-booking-details-title">
            Booking Details
          </h1>
          {getStatusBadge(booking.status)}
        </div>

        <div className="space-y-6">
          
          {/* QR Code & Booking Code */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <QrCode className="w-5 h-5" />
                Booking Code & QR
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              {/* QR Code Placeholder */}
              <div className="bg-white border-2 border-gray-300 rounded-lg p-8 inline-block">
                <div className="w-32 h-32 bg-gray-100 flex items-center justify-center rounded" data-testid="qr-code-placeholder">
                  <QrCode className="w-12 h-12 text-gray-400" />
                </div>
              </div>
              
              {/* Booking Code */}
              <div>
                <p className="text-sm text-gray-600 mb-2">Show this code when you arrive</p>
                <div className="bg-gray-50 rounded-lg p-4 flex items-center justify-between">
                  <span className="text-2xl font-mono font-bold text-primary" data-testid="text-booking-code">
                    {bookingCode}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={copyBookingCode}
                    data-testid="button-copy-booking-code"
                  >
                    {copiedCode ? (
                      <Check className="w-4 h-4" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Parking Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="w-5 h-5" />
                Parking Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold text-gray-900" data-testid="text-space-title">
                  {booking.parkingSpace.title}
                </h3>
                <p className="text-gray-600" data-testid="text-space-address">
                  {booking.parkingSpace.address}
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-gray-500" />
                  <div>
                    <div className="font-medium">Date & Time</div>
                    <div className="text-gray-600" data-testid="text-booking-datetime">
                      {format(startDate, "MMM d, yyyy")}
                    </div>
                    <div className="text-gray-600">
                      {format(startDate, "h:mm a")} - {format(endDate, "h:mm a")}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-gray-500" />
                  <div>
                    <div className="font-medium">Total Paid</div>
                    <div className="text-gray-600" data-testid="text-total-price">
                      ${parseFloat(booking.totalPrice).toFixed(2)}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Access Instructions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Key className="w-5 h-5" />
                Access Instructions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4" data-testid="access-instructions">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-medium text-blue-900 mb-2 flex items-center gap-2">
                  <Car className="w-4 h-4" />
                  How to Access Your Parking Space
                </h4>
                <ul className="text-sm text-blue-800 space-y-2">
                  <li>• Arrive at the specified address and look for parking space markers</li>
                  <li>• Present your booking code to the attendant or enter it at the gate</li>
                  <li>• Follow any posted signage for your designated parking area</li>
                  <li>• Keep your booking confirmation accessible during your stay</li>
                </ul>
              </div>
              
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <h4 className="font-medium text-amber-900 mb-2 flex items-center gap-2">
                  <Smartphone className="w-4 h-4" />
                  Contact Information
                </h4>
                <div className="text-sm text-amber-800 space-y-1">
                  <p><strong>Host:</strong> Sarah M.</p>
                  <p><strong>Contact:</strong> Available through app messaging</p>
                  <p><strong>Support:</strong> Call (555) 123-4567 for assistance</p>
                </div>
              </div>
              
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-2">Important Notes</h4>
                <ul className="text-sm text-gray-700 space-y-1">
                  <li>• Maximum vehicle height: 6'8\"</li>
                  <li>• No overnight parking permitted</li>
                  <li>• Please park within designated lines</li>
                  <li>• Report any issues immediately through the app</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="space-y-3">
            <div className="flex gap-3">
              <Button
                onClick={() => window.open(`https://maps.google.com/?q=${encodeURIComponent(booking.parkingSpace.address)}`, '_blank')}
                variant="outline"
                className="flex-1"
                data-testid="button-directions"
              >
                Get Directions
              </Button>
              <Button
                onClick={() => setLocation("/bookings")}
                className="flex-1"
                data-testid="button-back-bookings"
              >
                Back to Bookings
              </Button>
            </div>
            
            {/* Cancel Booking Button */}
            {canCancelBooking() && (
              <Button
                onClick={() => setShowCancelModal(true)}
                variant="destructive"
                className="w-full"
                data-testid="button-cancel-booking"
              >
                Cancel Booking
              </Button>
            )}
          </div>
        </div>
        
        {/* Cancellation Modal */}
        <Dialog open={showCancelModal} onOpenChange={setShowCancelModal}>
          <DialogContent className="max-w-md" data-testid="modal-cancel-booking">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-red-500" />
                Cancel Booking
              </DialogTitle>
              <DialogDescription>
                Are you sure you want to cancel this booking?
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              {/* Cancellation Policy */}
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-2">Cancellation Policy</h4>
                <ul className="text-sm text-gray-700 space-y-1">
                  <li>• Free cancellation up to 2 hours before booking start time</li>
                  <li>• Cancellations within 2 hours are subject to a 50% fee</li>
                  <li>• No refunds for no-shows or cancellations after start time</li>
                  <li>• Refunds will be processed within 3-5 business days</li>
                </ul>
              </div>
              
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p className="text-sm text-yellow-800">
                  <strong>Important:</strong> This action cannot be undone. Once cancelled, 
                  you'll need to make a new booking if you change your mind.
                </p>
              </div>
            </div>
            
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setShowCancelModal(false)}
                data-testid="button-cancel-modal-close"
              >
                Keep Booking
              </Button>
              <Button
                variant="destructive"
                onClick={handleCancelBooking}
                disabled={cancelMutation.isPending}
                data-testid="button-confirm-cancel"
              >
                {cancelMutation.isPending ? "Cancelling..." : "Yes, Cancel Booking"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}