import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useLocation } from "wouter";
import { useErrorToast } from "@/hooks/use-error-toast";
import { checkoutSchema } from "@shared/schema";
import { CheckCircle, CreditCard, MapPin, Clock, Calendar } from "lucide-react";
import { z } from "zod";

type CheckoutFormData = z.infer<typeof checkoutSchema>;

export default function FakeCheckout() {
  const [, setLocation] = useLocation();
  const [isProcessing, setIsProcessing] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const { showValidationError, showUnexpectedError } = useErrorToast();
  const [bookingData, setBookingData] = useState<{
    spaceTitle: string;
    address: string;
    date: string;
    time: string;
    duration: string;
    pricePerHour: number;
    total: number;
  } | null>(null);

  const form = useForm<CheckoutFormData>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      cardNumber: "4242 4242 4242 4242",
      expiryDate: "12/25",
      cvv: "123",
      cardholderName: "Demo User"
    },
  });

  useEffect(() => {
    // Get booking data from sessionStorage
    const pendingBooking = sessionStorage.getItem('pendingBooking');
    if (pendingBooking) {
      const data = JSON.parse(pendingBooking);
      const start = new Date(data.startTime);
      const end = new Date(data.endTime);
      const hours = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60));
      
      setBookingData({
        spaceTitle: data.spaceTitle,
        address: data.address,
        date: start.toDateString(),
        time: `${start.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} - ${end.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}`,
        duration: `${hours} hour${hours !== 1 ? 's' : ''}`,
        pricePerHour: data.pricePerHour,
        total: data.total
      });
    } else {
      // Fallback mock data if no booking in session
      setBookingData({
        spaceTitle: "Downtown Covered Garage",
        address: "123 Market St, San Francisco, CA",
        date: "Today",
        time: "2:00 PM - 4:00 PM",
        duration: "2 hours",
        pricePerHour: 8.00,
        total: 16.00
      });
    }
  }, []);

  const handlePayment = async () => {
    setIsProcessing(true);
    
    // Simulate payment processing
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    try {
      // Create the booking record
      const pendingBooking = sessionStorage.getItem('pendingBooking');
      if (pendingBooking) {
        const data = JSON.parse(pendingBooking);
        
        // For demo purposes, we'll create a mock booking since we don't have a real spaceId
        // In a real app, this would use the actual spaceId from the booking data
        const bookingData = {
          spaceId: "1", // Mock space ID - in real app this would come from the booking data
          startTime: data.startTime,
          endTime: data.endTime,
          totalPrice: data.total.toString(),
          notes: "Booking confirmed through checkout"
        };
        
        // Note: This might fail if user is not authenticated, but that's okay for demo
        try {
          const response = await fetch('/api/bookings', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(bookingData),
          });
          
          if (response.ok) {
            console.log('Booking created successfully');
          }
        } catch (error) {
          console.log('Booking creation failed - user may not be authenticated, but proceeding with demo flow');
        }
      }
    } catch (error) {
      console.log('Error processing booking creation, but proceeding with demo flow');
    }
    
    setIsProcessing(false);
    setIsComplete(true);
    
    // Redirect to booking confirmation
    setTimeout(() => {
      setLocation("/booking-confirmation");
    }, 1000);
  };

  if (isComplete) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Booking Confirmed!</h2>
            <p className="text-gray-600 mb-4">
              Processing your booking confirmation...
            </p>
            <p className="text-sm text-gray-500">Redirecting to confirmation...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!bookingData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" aria-label="Loading"/>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Complete Your Booking</h1>
          <p className="text-gray-600">Review your parking details and confirm payment</p>
        </div>

        <div className="grid gap-6">
          {/* Booking Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="w-5 h-5" />
                Parking Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold text-gray-900">{bookingData.spaceTitle}</h3>
                <p className="text-gray-600">{bookingData.address}</p>
              </div>
              
              <Separator />
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-gray-500" />
                  <span>{bookingData.date}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-gray-500" />
                  <span>{bookingData.time}</span>
                </div>
              </div>
              
              <Separator />
              
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Duration:</span>
                  <span className="font-medium">{bookingData.duration}</span>
                </div>
                <div className="flex justify-between">
                  <span>Price per hour:</span>
                  <span>${bookingData.pricePerHour.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-lg font-semibold">
                  <span>Total:</span>
                  <span>${bookingData.total.toFixed(2)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Payment Form */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="w-5 h-5" />
                Payment Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="card-number">Card Number</Label>
                <Input
                  id="card-number"
                  placeholder="1234 5678 9012 3456"
                  defaultValue="4242 4242 4242 4242"
                  disabled
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="expiry">Expiry Date</Label>
                  <Input
                    id="expiry"
                    placeholder="MM/YY"
                    defaultValue="12/25"
                    disabled
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cvv">CVV</Label>
                  <Input
                    id="cvv"
                    placeholder="123"
                    defaultValue="123"
                    disabled
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="name">Cardholder Name</Label>
                <Input
                  id="name"
                  placeholder="John Doe"
                  defaultValue="Demo User"
                  disabled
                />
              </div>
            </CardContent>
          </Card>

          {/* Confirm Button */}
          <Button
            onClick={handlePayment}
            disabled={isProcessing}
            size="lg"
            className="w-full"
          >
            {isProcessing ? (
              <div className="flex items-center gap-2">
                <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                Processing...
              </div>
            ) : (
              `Confirm & Pay $${bookingData.total.toFixed(2)}`
            )}
          </Button>
          
          <p className="text-xs text-gray-500 text-center">
            This is a demo checkout. No real payment will be processed.
          </p>

          {/* Legal Links */}
          <div className="text-center text-xs text-gray-500 space-x-4">
            <span>By completing this booking, you agree to our</span>
            <a href="/terms" className="text-primary hover:underline" data-testid="link-checkout-terms">
              Terms of Service
            </a>
            <span>and</span>
            <a href="/privacy" className="text-primary hover:underline" data-testid="link-checkout-privacy">
              Privacy Policy
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}