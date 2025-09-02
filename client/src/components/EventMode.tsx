import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { Calendar, Music, Trophy, Users, DollarSign, Clock } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

interface EventPricing {
  id: string;
  eventName: string;
  eventType: string;
  startDate: string;
  endDate: string;
  multiplier: number;
  isActive: boolean;
}

interface EventModeProps {
  spaceId: string;
  basePrice: number;
}

export function EventMode({ spaceId, basePrice }: EventModeProps) {
  const [isCreating, setIsCreating] = useState(false);
  const [newEvent, setNewEvent] = useState({
    eventName: "",
    eventType: "concert",
    startDate: "",
    endDate: "",
    multiplier: 1.5,
  });
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Mock data for demo - in real app would fetch from API
  const { data: eventPricings = [], isLoading } = useQuery<EventPricing[]>({
    queryKey: [`/api/event-pricing/space/${spaceId}`],
    queryFn: () => {
      // Mock data
      return Promise.resolve([
        {
          id: "1",
          eventName: "Warriors vs Lakers Game",
          eventType: "sports",
          startDate: "2025-09-15T18:00:00",
          endDate: "2025-09-15T23:00:00",
          multiplier: 2.0,
          isActive: true,
        },
        {
          id: "2", 
          eventName: "SF Jazz Festival",
          eventType: "concert",
          startDate: "2025-09-20T14:00:00",
          endDate: "2025-09-22T23:00:00",
          multiplier: 1.8,
          isActive: true,
        },
      ]);
    },
  });

  const createEventPricing = useMutation({
    mutationFn: (eventData: any) => apiRequest("POST", "/api/event-pricing", eventData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/event-pricing/space/${spaceId}`] });
      setIsCreating(false);
      setNewEvent({
        eventName: "",
        eventType: "concert",
        startDate: "",
        endDate: "",
        multiplier: 1.5,
      });
      toast({
        title: "Event pricing created!",
        description: "Your special event pricing is now active.",
      });
    },
  });

  const toggleEventPricing = useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      apiRequest("PATCH", `/api/event-pricing/${id}`, { isActive }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/event-pricing/space/${spaceId}`] });
    },
  });

  const getEventIcon = (type: string) => {
    switch (type) {
      case "concert": return <Music className="h-4 w-4 text-purple-600" />;
      case "sports": return <Trophy className="h-4 w-4 text-blue-600" />;
      case "conference": return <Users className="h-4 w-4 text-green-600" />;
      case "festival": return <Calendar className="h-4 w-4 text-orange-600" />;
      default: return <Calendar className="h-4 w-4 text-gray-600" />;
    }
  };

  const getEventTypeColor = (type: string) => {
    switch (type) {
      case "concert": return "bg-purple-100 text-purple-800";
      case "sports": return "bg-blue-100 text-blue-800";
      case "conference": return "bg-green-100 text-green-800";
      case "festival": return "bg-orange-100 text-orange-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  return (
    <Card data-testid="event-mode-card" className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5 text-orange-600" />
          Event Mode Pricing
        </CardTitle>
        <CardDescription>
          Automatically adjust pricing during special events like concerts, sports games, and festivals
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-4 p-4 bg-orange-50 rounded-lg">
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600">
              {eventPricings.filter(e => e.isActive).length}
            </div>
            <p className="text-sm text-gray-600">Active Events</p>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              +{Math.round((eventPricings.reduce((acc, e) => acc + e.multiplier, 0) / eventPricings.length - 1) * 100) || 0}%
            </div>
            <p className="text-sm text-gray-600">Avg. Premium</p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center text-2xl font-bold text-blue-600">
              <DollarSign className="h-5 w-5" />
              {((basePrice * 1.7) - basePrice).toFixed(0)}
            </div>
            <p className="text-sm text-gray-600">Extra/Hour</p>
          </div>
        </div>

        {/* Active Event Pricings */}
        {eventPricings.length > 0 && (
          <div>
            <h4 className="font-semibold mb-3">Event Pricing Rules</h4>
            <div className="space-y-3">
              {eventPricings.map((event) => (
                <div
                  key={event.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                  data-testid={`event-pricing-${event.id}`}
                >
                  <div className="flex items-start gap-3">
                    {getEventIcon(event.eventType)}
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium">{event.eventName}</span>
                        <span className={`text-xs px-2 py-1 rounded-full ${getEventTypeColor(event.eventType)}`}>
                          {event.eventType}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {formatDateTime(event.startDate)} - {formatDateTime(event.endDate)}
                        </span>
                        <span className="font-semibold text-green-600">
                          {event.multiplier}x pricing (${(basePrice * event.multiplier).toFixed(2)}/hr)
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={event.isActive}
                      onCheckedChange={(checked) =>
                        toggleEventPricing.mutate({ id: event.id, isActive: checked })
                      }
                      data-testid={`toggle-event-${event.id}`}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Create New Event Pricing */}
        {!isCreating ? (
          <Button
            onClick={() => setIsCreating(true)}
            className="w-full"
            data-testid="create-event-pricing-button"
          >
            <Calendar className="h-4 w-4 mr-2" />
            Add Event Pricing Rule
          </Button>
        ) : (
          <div className="space-y-4 p-4 border rounded-lg bg-gray-50">
            <h4 className="font-semibold">Create Event Pricing</h4>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="event-name">Event Name</Label>
                <Input
                  id="event-name"
                  value={newEvent.eventName}
                  onChange={(e) => setNewEvent({ ...newEvent, eventName: e.target.value })}
                  placeholder="e.g., Warriors Game"
                  data-testid="event-name-input"
                />
              </div>
              <div>
                <Label htmlFor="event-type">Event Type</Label>
                <Select
                  value={newEvent.eventType}
                  onValueChange={(value) => setNewEvent({ ...newEvent, eventType: value })}
                >
                  <SelectTrigger data-testid="event-type-select">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="concert">Concert/Music</SelectItem>
                    <SelectItem value="sports">Sports Game</SelectItem>
                    <SelectItem value="conference">Conference</SelectItem>
                    <SelectItem value="festival">Festival</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="start-date">Start Date & Time</Label>
                <Input
                  id="start-date"
                  type="datetime-local"
                  value={newEvent.startDate}
                  onChange={(e) => setNewEvent({ ...newEvent, startDate: e.target.value })}
                  data-testid="start-date-input"
                />
              </div>
              <div>
                <Label htmlFor="end-date">End Date & Time</Label>
                <Input
                  id="end-date"
                  type="datetime-local"
                  value={newEvent.endDate}
                  onChange={(e) => setNewEvent({ ...newEvent, endDate: e.target.value })}
                  data-testid="end-date-input"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="multiplier">Price Multiplier</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="multiplier"
                  type="number"
                  step="0.1"
                  min="1.0"
                  max="5.0"
                  value={newEvent.multiplier}
                  onChange={(e) => setNewEvent({ ...newEvent, multiplier: parseFloat(e.target.value) })}
                  className="w-20"
                  data-testid="multiplier-input"
                />
                <span className="text-sm text-gray-600">
                  x (${(basePrice * newEvent.multiplier).toFixed(2)}/hour)
                </span>
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                onClick={() => createEventPricing.mutate({ ...newEvent, spaceId })}
                disabled={!newEvent.eventName || !newEvent.startDate || !newEvent.endDate}
                className="flex-1"
                data-testid="save-event-pricing-button"
              >
                Create Event Pricing
              </Button>
              <Button
                onClick={() => setIsCreating(false)}
                variant="outline"
                data-testid="cancel-event-pricing-button"
              >
                Cancel
              </Button>
            </div>
          </div>
        )}

        {/* Event Suggestions */}
        <div className="p-4 bg-blue-50 rounded-lg">
          <h4 className="font-semibold mb-2 flex items-center gap-2">
            <Users className="h-4 w-4 text-blue-600" />
            Upcoming Local Events
          </h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between items-center">
              <span>Chase Center Warriors Game</span>
              <Button size="sm" variant="outline" className="text-xs">
                Add Pricing
              </Button>
            </div>
            <div className="flex justify-between items-center">
              <span>Outside Lands Music Festival</span>
              <Button size="sm" variant="outline" className="text-xs">
                Add Pricing
              </Button>
            </div>
            <div className="flex justify-between items-center">
              <span>Salesforce Conference</span>
              <Button size="sm" variant="outline" className="text-xs">
                Add Pricing
              </Button>
            </div>
          </div>
        </div>

        {/* Tips */}
        <div className="text-xs text-gray-500 bg-gray-50 p-3 rounded">
          <p className="font-semibold mb-1">Event Mode Tips:</p>
          <ul className="space-y-1">
            <li>• Monitor local event calendars for pricing opportunities</li>
            <li>• Set pricing 2-3 weeks before major events for maximum bookings</li>
            <li>• Consider transportation and walking distance to venues</li>
            <li>• Event pricing automatically returns to normal rates after the event</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}