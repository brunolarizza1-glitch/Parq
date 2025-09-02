import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { bookingExtensionSchema, type BookingExtension, type Booking } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Clock, DollarSign, Plus } from "lucide-react";
import { format, addHours, differenceInHours } from "date-fns";

interface BookingExtensionProps {
  booking: Booking;
  spacePrice: number;
}

export function BookingExtension({ booking, spacePrice }: BookingExtensionProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedHours, setSelectedHours] = useState(1);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const extensionMutation = useMutation({
    mutationFn: async (data: BookingExtension) => {
      return apiRequest("POST", "/api/bookings/extend", data);
    },
    onSuccess: () => {
      toast({
        title: "Booking Extended!",
        description: `Your parking time has been extended by ${selectedHours} hour${selectedHours > 1 ? 's' : ''}.`,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/bookings"] });
      setIsOpen(false);
    },
    onError: (error: Error) => {
      toast({
        title: "Extension Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const calculateExtensionCost = (hours: number) => {
    return hours * spacePrice;
  };

  const handleExtend = () => {
    const currentEndTime = new Date(booking.endTime);
    const newEndTime = addHours(currentEndTime, selectedHours);
    
    const extensionData: BookingExtension = {
      bookingId: booking.id,
      newEndTime: newEndTime.toISOString(),
      additionalHours: selectedHours,
    };

    extensionMutation.mutate(extensionData);
  };

  const isExtendable = () => {
    const now = new Date();
    const endTime = new Date(booking.endTime);
    const timeLeft = differenceInHours(endTime, now);
    
    // Allow extension if booking is active and has less than 2 hours left
    return booking.status === "active" && timeLeft <= 2 && timeLeft > 0;
  };

  const timeLeftMessage = () => {
    const now = new Date();
    const endTime = new Date(booking.endTime);
    const timeLeft = differenceInHours(endTime, now);
    
    if (timeLeft <= 0) return "Booking expired";
    if (timeLeft === 1) return "1 hour left";
    return `${timeLeft} hours left`;
  };

  if (!isExtendable()) {
    return null;
  }

  const extensionOptions = [
    { hours: 1, label: "1 hour", popular: true },
    { hours: 2, label: "2 hours", popular: false },
    { hours: 3, label: "3 hours", popular: false },
    { hours: 4, label: "4 hours", popular: false },
  ];

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button 
          size="sm" 
          className="bg-orange-600 hover:bg-orange-700 text-white gap-2"
          data-testid="button-extend-booking"
        >
          <Plus className="h-4 w-4" />
          Extend Time
        </Button>
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Extend Your Parking</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3">
            <div className="flex items-center gap-2 text-yellow-800 dark:text-yellow-300">
              <Clock className="h-4 w-4" />
              <span className="font-medium">{timeLeftMessage()}</span>
            </div>
            <p className="text-sm text-yellow-700 dark:text-yellow-400 mt-1">
              Extend now to avoid parking violations
            </p>
          </div>

          <div className="space-y-3">
            <h4 className="font-medium">Choose extension time:</h4>
            <div className="grid grid-cols-2 gap-2">
              {extensionOptions.map((option) => (
                <Card
                  key={option.hours}
                  className={`cursor-pointer transition-all ${
                    selectedHours === option.hours
                      ? "ring-2 ring-orange-500 bg-orange-50 dark:bg-orange-900/20"
                      : "hover:bg-gray-50 dark:hover:bg-gray-800"
                  }`}
                  onClick={() => setSelectedHours(option.hours)}
                  data-testid={`option-${option.hours}-hours`}
                >
                  <CardContent className="p-3 text-center">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{option.label}</span>
                      {option.popular && (
                        <Badge variant="secondary" className="text-xs">
                          Popular
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center justify-center gap-1 mt-2 text-sm text-gray-600 dark:text-gray-300">
                      <DollarSign className="h-3 w-3" />
                      <span>${calculateExtensionCost(option.hours).toFixed(2)}</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          <div className="border-t pt-4">
            <div className="flex justify-between items-center mb-4">
              <span className="font-medium">Extension Cost:</span>
              <span className="text-lg font-bold text-orange-600">
                ${calculateExtensionCost(selectedHours).toFixed(2)}
              </span>
            </div>
            
            <div className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
              <div className="flex justify-between">
                <span>Current end time:</span>
                <span>{format(new Date(booking.endTime), "h:mm a")}</span>
              </div>
              <div className="flex justify-between">
                <span>New end time:</span>
                <span className="font-medium text-orange-600">
                  {format(addHours(new Date(booking.endTime), selectedHours), "h:mm a")}
                </span>
              </div>
            </div>
          </div>

          <div className="flex gap-2 pt-2">
            <Button
              variant="outline"
              onClick={() => setIsOpen(false)}
              className="flex-1"
              data-testid="button-cancel-extension"
            >
              Cancel
            </Button>
            <Button
              onClick={handleExtend}
              disabled={extensionMutation.isPending}
              className="flex-1 bg-orange-600 hover:bg-orange-700"
              data-testid="button-confirm-extension"
            >
              {extensionMutation.isPending ? "Processing..." : "Extend Parking"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}