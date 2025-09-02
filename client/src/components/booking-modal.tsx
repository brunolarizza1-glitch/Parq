import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useToast } from "@/hooks/use-toast";
import { useErrorToast } from "@/hooks/use-error-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { type ParkingSpace, bookingValidationSchema } from "@shared/schema";
import { useIsMobile } from "@/hooks/use-mobile";
import { useAuth } from "@/hooks/useAuth";
import { z } from "zod";

type BookingFormData = z.infer<typeof bookingValidationSchema>;

interface BookingModalProps {
  space: ParkingSpace;
  isOpen: boolean;
  onClose: () => void;
}

export default function BookingModal({ space, isOpen, onClose }: BookingModalProps) {
  const { toast } = useToast();
  const { showError, showValidationError } = useErrorToast();
  const queryClient = useQueryClient();
  const isMobile = useIsMobile();
  const { user } = useAuth();

  const form = useForm<BookingFormData>({
    resolver: zodResolver(bookingValidationSchema),
    defaultValues: {
      startTime: "",
      endTime: "",
      notes: ""
    },
  });

  const bookingMutation = useMutation({
    mutationFn: async (bookingData: BookingFormData & { spaceId: string }) => {
      return apiRequest("POST", "/api/bookings", bookingData);
    },
    onSuccess: () => {
      toast({
        title: "Booking Confirmed!",
        description: `Your parking space at ${space.title} has been booked successfully.`,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/bookings"] });
      onClose();
      form.reset();
    },
    onError: (error) => {
      showError(error, "Unable to book parking space");
    },
  });

  const calculateTotal = () => {
    if (!startTime || !endTime) return 0;
    
    const start = new Date(startTime);
    const end = new Date(endTime);
    const hours = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60));
    
    return Math.max(hours, 1) * parseFloat(space.pricePerHour);
  };

  const handleBooking = () => {
    if (!startTime || !endTime) {
      toast({
        title: "Missing Information",
        description: "Please select both start and end times.",
        variant: "destructive",
      });
      return;
    }

    // Check if vehicle information is complete
    if (!user?.vehicleMake || !user?.vehicleModel || !user?.vehicleColor || !user?.vehicleLicensePlate) {
      toast({
        title: "Vehicle Required",
        description: "Please complete your vehicle information in your profile before booking.",
        variant: "destructive",
      });
      return;
    }

    // For MVP: Redirect to fake checkout instead of processing payment
    const bookingData = {
      spaceTitle: space.title,
      address: space.address,
      startTime,
      endTime,
      pricePerHour: parseFloat(space.pricePerHour),
      total: calculateTotal(),
    };
    
    // Store booking data in sessionStorage for checkout page
    sessionStorage.setItem('pendingBooking', JSON.stringify(bookingData));
    
    // Close modal and redirect to checkout
    onClose();
    window.location.href = '/checkout';
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent 
        className={`${isMobile ? "w-[95vw] max-w-none mx-2" : "sm:max-w-md"}`} 
        data-testid="modal-booking"
      >
        <DialogHeader>
          <DialogTitle>Book Parking Space</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="flex items-start space-x-4">
            <img
              src={space.images[0]}
              alt={space.title}
              className="w-20 h-20 object-cover rounded-lg"
              data-testid="img-booking-space"
            />
            <div className="flex-1">
              <h3 className="font-semibold text-foreground" data-testid="text-booking-title">
                {space.title}
              </h3>
              <p className="text-sm text-muted-foreground" data-testid="text-booking-address">
                {space.address}
              </p>
              <p className="text-lg font-bold text-primary" data-testid="text-booking-price">
                ${space.pricePerHour}/hour
              </p>
            </div>
          </div>

          <div className={`grid ${isMobile ? "grid-cols-1" : "grid-cols-2"} gap-4`}>
            <div>
              <Label htmlFor="start-time">Start Time</Label>
              <Input
                id="start-time"
                type="datetime-local"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="touch-target"
                data-testid="input-booking-start"
              />
            </div>
            <div>
              <Label htmlFor="end-time">End Time</Label>
              <Input
                id="end-time"
                type="datetime-local"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="touch-target"
                data-testid="input-booking-end"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="notes">Notes (Optional)</Label>
            <Textarea
              id="notes"
              placeholder="Any special instructions or notes..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              data-testid="textarea-booking-notes"
            />
          </div>

          {startTime && endTime && (
            <div className="bg-muted p-4 rounded-lg">
              <div className="flex justify-between items-center">
                <span className="font-medium">Total Cost:</span>
                <span className="text-xl font-bold text-primary" data-testid="text-booking-total">
                  ${calculateTotal().toFixed(2)}
                </span>
              </div>
            </div>
          )}

          <div className={`flex ${isMobile ? "flex-col" : "flex-row"} gap-3`}>
            <Button
              variant="outline"
              onClick={onClose}
              className={`${isMobile ? "w-full" : "flex-1"} touch-target active:scale-95 transition-transform`}
              data-testid="button-booking-cancel"
            >
              Cancel
            </Button>
            <Button
              onClick={handleBooking}
              disabled={bookingMutation.isPending || !startTime || !endTime}
              className={`${isMobile ? "w-full" : "flex-1"} touch-target active:scale-95 transition-transform`}
              data-testid="button-booking-confirm"
            >
              {bookingMutation.isPending ? "Booking..." : "Confirm Booking"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
