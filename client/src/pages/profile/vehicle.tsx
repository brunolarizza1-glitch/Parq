import { useEffect } from "react";
import { Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useErrorToast } from "@/hooks/use-error-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import Footer from "@/components/footer";
import { type User, insertVehicleSchema } from "@shared/schema";
import { ArrowLeft, Car, CheckCircle, User as UserIcon, Save } from "lucide-react";
import { z } from "zod";

type VehicleFormData = z.infer<typeof insertVehicleSchema>;

export default function ProfileVehicle() {
  const { user: authUser, isAuthenticated, isLoading: authLoading } = useAuth();
  const user = authUser as User | undefined;
  const { toast } = useToast();
  const { showError, showUnexpectedError } = useErrorToast();
  const queryClient = useQueryClient();

  const form = useForm<VehicleFormData>({
    resolver: zodResolver(insertVehicleSchema),
    defaultValues: {
      make: "",
      model: "",
      color: "",
      licensePlate: "",
      userId: user?.id || ""
    },
  });

  // Update form when user data loads
  useEffect(() => {
    if (user) {
      form.reset({
        make: user.vehicleMake || "",
        model: user.vehicleModel || "",
        color: user.vehicleColor || "",
        licensePlate: user.vehicleLicensePlate || "",
        userId: user.id
      });
    }
  }, [user, form]);

  const updateVehicleMutation = useMutation({
    mutationFn: async (data: VehicleFormData) => {
      return apiRequest("PUT", `/api/users/${user?.id}/vehicle`, {
        vehicleMake: data.make,
        vehicleModel: data.model,
        vehicleColor: data.color,
        vehicleLicensePlate: data.licensePlate
      });
    },
    onSuccess: () => {
      toast({
        title: "Vehicle Updated",
        description: "Your vehicle information has been saved successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      form.reset(form.getValues()); // Reset dirty state
    },
    onError: (error) => {
      showError(error, "Failed to update vehicle information");
    },
  });

  const onSubmit = (data: VehicleFormData) => {
    updateVehicleMutation.mutate(data);
  };

  // Calculate completeness
  const watchedValues = form.watch();
  const filledFields = Object.entries(watchedValues)
    .filter(([key, value]) => key !== 'userId' && value && String(value).trim() !== "")
    .length;
  const totalFields = 4; // make, model, color, licensePlate
  const completeness = Math.round((filledFields / totalFields) * 100);
  const isComplete = completeness === 100;

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full" />
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
            <p className="text-muted-foreground mb-6">Please sign in to manage your vehicle</p>
            <Button asChild>
              <a href="/api/login">Sign In</a>
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <main className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link href="/profile" className="inline-flex items-center text-muted-foreground hover:text-foreground mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Profile
          </Link>
          <h1 className="text-3xl font-bold text-foreground">Vehicle Information</h1>
          <p className="text-muted-foreground">Required for booking parking spaces</p>
        </div>

        {/* Completeness Meter */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Car className="w-5 h-5" />
                Profile Completeness
              </CardTitle>
              <div className="flex items-center gap-2">
                {isComplete && <CheckCircle className="w-5 h-5 text-green-600" />}
                <Badge variant={isComplete ? "default" : "secondary"} className={isComplete ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200" : ""}>
                  {completeness}% Complete
                </Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Progress value={completeness} className="w-full" />
            <p className="text-sm text-muted-foreground mt-2">
              {isComplete 
                ? "Your vehicle profile is complete! You can now book parking spaces."
                : `Complete your vehicle information to enable booking. ${4 - filledFields} fields remaining.`
              }
            </p>
          </CardContent>
        </Card>

        {/* Vehicle Form */}
        <Card>
          <CardHeader>
            <CardTitle>Vehicle Details</CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="make"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Make *</FormLabel>
                        <FormControl>
                          <Input 
                            {...field} 
                            placeholder="Toyota"
                            data-testid="input-vehicle-make"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="model"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Model *</FormLabel>
                        <FormControl>
                          <Input 
                            {...field} 
                            placeholder="Camry"
                            data-testid="input-vehicle-model"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="color"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Color *</FormLabel>
                        <FormControl>
                          <Input 
                            {...field} 
                            placeholder="Silver"
                            data-testid="input-vehicle-color"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="licensePlate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>License Plate *</FormLabel>
                        <FormControl>
                          <Input 
                            {...field} 
                            placeholder="ABC123"
                            onChange={(e) => field.onChange(e.target.value.toUpperCase())}
                            data-testid="input-vehicle-license-plate"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Save Button */}
                <div className="flex justify-end pt-4">
                  <Button 
                    type="submit"
                    disabled={!form.formState.isDirty || updateVehicleMutation.isPending}
                    data-testid="button-save-vehicle"
                  >
                    {updateVehicleMutation.isPending ? (
                      <>
                        <div className="animate-spin w-4 h-4 border-2 border-current border-t-transparent rounded-full mr-2" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4 mr-2" />
                        Save Vehicle
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>

        {/* Booking Requirements */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Booking Requirements</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                {isComplete ? (
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                ) : (
                  <div className="w-5 h-5 border-2 border-muted-foreground rounded-full flex-shrink-0" />
                )}
                <div>
                  <p className="font-medium">Complete vehicle information</p>
                  <p className="text-sm text-muted-foreground">All vehicle fields must be filled to book parking</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="w-5 h-5 border-2 border-muted-foreground rounded-full flex-shrink-0" />
                <div>
                  <p className="font-medium text-muted-foreground">Valid driver's license</p>
                  <p className="text-sm text-muted-foreground">Coming in future update</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="w-5 h-5 border-2 border-muted-foreground rounded-full flex-shrink-0" />
                <div>
                  <p className="font-medium text-muted-foreground">Insurance verification</p>
                  <p className="text-sm text-muted-foreground">Coming in future update</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Vehicle Tips */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Tips</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0"></div>
              <div>
                <p className="font-medium">Accurate information</p>
                <p className="text-sm text-muted-foreground">Make sure your vehicle details match what you'll be driving</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0"></div>
              <div>
                <p className="font-medium">License plate format</p>
                <p className="text-sm text-muted-foreground">Enter your license plate exactly as it appears on your vehicle</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0"></div>
              <div>
                <p className="font-medium">Multiple vehicles</p>
                <p className="text-sm text-muted-foreground">Support for multiple vehicles coming in future update</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>

      <Footer />
    </div>
  );
}