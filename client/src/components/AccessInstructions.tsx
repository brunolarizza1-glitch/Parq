import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { 
  MapPin, 
  Key, 
  Info, 
  Eye, 
  EyeOff, 
  ChevronDown, 
  ChevronUp, 
  Copy,
  Check,
  Phone,
  Clock
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { ParkingSpace, Booking } from "@shared/schema";
import { format } from "date-fns";

interface AccessInstructionsProps {
  booking: Booking;
  parkingSpace: ParkingSpace;
}

export function AccessInstructions({ booking, parkingSpace }: AccessInstructionsProps) {
  const [showAccessCode, setShowAccessCode] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const { toast } = useToast();

  const copyAccessCode = async () => {
    if (parkingSpace.accessCode) {
      await navigator.clipboard.writeText(parkingSpace.accessCode);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
      toast({
        title: "Access code copied!",
        description: "The access code has been copied to your clipboard.",
      });
    }
  };

  const getBookingStatusBadge = () => {
    switch (booking.status) {
      case "confirmed":
        return <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300">Confirmed</Badge>;
      case "active":
        return <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">Active</Badge>;
      case "completed":
        return <Badge className="bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300">Completed</Badge>;
      default:
        return <Badge variant="secondary">{booking.status}</Badge>;
    }
  };

  const showInstructions = ["confirmed", "active"].includes(booking.status);

  if (!showInstructions) {
    return null;
  }

  return (
    <Card className="border-green-200 dark:border-green-800">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <MapPin className="h-5 w-5 text-green-600" />
            Access Instructions
          </CardTitle>
          {getBookingStatusBadge()}
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Quick Info */}
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-3">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-600 dark:text-gray-300">Check-in:</span>
              <div className="font-medium">{format(new Date(booking.startTime), "MMM d, h:mm a")}</div>
            </div>
            <div>
              <span className="text-gray-600 dark:text-gray-300">Check-out:</span>
              <div className="font-medium">{format(new Date(booking.endTime), "MMM d, h:mm a")}</div>
            </div>
          </div>
        </div>

        {/* Access Code */}
        {parkingSpace.accessCode && (
          <div className="border rounded-lg p-3">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-medium flex items-center gap-2">
                <Key className="h-4 w-4" />
                Access Code
              </h4>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowAccessCode(!showAccessCode)}
                data-testid="button-toggle-access-code"
              >
                {showAccessCode ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
            
            {showAccessCode ? (
              <div className="flex items-center gap-2">
                <code className="bg-gray-100 dark:bg-gray-800 px-3 py-2 rounded font-mono text-lg flex-1 text-center">
                  {parkingSpace.accessCode}
                </code>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={copyAccessCode}
                  data-testid="button-copy-access-code"
                >
                  {copiedCode ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
            ) : (
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Tap the eye icon to reveal your access code
              </p>
            )}
          </div>
        )}

        {/* Basic Instructions */}
        {parkingSpace.accessInstructions && (
          <div className="border rounded-lg p-3">
            <h4 className="font-medium flex items-center gap-2 mb-2">
              <Info className="h-4 w-4" />
              How to Access
            </h4>
            <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-line">
              {parkingSpace.accessInstructions}
            </p>
          </div>
        )}

        {/* Additional Details */}
        {(parkingSpace.accessNotes || parkingSpace.accessImages?.length) && (
          <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
            <CollapsibleTrigger asChild>
              <Button 
                variant="ghost" 
                className="w-full justify-between p-0 h-auto"
                data-testid="button-toggle-details"
              >
                <span className="text-sm font-medium">Additional Details</span>
                {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </Button>
            </CollapsibleTrigger>
            
            <CollapsibleContent className="space-y-3 mt-3">
              {parkingSpace.accessNotes && (
                <div className="border rounded-lg p-3">
                  <h5 className="font-medium mb-2">Important Notes</h5>
                  <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-line">
                    {parkingSpace.accessNotes}
                  </p>
                </div>
              )}
              
              {parkingSpace.accessImages && parkingSpace.accessImages.length > 0 && (
                <div className="border rounded-lg p-3">
                  <h5 className="font-medium mb-2">Reference Images</h5>
                  <div className="grid grid-cols-2 gap-2">
                    {parkingSpace.accessImages.map((image, index) => (
                      <Dialog key={index}>
                        <DialogTrigger asChild>
                          <button className="relative aspect-square rounded-lg overflow-hidden border hover:opacity-90 transition-opacity">
                            <img
                              src={image}
                              alt={`Access reference ${index + 1}`}
                              className="w-full h-full object-cover"
                            />
                          </button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl">
                          <DialogHeader>
                            <DialogTitle>Access Reference Image</DialogTitle>
                          </DialogHeader>
                          <img
                            src={image}
                            alt={`Access reference ${index + 1}`}
                            className="w-full rounded-lg"
                          />
                        </DialogContent>
                      </Dialog>
                    ))}
                  </div>
                </div>
              )}
            </CollapsibleContent>
          </Collapsible>
        )}

        {/* Emergency Contact */}
        <div className="border-t pt-3">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
              <Phone className="h-4 w-4" />
              <span>Need help?</span>
            </div>
            <Button variant="link" size="sm" className="p-0 h-auto">
              Contact Support
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}