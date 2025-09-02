import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import Footer from "@/components/footer";
import { useAuth } from "@/hooks/useAuth";
import { isUnauthorizedError } from "@/lib/authUtils";
import { type ParkingSpace, type Booking, type User } from "@shared/schema";
import { 
  Play, 
  Pause, 
  Edit, 
  Copy, 
  Trash2, 
  Eye,
  Calendar,
  MapPin,
  DollarSign,
  Clock,
  User as UserIcon,
  AlertTriangle,
  CheckCircle,
  Plus,
  Settings,
  Info
} from "lucide-react";
import { Link, useLocation } from "wouter";
import { EmptyState } from "@/components/ds";

export default function HostDashboard() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user: authUser, isAuthenticated, isLoading: authLoading } = useAuth();
  const [, navigate] = useLocation();
  
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [autoAcceptEnabled, setAutoAcceptEnabled] = useState(true);

  // Fetch user's parking spaces
  const { data: userSpaces, isLoading: spacesLoading } = useQuery<ParkingSpace[]>({
    queryKey: ["/api/users", authUser?.id, "parking-spaces"],
    queryFn: async () => {
      if (!authUser?.id) return [];
      const response = await fetch(`/api/users/${authUser.id}/parking-spaces`);
      if (!response.ok) throw new Error("Failed to fetch parking spaces");
      return response.json();
    },
    enabled: !!authUser?.id
  });

  // Fetch recent bookings for user's spaces
  const { data: recentBookings, isLoading: bookingsLoading } = useQuery<Booking[]>({
    queryKey: ["/api/bookings", "recent", authUser?.id],
    queryFn: async () => {
      if (!authUser?.id) return [];
      const response = await fetch(`/api/bookings?ownerId=${authUser.id}&limit=5`);
      if (!response.ok) throw new Error("Failed to fetch bookings");
      return response.json();
    },
    enabled: !!authUser?.id
  });

  // Pause/Resume listing mutation
  const toggleListingMutation = useMutation({
    mutationFn: async ({ id, isActive }: { id: string; isActive: boolean }) => {
      return apiRequest("PATCH", `/api/parking-spaces/${id}`, { isActive });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/users", authUser?.id, "parking-spaces"] });
      toast({
        title: "Success",
        description: "Listing status updated successfully.",
      });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "Please log in again to continue.",
          variant: "destructive",
        });
        return;
      }
      toast({
        title: "Error",
        description: "Failed to update listing status.",
        variant: "destructive",
      });
    },
  });

  // Delete listing mutation
  const deleteListingMutation = useMutation({
    mutationFn: async (id: string) => {
      return apiRequest("DELETE", `/api/parking-spaces/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/users", authUser?.id, "parking-spaces"] });
      setDeleteConfirmId(null);
      toast({
        title: "Success",
        description: "Listing deleted successfully.",
      });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "Please log in again to continue.",
          variant: "destructive",
        });
        return;
      }
      toast({
        title: "Error",
        description: "Failed to delete listing.",
        variant: "destructive",
      });
    },
  });

  // Duplicate listing mutation
  const duplicateListingMutation = useMutation({
    mutationFn: async (space: ParkingSpace) => {
      const duplicateData = {
        ...space,
        title: `${space.title} (Copy)`,
        isActive: false, // Start duplicated listings as paused
      };
      delete (duplicateData as any).id;
      delete (duplicateData as any).createdAt;
      delete (duplicateData as any).updatedAt;
      return apiRequest("POST", "/api/parking-spaces", duplicateData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/users", authUser?.id, "parking-spaces"] });
      toast({
        title: "Success",
        description: "Listing duplicated successfully.",
      });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "Please log in again to continue.",
          variant: "destructive",
        });
        return;
      }
      toast({
        title: "Error",
        description: "Failed to duplicate listing.",
        variant: "destructive",
      });
    },
  });

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background">
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-center py-16">
            <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background">
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-16">
            <UserIcon className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">Authentication Required</h2>
            <p className="text-muted-foreground mb-6">Please sign in to access your host dashboard</p>
            <Button asChild>
              <a href="/api/login">Sign In</a>
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const activeSpaces = userSpaces?.filter(space => space.isActive) || [];
  const pausedSpaces = userSpaces?.filter(space => !space.isActive) || [];

  const handleToggleListing = (space: ParkingSpace) => {
    toggleListingMutation.mutate({ id: space.id, isActive: !space.isActive });
  };

  const handleDuplicateListing = (space: ParkingSpace) => {
    duplicateListingMutation.mutate(space);
  };

  const handleDeleteListing = (id: string) => {
    deleteListingMutation.mutate(id);
  };

  return (
    <div className="min-h-screen bg-background">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2">Host Dashboard</h1>
              <p className="text-muted-foreground">Manage your parking space listings and bookings</p>
            </div>
            <Button asChild>
              <Link href="/list-space" data-testid="button-add-listing">
                <Plus className="w-4 h-4 mr-2" />
                Add New Listing
              </Link>
            </Button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Listings</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" data-testid="text-active-count">{activeSpaces.length}</div>
              <p className="text-xs text-muted-foreground">Available for booking</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Paused Listings</CardTitle>
              <Pause className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" data-testid="text-paused-count">{pausedSpaces.length}</div>
              <p className="text-xs text-muted-foreground">Temporarily unavailable</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Recent Bookings</CardTitle>
              <Calendar className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" data-testid="text-bookings-count">{recentBookings?.length || 0}</div>
              <p className="text-xs text-muted-foreground">Last 30 days</p>
            </CardContent>
          </Card>
        </div>

        {/* Booking Requests Section */}
        <Card className="mb-8">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5 text-blue-600" />
                Booking Requests
              </CardTitle>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">Auto-accept bookings</span>
                        <Switch 
                          checked={autoAcceptEnabled} 
                          onCheckedChange={setAutoAcceptEnabled}
                          data-testid="switch-auto-accept"
                        />
                      </div>
                      <Info className="w-4 h-4 text-muted-foreground" />
                    </div>
                  </TooltipTrigger>
                  <TooltipContent side="left" className="max-w-xs">
                    <p>When enabled, booking requests are automatically approved. This streamlines the booking process for your guests and reduces manual work for you.</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </CardHeader>
          <CardContent>
            {autoAcceptEnabled ? (
              <div className="text-center py-8">
                <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-foreground mb-2">Auto-accept is ON</h3>
                <p className="text-muted-foreground">New booking requests are automatically confirmed. You'll receive notifications for each booking.</p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="text-sm text-muted-foreground mb-4">
                  You have manual approval enabled. Review and respond to booking requests below.
                </div>
                {/* Sample pending requests when auto-accept is off */}
                <BookingRequestCard 
                  request={{
                    id: "req-1",
                    userId: "user-123",
                    spaceTitle: "Downtown Garage Spot",
                    startTime: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
                    endTime: new Date(Date.now() + 26 * 60 * 60 * 1000).toISOString(),
                    totalPrice: 25
                  }}
                />
                <BookingRequestCard 
                  request={{
                    id: "req-2",
                    userId: "user-456",
                    spaceTitle: "Covered Parking Space",
                    startTime: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString(),
                    endTime: new Date(Date.now() + 52 * 60 * 60 * 1000).toISOString(),
                    totalPrice: 40
                  }}
                />
              </div>
            )}
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Active Listings */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  Active Listings
                </CardTitle>
              </CardHeader>
              <CardContent>
                {spacesLoading ? (
                  <div className="space-y-4">
                    {Array.from({ length: 2 }).map((_, i) => (
                      <div key={i} className="animate-pulse">
                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
                        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                      </div>
                    ))}
                  </div>
                ) : activeSpaces.length === 0 ? (
                  <EmptyState
                    icon={<Plus className="w-16 h-16" />}
                    title="No active listings"
                    description="Start earning money with your parking space! List your spot in minutes and begin getting bookings."
                    ctaText="List Your Space"
                    onCtaClick={() => navigate("/list-space")}
                  />
                ) : (
                  <div className="space-y-4">
                    {activeSpaces.map((space) => (
                      <ListingCard 
                        key={space.id}
                        space={space}
                        onToggle={() => handleToggleListing(space)}
                        onDuplicate={() => handleDuplicateListing(space)}
                        onDelete={() => setDeleteConfirmId(space.id)}
                        isToggling={toggleListingMutation.isPending}
                        isDuplicating={duplicateListingMutation.isPending}
                      />
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Paused Listings */}
            {pausedSpaces.length > 0 && (
              <Card className="mt-6">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Pause className="w-5 h-5 text-orange-600" />
                    Paused Listings
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {pausedSpaces.map((space) => (
                      <ListingCard 
                        key={space.id}
                        space={space}
                        onToggle={() => handleToggleListing(space)}
                        onDuplicate={() => handleDuplicateListing(space)}
                        onDelete={() => setDeleteConfirmId(space.id)}
                        isToggling={toggleListingMutation.isPending}
                        isDuplicating={duplicateListingMutation.isPending}
                      />
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Recent Bookings */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-blue-600" />
                  Recent Bookings
                </CardTitle>
              </CardHeader>
              <CardContent>
                {bookingsLoading ? (
                  <div className="space-y-4">
                    {Array.from({ length: 3 }).map((_, i) => (
                      <div key={i} className="animate-pulse">
                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
                        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                      </div>
                    ))}
                  </div>
                ) : !recentBookings || recentBookings.length === 0 ? (
                  <EmptyState
                    icon={<Calendar className="w-16 h-16" />}
                    title="No bookings yet"
                    description="When people book your parking spots, you'll see all details and earnings here. Make sure your listings are live to get bookings!"
                    ctaText="Check My Listings"
                    onCtaClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                  />
                ) : (
                  <div className="space-y-4">
                    {recentBookings.map((booking) => (
                      <BookingCard key={booking.id} booking={booking} />
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <Footer />

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deleteConfirmId} onOpenChange={() => setDeleteConfirmId(null)}>
        <DialogContent data-testid="dialog-delete-confirm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-600" />
              Delete Listing
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this listing? This action cannot be undone and will cancel any active bookings.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setDeleteConfirmId(null)}
              disabled={deleteListingMutation.isPending}
            >
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={() => deleteConfirmId && handleDeleteListing(deleteConfirmId)}
              disabled={deleteListingMutation.isPending}
              data-testid="button-confirm-delete"
            >
              {deleteListingMutation.isPending ? "Deleting..." : "Delete Listing"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Listing Card Component
function ListingCard({ 
  space, 
  onToggle, 
  onDuplicate, 
  onDelete, 
  isToggling, 
  isDuplicating 
}: {
  space: ParkingSpace;
  onToggle: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
  isToggling: boolean;
  isDuplicating: boolean;
}) {
  return (
    <div className="border rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors" data-testid={`listing-card-${space.id}`}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h3 className="font-semibold text-lg">{space.title}</h3>
            <Badge variant={space.isActive ? "default" : "secondary"}>
              {space.isActive ? "Active" : "Paused"}
            </Badge>
          </div>
          
          <div className="space-y-1 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              <span>{space.address}, {space.city}</span>
            </div>
            <div className="flex items-center gap-2">
              <DollarSign className="w-4 h-4" />
              <span>${space.pricePerHour}/hour</span>
            </div>
            <div className="flex items-center gap-2">
              <Eye className="w-4 h-4" />
              <span>{space.spaceType}</span>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="flex items-center gap-2 ml-4">
          <Button
            size="sm"
            variant="outline"
            onClick={onToggle}
            disabled={isToggling}
            data-testid={`button-toggle-${space.id}`}
          >
            {space.isActive ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          </Button>
          
          <Button
            size="sm"
            variant="outline"
            asChild
            data-testid={`button-edit-${space.id}`}
          >
            <Link href={`/space/${space.id}/edit`}>
              <Edit className="w-4 h-4" />
            </Link>
          </Button>
          
          <Button
            size="sm"
            variant="outline"
            onClick={onDuplicate}
            disabled={isDuplicating}
            data-testid={`button-duplicate-${space.id}`}
          >
            <Copy className="w-4 h-4" />
          </Button>
          
          <Button
            size="sm"
            variant="outline"
            onClick={onDelete}
            className="text-red-600 hover:text-red-700"
            data-testid={`button-delete-${space.id}`}
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

// Booking Card Component
function BookingCard({ booking }: { booking: Booking }) {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "confirmed":
        return <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">Confirmed</Badge>;
      case "pending":
        return <Badge variant="secondary">Pending</Badge>;
      case "cancelled":
        return <Badge variant="destructive">Cancelled</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  return (
    <div className="border rounded-lg p-3" data-testid={`booking-card-${booking.id}`}>
      <div className="flex items-center justify-between mb-2">
        <span className="font-medium text-sm">User #{booking.userId.slice(-6)}</span>
        {getStatusBadge(booking.status)}
      </div>
      
      <div className="space-y-1 text-xs text-muted-foreground">
        <div className="flex items-center gap-2">
          <Calendar className="w-3 h-3" />
          <span>{new Date(booking.startTime).toLocaleDateString()}</span>
        </div>
        <div className="flex items-center gap-2">
          <Clock className="w-3 h-3" />
          <span>{new Date(booking.startTime).toLocaleTimeString()} - {new Date(booking.endTime).toLocaleTimeString()}</span>
        </div>
        <div className="flex items-center gap-2">
          <DollarSign className="w-3 h-3" />
          <span>${booking.totalPrice}</span>
        </div>
      </div>
    </div>
  );
}

// Booking Request Card Component
function BookingRequestCard({ request }: { 
  request: {
    id: string;
    userId: string;
    spaceTitle: string;
    startTime: string;
    endTime: string;
    totalPrice: number;
  }
}) {
  return (
    <div className="border rounded-lg p-4 bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800" data-testid={`request-card-${request.id}`}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
            Pending Review
          </Badge>
          <span className="text-sm font-medium">{request.spaceTitle}</span>
        </div>
        <span className="text-sm text-muted-foreground">User #{request.userId.slice(-6)}</span>
      </div>
      
      <div className="space-y-2 text-sm text-muted-foreground mb-4">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4" />
          <span>{new Date(request.startTime).toLocaleDateString()}</span>
        </div>
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4" />
          <span>{new Date(request.startTime).toLocaleTimeString()} - {new Date(request.endTime).toLocaleTimeString()}</span>
        </div>
        <div className="flex items-center gap-2">
          <DollarSign className="w-4 h-4" />
          <span>${request.totalPrice}</span>
        </div>
      </div>
      
      <div className="flex gap-2">
        <Button size="sm" className="flex-1" data-testid={`button-approve-${request.id}`}>
          Accept
        </Button>
        <Button size="sm" variant="outline" className="flex-1" data-testid={`button-decline-${request.id}`}>
          Decline
        </Button>
      </div>
    </div>
  );
}