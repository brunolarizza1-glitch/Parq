import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useLocation } from "wouter";
import { 
  CheckCircle, 
  MapPin, 
  Clock, 
  Calendar, 
  ExternalLink, 
  CalendarPlus, 
  MessageCircle, 
  Copy,
  Check
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function BookingConfirmation() {
  const [, setLocation] = useLocation();
  const [bookingData, setBookingData] = useState<{
    spaceTitle: string;
    address: string;
    startTime: string;
    endTime: string;
    pricePerHour: number;
    total: number;
  } | null>(null);
  const [bookingCode, setBookingCode] = useState("");
  const [copiedCode, setCopiedCode] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // Get booking data from sessionStorage
    const pendingBooking = sessionStorage.getItem('pendingBooking');
    if (pendingBooking) {
      const data = JSON.parse(pendingBooking);
      setBookingData(data);
      
      // Generate a booking code
      const code = `PRQ${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
      setBookingCode(code);
      
      // Clear the pending booking since it's now confirmed
      sessionStorage.removeItem('pendingBooking');
    } else {
      // Redirect to search if no booking data
      setLocation("/search");
    }
  }, [setLocation]);

  const copyBookingCode = async () => {
    try {
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

  const openInMaps = () => {
    if (bookingData?.address) {
      const encodedAddress = encodeURIComponent(bookingData.address);
      window.open(`https://maps.google.com/?q=${encodedAddress}`, '_blank');
    }
  };

  const addToCalendar = () => {
    if (!bookingData) return;
    
    const startDate = new Date(bookingData.startTime);
    const endDate = new Date(bookingData.endTime);
    
    const formatDate = (date: Date) => {
      return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    };
    
    const title = encodeURIComponent(`Parking at ${bookingData.spaceTitle}`);
    const details = encodeURIComponent(`Booking Code: ${bookingCode}\\nAddress: ${bookingData.address}\\nTotal: $${bookingData.total.toFixed(2)}`);
    const location = encodeURIComponent(bookingData.address);
    
    const googleCalendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${formatDate(startDate)}/${formatDate(endDate)}&details=${details}&location=${location}`;
    
    window.open(googleCalendarUrl, '_blank');
  };

  const messageHost = () => {
    // Placeholder function - would integrate with actual messaging system
    toast({
      title: "Coming Soon",
      description: "Host messaging feature will be available soon",
    });
  };

  const viewBookings = () => {
    setLocation("/bookings");
  };

  if (!bookingData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" aria-label="Loading"/>
      </div>
    );
  }

  const startDate = new Date(bookingData.startTime);
  const endDate = new Date(bookingData.endTime);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 py-8">
      <div className="max-w-2xl mx-auto px-4">
        
        {/* Success Header */}
        <div className="text-center mb-8">
          <div className="bg-green-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-12 h-12 text-green-600" data-testid="icon-success" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2" data-testid="text-confirmation-title">
            Booking Confirmed!
          </h1>
          <p className="text-gray-600">
            Your parking space has been successfully reserved
          </p>
        </div>

        {/* Booking Code Card */}
        <Card className="mb-6">
          <CardContent className="p-6 text-center">
            <h2 className="text-lg font-semibold text-gray-900 mb-3">Booking Code</h2>
            <div className="bg-gray-50 rounded-lg p-4 flex items-center justify-between">
              <span className="text-2xl font-mono font-bold text-primary" data-testid="text-booking-code">
                {bookingCode}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={copyBookingCode}
                className="ml-4"
                data-testid="button-copy-code"
              >
                {copiedCode ? (
                  <Check className="w-4 h-4" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </Button>
            </div>
            <p className="text-sm text-gray-500 mt-2">
              Present this code when you arrive at the parking location
            </p>
          </CardContent>
        </Card>

        {/* Booking Details Card */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="w-5 h-5" />
              Booking Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-semibold text-gray-900" data-testid="text-space-title">
                {bookingData.spaceTitle}
              </h3>
              <p className="text-gray-600" data-testid="text-space-address">
                {bookingData.address}
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-gray-500" />
                <div>
                  <div className="font-medium">Date</div>
                  <div className="text-gray-600" data-testid="text-booking-date">
                    {startDate.toLocaleDateString()}
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-gray-500" />
                <div>
                  <div className="font-medium">Time</div>
                  <div className="text-gray-600" data-testid="text-booking-time">
                    {startDate.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} - {endDate.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex justify-between items-center">
                <span className="font-medium">Total Paid</span>
                <span className="text-xl font-bold text-primary" data-testid="text-total-paid">
                  ${bookingData.total.toFixed(2)}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Button
            variant="outline"
            onClick={openInMaps}
            className="flex items-center gap-2"
            data-testid="button-open-maps"
          >
            <ExternalLink className="w-4 h-4" />
            Open in Maps
          </Button>
          
          <Button
            variant="outline"
            onClick={addToCalendar}
            className="flex items-center gap-2"
            data-testid="button-add-calendar"
          >
            <CalendarPlus className="w-4 h-4" />
            Add to Calendar
          </Button>
          
          <Button
            variant="outline"
            onClick={messageHost}
            className="flex items-center gap-2"
            data-testid="button-message-host"
          >
            <MessageCircle className="w-4 h-4" />
            Message Host
          </Button>
        </div>

        {/* View Booking CTA */}
        <Button
          onClick={viewBookings}
          size="lg"
          className="w-full"
          data-testid="button-view-booking"
        >
          View My Bookings
        </Button>
        
        <p className="text-sm text-gray-500 text-center mt-4">
          A confirmation email has been sent to your registered email address
        </p>
      </div>
    </div>
  );
}