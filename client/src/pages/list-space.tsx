import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import Footer from "@/components/footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { insertParkingSpaceSchema, type User } from "@shared/schema";
import { z } from "zod";
import LocationPicker from "@/components/location-picker";
import { useAuth } from "@/hooks/useAuth";
import { isUnauthorizedError } from "@/lib/authUtils";
import { 
  Shield, 
  CheckCircle, 
  AlertCircle, 
  Clock, 
  FileImage, 
  Car, 
  MapPin,
  Camera,
  Calendar,
  DollarSign,
  Check,
  ImageIcon,
  Plus,
  X
} from "lucide-react";
import { DriverLicenseUpload } from "@/components/DriverLicenseUpload";

// Individual step schemas
const addressSchema = z.object({
  address: z.string().min(1, "Street address is required"),
  unit: z.string().optional(),
  city: z.string().min(1, "City is required"),
  postalCode: z.string().min(1, "Postal code is required"),
  parkingNotes: z.string().optional(),
  latitude: z.string().min(1, "Location coordinates are required"),
  longitude: z.string().min(1, "Location coordinates are required"),
});

const spaceTypeSchema = z.object({
  spaceType: z.string().min(1, "Space type is required"),
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  // Feature toggles
  covered: z.boolean().optional(),
  evCharger: z.boolean().optional(),
  securityCamera: z.boolean().optional(),
  access24_7: z.boolean().optional(),
  lighting: z.boolean().optional(),
  heightLimit: z.string().optional(),
});

const photosSchema = z.object({
  images: z.array(z.string()).max(6, "Maximum 6 photos allowed"),
});

const availabilitySchema = z.object({
  amenities: z.array(z.string()),
  accessInstructions: z.string().optional(),
  weeklySchedule: z.object({
    monday: z.object({ enabled: z.boolean(), startTime: z.string(), endTime: z.string() }).optional(),
    tuesday: z.object({ enabled: z.boolean(), startTime: z.string(), endTime: z.string() }).optional(),
    wednesday: z.object({ enabled: z.boolean(), startTime: z.string(), endTime: z.string() }).optional(),
    thursday: z.object({ enabled: z.boolean(), startTime: z.string(), endTime: z.string() }).optional(),
    friday: z.object({ enabled: z.boolean(), startTime: z.string(), endTime: z.string() }).optional(),
    saturday: z.object({ enabled: z.boolean(), startTime: z.string(), endTime: z.string() }).optional(),
    sunday: z.object({ enabled: z.boolean(), startTime: z.string(), endTime: z.string() }).optional(),
  }).optional(),
});

const priceSchema = z.object({
  pricePerHour: z.string().min(1, "Price is required"),
  minimumDuration: z.number().min(1).max(8),
  firstHourDiscount: z.boolean().optional(),
  discountPercentage: z.number().min(0).max(50).optional(),
});

type StepData = {
  address?: z.infer<typeof addressSchema>;
  spaceType?: z.infer<typeof spaceTypeSchema>;
  photos?: z.infer<typeof photosSchema>;
  availability?: z.infer<typeof availabilitySchema>;
  price?: z.infer<typeof priceSchema>;
};

type ChecklistStep = {
  id: keyof StepData;
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  completed: boolean;
};

export default function ListSpace() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user: authUser, isAuthenticated, isLoading: authLoading } = useAuth();
  const user = authUser as User | undefined;
  
  
  // Checklist state
  const [currentStep, setCurrentStep] = useState<keyof StepData | null>(null);
  const [stepData, setStepData] = useState<StepData>(() => {
    // Load from localStorage
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('parking-space-draft');
      return saved ? JSON.parse(saved) : {};
    }
    return {};
  });
  
  // Image handling for photos step
  const [currentImageUrl, setCurrentImageUrl] = useState("");
  const [showPreview, setShowPreview] = useState(false);
  const [publishedListingId, setPublishedListingId] = useState<string | null>(null);
  const [showSuccessScreen, setShowSuccessScreen] = useState(false);

  // Save to localStorage whenever stepData changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('parking-space-draft', JSON.stringify(stepData));
    }
  }, [stepData]);
  
  // Define checklist steps
  const steps: ChecklistStep[] = [
    {
      id: 'address',
      title: 'Address',
      icon: MapPin,
      completed: !!stepData.address
    },
    {
      id: 'spaceType',
      title: 'Space Type',
      icon: Car,
      completed: !!stepData.spaceType
    },
    {
      id: 'photos',
      title: 'Photos',
      icon: Camera,
      completed: !!stepData.photos
    },
    {
      id: 'availability',
      title: 'Availability',
      icon: Calendar,
      completed: !!stepData.availability
    },
    {
      id: 'price',
      title: 'Price',
      icon: DollarSign,
      completed: !!stepData.price
    }
  ];
  
  const allStepsCompleted = steps.every(step => step.completed);

  // Note: Removed auto-opening auth sheet to prevent conflicts with manual button clicks

  const createSpaceMutation = useMutation({
    mutationFn: async () => {
      // Combine all step data into final form
      const finalData = {
        ownerId: user?.id || "",
        ...stepData.address,
        ...stepData.spaceType,
        ...stepData.photos,
        ...stepData.availability,
        ...stepData.price,
        // Handle feature toggles
        covered: stepData.spaceType?.covered || false,
        evCharger: stepData.spaceType?.evCharger || false,
        securityCamera: stepData.spaceType?.securityCamera || false,
        access24_7: stepData.spaceType?.access24_7 || false,
        lighting: stepData.spaceType?.lighting || false,
        heightLimit: stepData.spaceType?.heightLimit || null,
        // Handle weekly schedule
        weeklySchedule: stepData.availability?.weeklySchedule || null,
        accessInstructions: stepData.availability?.accessInstructions || "",
        accessCode: null,
        accessNotes: null,
        accessImages: [],
      };
      
      return apiRequest("POST", "/api/parking-spaces", finalData);
    },
    onSuccess: (data: any) => {
      setPublishedListingId(data.id);
      setShowSuccessScreen(true);
      
      // Clear draft data
      setStepData({});
      localStorage.removeItem('parking-space-draft');
      
      // Invalidate and refetch parking spaces
      queryClient.invalidateQueries({ queryKey: ["/api/parking-spaces"] });
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
        description: "Failed to create listing. Please try again.",
        variant: "destructive",
      });
    },
  });

  const updateLicenseMutation = useMutation({
    mutationFn: async (imageUrl: string) => {
      await apiRequest("PUT", "/api/driver-license", { driverLicenseImageUrl: imageUrl });
    },
    onSuccess: () => {
      toast({
        title: "License Updated",
        description: "Your driver's license has been uploaded for verification.",
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
        title: "Upload Failed",
        description: "Failed to update driver's license. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleLicenseUpload = (imageUrl: string) => {
    updateLicenseMutation.mutate(imageUrl);
  };
  
  const openStepModal = (stepId: keyof StepData) => {
    setCurrentStep(stepId);
  };
  
  const closeStepModal = () => {
    setCurrentStep(null);
  };
  
  const handlePublish = () => {
    if (user?.verificationStatus !== "verified") {
      toast({
        title: "Verification Required",
        description: "You must be verified to list a parking space. Please upload your driver's license.",
        variant: "destructive",
      });
      return;
    }
    createSpaceMutation.mutate();
  };

  // Loading state
  if (authLoading) {
    return (
      <div className="min-h-screen bg-background">
        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-center py-16">
            <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // Not authenticated
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background">
        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-16">
            <Shield className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">Authentication Required</h2>
            <p className="text-muted-foreground mb-6">Please sign in to list your parking space</p>
            <Button 
              onClick={() => {
                const currentPath = window.location.pathname;
                window.location.href = `/login?redirect=${encodeURIComponent(currentPath)}`;
              }}
              data-testid="button-sign-in"
            >
              Sign In
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const getVerificationStatusCard = () => {
    const status = user?.verificationStatus || "unverified";
    
    switch (status) {
      case "verified":
        return (
          <Alert className="border-green-200 bg-green-50 dark:bg-green-900/20">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800 dark:text-green-200">
              <strong>Verified!</strong> You can create parking space listings.
            </AlertDescription>
          </Alert>
        );
      case "pending":
        return (
          <Alert className="border-yellow-200 bg-yellow-50 dark:bg-yellow-900/20">
            <Clock className="h-4 w-4 text-yellow-600" />
            <AlertDescription className="text-yellow-800 dark:text-yellow-200">
              <strong>Verification Pending</strong> Your driver's license is being reviewed. This usually takes 1-2 business days.
              You cannot create listings until verification is complete.
            </AlertDescription>
          </Alert>
        );
      case "rejected":
        return (
          <Alert className="border-red-200 bg-red-50 dark:bg-red-900/20">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800 dark:text-red-200">
              <strong>Verification Rejected</strong> Please upload a clear, valid driver's license.
              <div className="mt-3">
                <DriverLicenseUpload
                  onUploadComplete={handleLicenseUpload}
                  currentImageUrl={user?.driverLicenseImageUrl || undefined}
                >
                  <FileImage className="h-4 w-4 mr-2" />
                  Re-upload License
                </DriverLicenseUpload>
              </div>
            </AlertDescription>
          </Alert>
        );
      default:
        return (
          <Alert className="border-blue-200 bg-blue-50 dark:bg-blue-900/20">
            <Shield className="h-4 w-4 text-blue-600" />
            <AlertDescription className="text-blue-800 dark:text-blue-200">
              <strong>Verification Required</strong> To list parking spaces, you must upload your driver's license for identity verification.
              <div className="mt-3">
                <DriverLicenseUpload onUploadComplete={handleLicenseUpload}>
                  <FileImage className="h-4 w-4 mr-2" />
                  Upload Driver's License
                </DriverLicenseUpload>
              </div>
            </AlertDescription>
          </Alert>
        );
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">List Your Parking Space</h1>
          <p className="text-muted-foreground">Complete all steps to publish your listing</p>
        </div>

        {/* Verification Status */}
        <div className="mb-6">
          {getVerificationStatusCard()}
        </div>

        {/* Progress Checklist */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5" />
              Listing Progress
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {steps.map((step, index) => {
                const Icon = step.icon;
                return (
                  <div 
                    key={step.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-900 cursor-pointer transition-colors"
                    onClick={() => openStepModal(step.id)}
                    data-testid={`step-${step.id}`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        step.completed 
                          ? 'bg-green-100 dark:bg-green-900'
                          : 'bg-gray-100 dark:bg-gray-800'
                      }`}>
                        {step.completed ? (
                          <Check className="w-4 h-4 text-green-600 dark:text-green-400" />
                        ) : (
                          <Icon className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                        )}
                      </div>
                      <div>
                        <h3 className="font-medium">{step.title}</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {step.completed ? 'Completed' : 'Click to complete this step'}
                        </p>
                      </div>
                    </div>
                    <Button 
                      variant={step.completed ? "secondary" : "outline"}
                      size="sm"
                      data-testid={`button-${step.id}`}
                    >
                      {step.completed ? 'Edit' : 'Complete'}
                    </Button>
                  </div>
                );
              })}
            </div>
            
            {/* Preview & Publish Section */}
            <div className="mt-6 pt-6 border-t space-y-3">
              {/* Preview Button */}
              <Button 
                onClick={() => setShowPreview(true)}
                disabled={!allStepsCompleted}
                variant="outline"
                className="w-full"
                size="lg"
                data-testid="button-preview-listing"
              >
                Preview Listing
              </Button>
              
              {/* Publish Button */}
              <Button 
                onClick={handlePublish}
                disabled={!allStepsCompleted || createSpaceMutation.isPending}
                className="w-full"
                size="lg"
                data-testid="button-publish-listing"
              >
                {createSpaceMutation.isPending ? "Publishing..." : "Publish Listing"}
              </Button>
              
              {!allStepsCompleted && (
                <p className="text-sm text-center text-gray-600 dark:text-gray-400 mt-2">
                  Complete all steps above to preview and publish your listing
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </main>

      <Footer />

      {/* Step Modals */}
      {currentStep && (
        <StepModal
          step={currentStep}
          stepData={stepData}
          onSave={(data) => {
            setStepData(prev => ({ ...prev, [currentStep]: data }));
            closeStepModal();
          }}
          onClose={closeStepModal}
          currentImageUrl={currentImageUrl}
          setCurrentImageUrl={setCurrentImageUrl}
        />
      )}

      {/* Preview Modal */}
      {showPreview && (
        <ListingPreviewModal 
          stepData={stepData}
          onClose={() => setShowPreview(false)}
        />
      )}
      
      {/* Success Screen */}
      {showSuccessScreen && publishedListingId && (
        <PublishSuccessModal 
          listingId={publishedListingId}
          onClose={() => {
            setShowSuccessScreen(false);
            setPublishedListingId(null);
          }}
        />
      )}

    </div>
  );
}

// Step Modal Component
function StepModal({ 
  step, 
  stepData, 
  onSave, 
  onClose, 
  currentImageUrl, 
  setCurrentImageUrl 
}: {
  step: keyof StepData;
  stepData: StepData;
  onSave: (data: any) => void;
  onClose: () => void;
  currentImageUrl: string;
  setCurrentImageUrl: (url: string) => void;
}) {
  if (step === 'address') {
    return <AddressStepModal stepData={stepData} onSave={onSave} onClose={onClose} />;
  }
  
  if (step === 'spaceType') {
    return <SpaceTypeStepModal stepData={stepData} onSave={onSave} onClose={onClose} />;
  }
  
  if (step === 'photos') {
    return <PhotosStepModal 
      stepData={stepData} 
      onSave={onSave} 
      onClose={onClose}
      currentImageUrl={currentImageUrl}
      setCurrentImageUrl={setCurrentImageUrl}
    />;
  }
  
  if (step === 'availability') {
    return <AvailabilityStepModal stepData={stepData} onSave={onSave} onClose={onClose} />;
  }
  
  if (step === 'price') {
    return <PriceStepModal stepData={stepData} onSave={onSave} onClose={onClose} />;
  }
  
  return null;
}

// Address Step Modal
function AddressStepModal({ stepData, onSave, onClose }: {
  stepData: StepData;
  onSave: (data: any) => void;
  onClose: () => void;
}) {
  const form = useForm({
    resolver: zodResolver(addressSchema),
    defaultValues: stepData.address || {
      address: '',
      unit: '',
      city: '',
      postalCode: '',
      parkingNotes: '',
      latitude: '',
      longitude: ''
    }
  });

  const [validationAttempted, setValidationAttempted] = useState(false);

  const watchedAddress = form.watch('address');
  const watchedCity = form.watch('city');
  const watchedPostalCode = form.watch('postalCode');
  const formErrors = form.formState.errors;
  const hasRequiredFields = watchedAddress && watchedCity && watchedPostalCode;

  const handleSubmit = (data: any) => {
    setValidationAttempted(true);
    // Only proceed if all required fields are filled
    if (!data.address || !data.city || !data.postalCode) {
      return; // Form validation will show errors
    }
    onSave(data);
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto" data-testid="modal-address-step">
        <DialogHeader>
          <DialogTitle>Address Information</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            {/* Validation Alert */}
            {validationAttempted && Object.keys(formErrors).length > 0 && (
              <Alert className="border-red-200 bg-red-50 dark:bg-red-900/20">
                <AlertCircle className="h-4 w-4 text-red-600" />
                <AlertDescription className="text-red-800 dark:text-red-200">
                  <strong>Please fix the following errors:</strong>
                  <ul className="mt-1 ml-4 list-disc">
                    {formErrors.address && <li>Street address is required</li>}
                    {formErrors.city && <li>City is required</li>}
                    {formErrors.postalCode && <li>Postal code is required</li>}
                    {formErrors.latitude && <li>Please select a precise location on the map</li>}
                  </ul>
                </AlertDescription>
              </Alert>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Left Column - Form Fields */}
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Street Address *</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="123 Main St" 
                          {...field}
                          data-testid="input-address"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="unit"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Unit/Apt (Optional)</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Apt 4B, Unit 12" 
                          {...field}
                          data-testid="input-unit"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="grid grid-cols-2 gap-3">
                  <FormField
                    control={form.control}
                    name="city"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>City *</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="New York" 
                            {...field}
                            data-testid="input-city"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="postalCode"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Postal Code *</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="94105" 
                            {...field}
                            data-testid="input-postal-code"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <FormField
                  control={form.control}
                  name="parkingNotes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Parking Notes (Optional)</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="e.g., Spot #12, back alley, behind the blue building" 
                          {...field}
                          data-testid="textarea-parking-notes"
                          rows={3}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              {/* Right Column - Map Preview */}
              <div className="space-y-4">
                <div>
                  <FormLabel className="text-sm font-medium mb-3 block">Location Preview</FormLabel>
                  <div className="border rounded-lg p-4 bg-gray-50 dark:bg-gray-900 h-48 flex items-center justify-center relative">
                    {hasRequiredFields ? (
                      <div className="text-center space-y-2">
                        <div className="relative">
                          <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-3">
                            <MapPin className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                          </div>
                          <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                            <Check className="w-2 h-2 text-white" />
                          </div>
                        </div>
                        <div className="text-sm space-y-1">
                          <p className="font-medium text-foreground">{watchedAddress}</p>
                          {form.watch('unit') && <p className="text-sm text-gray-600 dark:text-gray-400">{form.watch('unit')}</p>}
                          <p className="text-gray-600 dark:text-gray-400">{watchedCity}, {watchedPostalCode}</p>
                        </div>
                        <div className="mt-2 px-3 py-1 bg-blue-100 dark:bg-blue-900 rounded-full">
                          <p className="text-xs text-blue-700 dark:text-blue-300 font-medium">📍 Mini Map Preview</p>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center text-gray-500">
                        <MapPin className="w-8 h-8 mx-auto mb-2 opacity-50" />
                        <p className="text-sm">Enter address details to see preview</p>
                        <p className="text-xs mt-1">Map will show your exact location</p>
                      </div>
                    )}
                  </div>
                  
                  {/* Address Summary */}
                  {hasRequiredFields && (
                    <div className="mt-3 p-3 bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400" />
                        <span className="text-sm font-medium text-green-800 dark:text-green-200">Address Complete</span>
                      </div>
                      <p className="text-xs text-green-700 dark:text-green-300">
                        Your parking space will be discoverable at this location
                      </p>
                    </div>
                  )}
                </div>
                
                <div>
                  <FormLabel className="text-sm font-medium mb-3 block">Precise Location Picker</FormLabel>
                  <LocationPicker
                    onLocationSelect={(location) => {
                      form.setValue("latitude", location.latitude);
                      form.setValue("longitude", location.longitude);
                      // Only update address if it's empty
                      if (!form.getValues("address")) {
                        form.setValue("address", location.address);
                      }
                    }}
                    defaultLatitude={form.getValues("latitude") || ""}
                    defaultLongitude={form.getValues("longitude") || ""}
                    defaultAddress={`${form.getValues("address")} ${form.getValues("city")}`}
                  />
                </div>
              </div>
            </div>
            
            <div className="flex gap-2 pt-4 border-t">
              <Button type="button" variant="outline" onClick={onClose} className="flex-1">
                Cancel
              </Button>
              <Button 
                type="submit" 
                className="flex-1" 
                data-testid="button-save-address"
                disabled={!hasRequiredFields || !form.watch('latitude') || !form.watch('longitude')}
              >
                {hasRequiredFields && form.watch('latitude') ? 'Save Address' : 'Complete Required Fields'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

// Space Type Step Modal
function SpaceTypeStepModal({ stepData, onSave, onClose }: {
  stepData: StepData;
  onSave: (data: any) => void;
  onClose: () => void;
}) {
  const form = useForm({
    resolver: zodResolver(spaceTypeSchema),
    defaultValues: stepData.spaceType || {
      spaceType: '',
      title: '',
      description: '',
      covered: false,
      evCharger: false,
      securityCamera: false,
      access24_7: false,
      lighting: false,
      heightLimit: ''
    }
  });

  const featureOptions = [
    { id: 'covered', label: 'Covered', description: 'Protected from weather' },
    { id: 'evCharger', label: 'EV Charger', description: 'Electric vehicle charging available' },
    { id: 'securityCamera', label: 'Security Camera', description: 'Monitored by security cameras' },
    { id: 'access24_7', label: '24/7 Access', description: 'Available around the clock' },
    { id: 'lighting', label: 'Lighting', description: 'Well-lit area for safety' }
  ];

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto" data-testid="modal-space-type-step">
        <DialogHeader>
          <DialogTitle>Space Type & Features</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSave)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Left Column - Basic Info */}
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Space Title</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="e.g., Downtown Covered Garage" 
                          {...field}
                          data-testid="input-title"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Describe your parking space, location benefits, and any special features..." 
                          {...field}
                          data-testid="textarea-description"
                          rows={4}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="spaceType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Space Type</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-space-type">
                            <SelectValue placeholder="Select space type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="driveway">Driveway</SelectItem>
                          <SelectItem value="garage">Garage</SelectItem>
                          <SelectItem value="lot">Lot</SelectItem>
                          <SelectItem value="street-permit">Street-permit (informational)</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="heightLimit"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Height Limit (Optional)</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="e.g., 6'6&quot;, 2.0m, No limit" 
                          {...field}
                          data-testid="input-height-limit"
                        />
                      </FormControl>
                      <FormMessage />
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Specify any height restrictions for vehicles
                      </p>
                    </FormItem>
                  )}
                />
              </div>
              
              {/* Right Column - Features */}
              <div className="space-y-4">
                <div>
                  <FormLabel className="text-base font-medium mb-4 block">Features</FormLabel>
                  <div className="space-y-3">
                    {featureOptions.map((feature) => (
                      <FormField
                        key={feature.id}
                        control={form.control}
                        name={feature.id as any}
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-start space-x-3 space-y-0 p-3 border rounded-lg">
                            <FormControl>
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                                data-testid={`checkbox-feature-${feature.id}`}
                              />
                            </FormControl>
                            <div className="flex-1">
                              <FormLabel className="text-sm font-medium">
                                {feature.label}
                              </FormLabel>
                              <p className="text-xs text-gray-600 dark:text-gray-400">
                                {feature.description}
                              </p>
                            </div>
                          </FormItem>
                        )}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex gap-2 pt-4 border-t">
              <Button type="button" variant="outline" onClick={onClose} className="flex-1">
                Cancel
              </Button>
              <Button type="submit" className="flex-1" data-testid="button-save-space-type">
                Save Details
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

// Photos Step Modal
function PhotosStepModal({ stepData, onSave, onClose, currentImageUrl, setCurrentImageUrl }: {
  stepData: StepData;
  onSave: (data: any) => void;
  onClose: () => void;
  currentImageUrl: string;
  setCurrentImageUrl: (url: string) => void;
}) {
  const [photos, setPhotos] = useState<string[]>(stepData.photos?.images || []);
  const [showShotList, setShowShotList] = useState(false);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  const form = useForm({
    resolver: zodResolver(photosSchema),
    defaultValues: stepData.photos || { images: [] }
  });

  const shotListTips = [
    { title: "Entrance", description: "Show how to enter the parking area" },
    { title: "Space", description: "Clear view of the actual parking space" },
    { title: "Signage", description: "Any relevant signs or markers" },
    { title: "Landmarks", description: "Nearby buildings or reference points" }
  ];

  const handleAddPhoto = () => {
    if (photos.length < 6) {
      const newPhotos = [...photos, `placeholder-${Date.now()}`];
      setPhotos(newPhotos);
      form.setValue('images', newPhotos);
    }
  };

  const handleRemovePhoto = (index: number) => {
    const newPhotos = photos.filter((_, i) => i !== index);
    setPhotos(newPhotos);
    form.setValue('images', newPhotos);
  };

  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    if (draggedIndex === null) return;
    
    const newPhotos = [...photos];
    const draggedPhoto = newPhotos[draggedIndex];
    newPhotos.splice(draggedIndex, 1);
    newPhotos.splice(dropIndex, 0, draggedPhoto);
    
    setPhotos(newPhotos);
    form.setValue('images', newPhotos);
    setDraggedIndex(null);
  };

  const handleSubmit = (data: any) => {
    onSave({ images: photos });
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto" data-testid="modal-photos-step">
        <DialogHeader className="flex flex-row items-center justify-between">
          <DialogTitle>Photos</DialogTitle>
          <Button 
            type="button" 
            variant="outline" 
            size="sm"
            onClick={() => setShowShotList(!showShotList)}
            data-testid="button-shot-list-toggle"
          >
            <Camera className="w-4 h-4 mr-2" />
            Shot List Tips
          </Button>
        </DialogHeader>
        
        {showShotList && (
          <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-4" data-testid="shot-list-overlay">
            <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-3">📸 Shot List Tips</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {shotListTips.map((tip, index) => (
                <div key={index} className="flex items-start space-x-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                  <div>
                    <p className="font-medium text-blue-900 dark:text-blue-100">{tip.title}</p>
                    <p className="text-sm text-blue-700 dark:text-blue-300">{tip.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Upload up to 6 photos ({photos.length}/6)
                </p>
                {photos.length < 6 && (
                  <Button 
                    type="button" 
                    onClick={handleAddPhoto}
                    size="sm"
                    data-testid="button-add-photo"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Photo
                  </Button>
                )}
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {photos.map((photo, index) => (
                  <div
                    key={index}
                    className="relative aspect-square border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800 cursor-move hover:border-gray-400 transition-colors group"
                    draggable
                    onDragStart={(e) => handleDragStart(e, index)}
                    onDragOver={handleDragOver}
                    onDrop={(e) => handleDrop(e, index)}
                    data-testid={`photo-slot-${index}`}
                  >
                    <div className="absolute inset-0 flex flex-col items-center justify-center p-4">
                      <ImageIcon className="w-8 h-8 text-gray-400 mb-2" />
                      <p className="text-xs text-gray-500 text-center">Photo {index + 1}</p>
                      <p className="text-xs text-gray-400 text-center mt-1">Drag to reorder</p>
                    </div>
                    
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      className="absolute top-2 right-2 w-6 h-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => handleRemovePhoto(index)}
                      data-testid={`button-remove-photo-${index}`}
                    >
                      <X className="w-3 h-3" />
                    </Button>
                    
                    {index === 0 && (
                      <div className="absolute top-2 left-2 bg-blue-500 text-white text-xs px-2 py-1 rounded">
                        Cover
                      </div>
                    )}
                  </div>
                ))}
                
                {photos.length === 0 && (
                  <div className="col-span-2 md:col-span-3">
                    <div className="text-center p-8 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800">
                      <Camera className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-lg font-medium text-gray-600 dark:text-gray-400">No photos yet</p>
                      <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">Add photos to showcase your parking space</p>
                      <Button 
                        type="button" 
                        onClick={handleAddPhoto}
                        className="mt-4"
                        data-testid="button-add-first-photo"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Add Your First Photo
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            <div className="flex gap-2 pt-4 border-t">
              <Button type="button" variant="outline" onClick={onClose} className="flex-1">
                Cancel
              </Button>
              <Button type="submit" className="flex-1" data-testid="button-save-photos">
                Save Photos
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

// Availability Step Modal 
function AvailabilityStepModal({ stepData, onSave, onClose }: {
  stepData: StepData;
  onSave: (data: any) => void;
  onClose: () => void;
}) {
  const defaultSchedule = {
    monday: { enabled: false, startTime: '07:00', endTime: '19:00' },
    tuesday: { enabled: false, startTime: '07:00', endTime: '19:00' },
    wednesday: { enabled: false, startTime: '07:00', endTime: '19:00' },
    thursday: { enabled: false, startTime: '07:00', endTime: '19:00' },
    friday: { enabled: false, startTime: '07:00', endTime: '19:00' },
    saturday: { enabled: false, startTime: '07:00', endTime: '19:00' },
    sunday: { enabled: false, startTime: '07:00', endTime: '19:00' },
  };

  const form = useForm({
    resolver: zodResolver(availabilitySchema),
    defaultValues: stepData.availability || {
      amenities: [],
      accessInstructions: '',
      weeklySchedule: defaultSchedule
    }
  });
  
  const watchedSchedule = form.watch('weeklySchedule') || defaultSchedule;
  
  const amenitiesOptions = [
    { id: "covered", label: "Covered/Indoor" },
    { id: "security", label: "24/7 Security" },
    { id: "ev_charging", label: "EV Charging" },
    { id: "valet", label: "Valet Service" },
    { id: "accessible", label: "Wheelchair Accessible" },
    { id: "oversized", label: "Oversized Vehicles" },
  ];
  
  const dayNames = [
    { key: 'monday', label: 'Monday', short: 'Mon' },
    { key: 'tuesday', label: 'Tuesday', short: 'Tue' },
    { key: 'wednesday', label: 'Wednesday', short: 'Wed' },
    { key: 'thursday', label: 'Thursday', short: 'Thu' },
    { key: 'friday', label: 'Friday', short: 'Fri' },
    { key: 'saturday', label: 'Saturday', short: 'Sat' },
    { key: 'sunday', label: 'Sunday', short: 'Sun' },
  ];

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours, 10);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const getEnabledDays = () => {
    return dayNames.filter(day => watchedSchedule[day.key as keyof typeof watchedSchedule]?.enabled);
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto" data-testid="modal-availability-step">
        <DialogHeader>
          <DialogTitle>Availability & Amenities</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSave)} className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Left Column - Schedule */}
              <div className="space-y-4">
                <div>
                  <FormLabel className="text-base font-medium mb-4 block">Weekly Schedule</FormLabel>
                  <div className="space-y-3">
                    {dayNames.map((day) => (
                      <div key={day.key} className="flex items-center space-x-3 p-3 border rounded-lg">
                        <FormField
                          control={form.control}
                          name={`weeklySchedule.${day.key}.enabled` as any}
                          render={({ field }) => (
                            <FormItem className="flex items-center space-x-2 space-y-0">
                              <FormControl>
                                <Checkbox
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                  data-testid={`checkbox-day-${day.key}`}
                                />
                              </FormControl>
                              <FormLabel className="text-sm font-medium min-w-[60px]">
                                {day.short}
                              </FormLabel>
                            </FormItem>
                          )}
                        />
                        
                        {watchedSchedule[day.key as keyof typeof watchedSchedule]?.enabled && (
                          <div className="flex items-center space-x-2 flex-1">
                            <FormField
                              control={form.control}
                              name={`weeklySchedule.${day.key}.startTime` as any}
                              render={({ field }) => (
                                <FormItem className="flex-1">
                                  <FormControl>
                                    <Input
                                      type="time"
                                      {...field}
                                      className="text-sm"
                                      data-testid={`input-start-time-${day.key}`}
                                    />
                                  </FormControl>
                                </FormItem>
                              )}
                            />
                            <span className="text-sm text-gray-500">to</span>
                            <FormField
                              control={form.control}
                              name={`weeklySchedule.${day.key}.endTime` as any}
                              render={({ field }) => (
                                <FormItem className="flex-1">
                                  <FormControl>
                                    <Input
                                      type="time"
                                      {...field}
                                      className="text-sm"
                                      data-testid={`input-end-time-${day.key}`}
                                    />
                                  </FormControl>
                                </FormItem>
                              )}
                            />
                          </div>
                        )}
                        
                        {!watchedSchedule[day.key as keyof typeof watchedSchedule]?.enabled && (
                          <span className="text-sm text-gray-400 flex-1">Unavailable</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              
              {/* Right Column - Preview & Amenities */}
              <div className="space-y-4">
                {/* Schedule Preview */}
                <div>
                  <FormLabel className="text-base font-medium mb-4 block">Schedule Preview</FormLabel>
                  <div className="border rounded-lg p-4 bg-gray-50 dark:bg-gray-900" data-testid="schedule-preview">
                    {getEnabledDays().length > 0 ? (
                      <div className="space-y-2">
                        <p className="text-sm font-medium text-green-700 dark:text-green-400">
                          Available {getEnabledDays().length} day{getEnabledDays().length !== 1 ? 's' : ''} per week
                        </p>
                        {getEnabledDays().map((day) => {
                          const daySchedule = watchedSchedule[day.key as keyof typeof watchedSchedule];
                          return (
                            <div key={day.key} className="flex justify-between text-sm">
                              <span className="font-medium">{day.label}</span>
                              <span className="text-gray-600 dark:text-gray-400">
                                {formatTime(daySchedule?.startTime || '07:00')} - {formatTime(daySchedule?.endTime || '19:00')}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        No days selected. Enable days above to see your schedule.
                      </p>
                    )}
                  </div>
                </div>
                
                {/* Amenities */}
                <div className="space-y-3">
                  <FormLabel className="text-base font-medium">Amenities</FormLabel>
                  <div className="grid grid-cols-1 gap-2">
                    {amenitiesOptions.map((amenity) => (
                      <FormField
                        key={amenity.id}
                        control={form.control}
                        name="amenities"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-start space-x-3 space-y-0 p-2 border rounded">
                            <FormControl>
                              <Checkbox
                                checked={field.value?.includes(amenity.id)}
                                onCheckedChange={(checked) => {
                                  const currentAmenities = field.value || [];
                                  if (checked) {
                                    field.onChange([...currentAmenities, amenity.id]);
                                  } else {
                                    field.onChange(currentAmenities.filter((a) => a !== amenity.id));
                                  }
                                }}
                                data-testid={`checkbox-amenity-${amenity.id}`}
                              />
                            </FormControl>
                            <FormLabel className="text-sm font-normal">
                              {amenity.label}
                            </FormLabel>
                          </FormItem>
                        )}
                      />
                    ))}
                  </div>
                </div>
                
                {/* Access Instructions */}
                <FormField
                  control={form.control}
                  name="accessInstructions"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Access Instructions</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="How do guests access the parking space? Include gate codes, key locations, etc." 
                          {...field}
                          data-testid="textarea-access-instructions"
                          rows={3}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
            
            <div className="flex gap-2 pt-4 border-t">
              <Button type="button" variant="outline" onClick={onClose} className="flex-1">
                Cancel
              </Button>
              <Button type="submit" className="flex-1" data-testid="button-save-availability">
                Save Availability
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

// Price Step Modal
function PriceStepModal({ stepData, onSave, onClose }: {
  stepData: StepData;
  onSave: (data: any) => void;
  onClose: () => void;
}) {
  const form = useForm({
    resolver: zodResolver(priceSchema),
    defaultValues: stepData.price || {
      pricePerHour: '',
      minimumDuration: 1,
      firstHourDiscount: false,
      discountPercentage: 0
    }
  });

  const watchedValues = form.watch();
  const hourlyRate = parseFloat(watchedValues.pricePerHour) || 0;
  const hasDiscount = watchedValues.firstHourDiscount;
  const discountPercent = watchedValues.discountPercentage || 0;

  // Calculate 4-hour earnings estimate
  const calculateEarnings = () => {
    if (hourlyRate === 0) return 0;
    
    let totalEarnings = 0;
    
    if (hasDiscount && discountPercent > 0) {
      // First hour with discount
      const firstHourRate = hourlyRate * (1 - discountPercent / 100);
      totalEarnings += firstHourRate;
      // Remaining 3 hours at full rate
      totalEarnings += hourlyRate * 3;
    } else {
      // All 4 hours at full rate
      totalEarnings = hourlyRate * 4;
    }
    
    return totalEarnings;
  };

  const estimatedEarnings = calculateEarnings();

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto" data-testid="modal-price-step">
        <DialogHeader>
          <DialogTitle>Pricing</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSave)} className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Left Column - Pricing Settings */}
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="pricePerHour"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Hourly Rate ($)</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          step="0.01" 
                          min="0" 
                          placeholder="10.00" 
                          {...field}
                          data-testid="input-price-per-hour"
                        />
                      </FormControl>
                      <FormMessage />
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Set your base hourly rate
                      </p>
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="minimumDuration"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Minimum Booking Duration</FormLabel>
                      <Select 
                        onValueChange={(value) => field.onChange(parseInt(value))} 
                        defaultValue={field.value?.toString()}
                      >
                        <FormControl>
                          <SelectTrigger data-testid="select-minimum-duration">
                            <SelectValue placeholder="Select minimum hours" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {[1, 2, 3, 4, 5, 6, 7, 8].map((hours) => (
                            <SelectItem key={hours} value={hours.toString()}>
                              {hours} hour{hours !== 1 ? 's' : ''}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Minimum time a customer must book
                      </p>
                    </FormItem>
                  )}
                />
                
                <div className="space-y-3">
                  <FormField
                    control={form.control}
                    name="firstHourDiscount"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center space-x-3 space-y-0 p-3 border rounded-lg">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                            data-testid="checkbox-first-hour-discount"
                          />
                        </FormControl>
                        <div className="flex-1">
                          <FormLabel className="text-sm font-medium">
                            First-Hour Discount (Placeholder)
                          </FormLabel>
                          <p className="text-xs text-gray-600 dark:text-gray-400">
                            Offer a discount on the first hour to attract customers
                          </p>
                        </div>
                      </FormItem>
                    )}
                  />
                  
                  {watchedValues.firstHourDiscount && (
                    <FormField
                      control={form.control}
                      name="discountPercentage"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Discount Percentage</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              min="0" 
                              max="50" 
                              placeholder="10" 
                              {...field}
                              onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                              data-testid="input-discount-percentage"
                            />
                          </FormControl>
                          <FormMessage />
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            Percentage off first hour (0-50%)
                          </p>
                        </FormItem>
                      )}
                    />
                  )}
                </div>
              </div>
              
              {/* Right Column - Earnings Estimator */}
              <div className="space-y-4">
                <div>
                  <FormLabel className="text-base font-medium mb-4 block">Sample Earnings (4 hours)</FormLabel>
                  <div className="border rounded-lg p-4 bg-gray-50 dark:bg-gray-900" data-testid="earnings-estimator">
                    {hourlyRate > 0 ? (
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-lg font-semibold text-green-700 dark:text-green-400">
                            ${estimatedEarnings.toFixed(2)}
                          </span>
                          <span className="text-sm text-gray-600 dark:text-gray-400">
                            for 4-hour booking
                          </span>
                        </div>
                        
                        <div className="space-y-2 text-sm">
                          <div className="border-t pt-2">
                            <p className="font-medium mb-2">Breakdown:</p>
                            {hasDiscount && discountPercent > 0 ? (
                              <>
                                <div className="flex justify-between">
                                  <span>First hour ({discountPercent}% off):</span>
                                  <span>${(hourlyRate * (1 - discountPercent / 100)).toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span>Next 3 hours @ ${hourlyRate}/hr:</span>
                                  <span>${(hourlyRate * 3).toFixed(2)}</span>
                                </div>
                              </>
                            ) : (
                              <div className="flex justify-between">
                                <span>4 hours @ ${hourlyRate}/hr:</span>
                                <span>${(hourlyRate * 4).toFixed(2)}</span>
                              </div>
                            )}
                          </div>
                          
                          <div className="border-t pt-2 text-xs text-gray-500 dark:text-gray-400">
                            <p>• Estimates are before any platform fees</p>
                            <p>• Actual earnings may vary based on demand</p>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-4">
                        <p className="text-gray-500 dark:text-gray-400">
                          Enter your hourly rate to see earnings estimate
                        </p>
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Pricing Tips */}
                <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                  <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">💰 Pricing Tips</h3>
                  <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
                    <li>• Research similar spaces in your area</li>
                    <li>• Consider location, amenities, and convenience</li>
                    <li>• Start competitive and adjust based on demand</li>
                    <li>• Higher minimum duration = more predictable income</li>
                  </ul>
                </div>
              </div>
            </div>
            
            <div className="flex gap-2 pt-4 border-t">
              <Button type="button" variant="outline" onClick={onClose} className="flex-1">
                Cancel
              </Button>
              <Button type="submit" className="flex-1" data-testid="button-save-price">
                Save Pricing
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

// Listing Preview Modal Component
function ListingPreviewModal({ stepData, onClose }: {
  stepData: StepData;
  onClose: () => void;
}) {
  // Create preview data from step data
  const previewData = {
    title: stepData.spaceType?.title || "Untitled Parking Space",
    description: stepData.spaceType?.description || "",
    address: stepData.address?.address || "",
    city: stepData.address?.city || "",
    pricePerHour: stepData.price?.pricePerHour || "0",
    images: stepData.photos?.images || [],
    spaceType: stepData.spaceType?.spaceType || "",
    amenities: stepData.availability?.amenities || [],
    // Feature toggles
    covered: stepData.spaceType?.covered,
    evCharger: stepData.spaceType?.evCharger,
    securityCamera: stepData.spaceType?.securityCamera,
    access24_7: stepData.spaceType?.access24_7,
    lighting: stepData.spaceType?.lighting,
    heightLimit: stepData.spaceType?.heightLimit,
    minimumDuration: stepData.price?.minimumDuration || 1,
    weeklySchedule: stepData.availability?.weeklySchedule
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto" data-testid="modal-preview-listing">
        <DialogHeader>
          <DialogTitle>Preview Your Listing</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Image Gallery */}
          {previewData.images.length > 0 && (
            <div className="space-y-2">
              <h3 className="font-semibold">Photos</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {previewData.images.map((image, index) => (
                  <div key={index} className="aspect-square rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800">
                    <img
                      src={image}
                      alt={`Preview ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* Basic Info */}
          <div className="space-y-4">
            <div>
              <h2 className="text-2xl font-bold">{previewData.title}</h2>
              <p className="text-gray-600 dark:text-gray-400">{previewData.address}, {previewData.city}</p>
            </div>
            
            <div className="flex items-center gap-4 text-sm">
              <span className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-1 rounded">
                {previewData.spaceType}
              </span>
              <span className="font-semibold text-lg">${previewData.pricePerHour}/hour</span>
              <span className="text-gray-600 dark:text-gray-400">
                Min. {previewData.minimumDuration}h booking
              </span>
            </div>
          </div>
          
          {/* Description */}
          {previewData.description && (
            <div>
              <h3 className="font-semibold mb-2">Description</h3>
              <p className="text-gray-700 dark:text-gray-300">{previewData.description}</p>
            </div>
          )}
          
          {/* Features */}
          <div>
            <h3 className="font-semibold mb-2">Features</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm">
              {previewData.covered && (
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4" />
                  <span>Covered</span>
                </div>
              )}
              {previewData.evCharger && (
                <div className="flex items-center gap-2">
                  <Car className="w-4 h-4" />
                  <span>EV Charger</span>
                </div>
              )}
              {previewData.securityCamera && (
                <div className="flex items-center gap-2">
                  <Camera className="w-4 h-4" />
                  <span>Security Camera</span>
                </div>
              )}
              {previewData.access24_7 && (
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  <span>24/7 Access</span>
                </div>
              )}
              {previewData.lighting && (
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4" />
                  <span>Well Lit</span>
                </div>
              )}
              {previewData.heightLimit && (
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" />
                  <span>Height limit: {previewData.heightLimit}</span>
                </div>
              )}
            </div>
          </div>
          
          {/* Availability Preview */}
          {previewData.weeklySchedule && (
            <div>
              <h3 className="font-semibold mb-2">Available Hours</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                {Object.entries(previewData.weeklySchedule).map(([day, schedule]) => {
                  if (!schedule?.enabled) return null;
                  return (
                    <div key={day} className="flex justify-between">
                      <span className="capitalize font-medium">{day}:</span>
                      <span>{schedule.startTime} - {schedule.endTime}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
        
        <div className="flex gap-2 pt-4 border-t">
          <Button variant="outline" onClick={onClose} className="flex-1">
            Close Preview
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Publish Success Modal Component  
function PublishSuccessModal({ listingId, onClose }: {
  listingId: string;
  onClose: () => void;
}) {
  const handleViewListing = () => {
    window.open(`/space/${listingId}`, "_blank");
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: "Check out my parking space!",
        url: `${window.location.origin}/space/${listingId}`
      });
    } else {
      // Fallback to copying URL to clipboard
      navigator.clipboard.writeText(`${window.location.origin}/space/${listingId}`);
      // Could add a toast here but keeping it simple
    }
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-md" data-testid="modal-publish-success">
        <div className="text-center space-y-6 py-4">
          {/* Success Icon */}
          <div className="mx-auto w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
            <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
          </div>
          
          {/* Success Message */}
          <div>
            <h2 className="text-2xl font-bold mb-2">🎉 Listing Published!</h2>
            <p className="text-gray-600 dark:text-gray-400">
              Your parking space is now live and available for bookings.
            </p>
          </div>
          
          {/* Action Buttons */}
          <div className="space-y-3">
            <Button 
              onClick={handleViewListing}
              className="w-full"
              size="lg"
              data-testid="button-view-listing"
            >
              View My Listing
            </Button>
            
            <Button 
              onClick={handleShare}
              variant="outline"
              className="w-full"
              size="lg"
              data-testid="button-share-listing"
            >
              Share Listing
            </Button>
          </div>
          
          {/* Next Steps */}
          <div className="bg-blue-50 dark:bg-blue-950 rounded-lg p-4 text-left">
            <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">What is Next?</h3>
            <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
              <li>• Your listing will appear in search results immediately</li>
              <li>• You will receive notifications for new bookings</li>
              <li>• You can edit your listing anytime from your dashboard</li>
            </ul>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
