import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Link, useLocation } from "wouter";
import { ArrowLeft, Car, Shield, Plus, X, Check } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { driverSignupSchema, type DriverSignup } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";

export default function Signup() {
  const [, setLocation] = useLocation();
  const [licensePlates, setLicensePlates] = useState<string[]>([""]);
  const { toast } = useToast();

  const form = useForm<DriverSignup>({
    resolver: zodResolver(driverSignupSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phoneNumber: "",
      licensePlates: [""],
      insuranceAttested: false,
    },
  });

  const addLicensePlate = () => {
    if (licensePlates.length < 3) {
      setLicensePlates([...licensePlates, ""]);
    }
  };

  const removeLicensePlate = (index: number) => {
    if (licensePlates.length > 1) {
      const newPlates = licensePlates.filter((_, i) => i !== index);
      setLicensePlates(newPlates);
      form.setValue('licensePlates', newPlates);
    }
  };

  const updateLicensePlate = (index: number, value: string) => {
    const newPlates = [...licensePlates];
    newPlates[index] = value.toUpperCase();
    setLicensePlates(newPlates);
    form.setValue('licensePlates', newPlates);
  };

  const onSubmit = async (data: DriverSignup) => {
    try {
      // For now, redirect to Replit auth to complete registration
      // Later we'll store this data to complete profile after auth
      localStorage.setItem('pendingDriverSignup', JSON.stringify(data));
      window.location.href = "/welcome";
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create account. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl shadow-xl border-0">
        <CardHeader className="text-center pb-6">
          <div className="flex items-center justify-between mb-6">
            <Link href="/">
              <Button variant="ghost" size="sm" data-testid="button-back-home">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
            </Link>
          </div>

          <CardTitle className="text-3xl font-bold text-gray-900 mb-4">
            Join Parq as a Driver
          </CardTitle>
          <CardDescription className="text-lg mb-6">
            Find and book parking spaces instantly with our driver platform
          </CardDescription>
        </CardHeader>
        
        <CardContent className="px-8 pb-8">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Personal Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="firstName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>First Name</FormLabel>
                      <FormControl>
                        <Input {...field} data-testid="input-first-name" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="lastName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Last Name</FormLabel>
                      <FormControl>
                        <Input {...field} data-testid="input-last-name" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input type="email" {...field} data-testid="input-email" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="phoneNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone Number</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="(555) 123-4567" data-testid="input-phone" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* License Plates */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label className="text-base font-semibold">Vehicle License Plates</Label>
                  {licensePlates.length < 3 && (
                    <Button 
                      type="button" 
                      variant="outline" 
                      size="sm" 
                      onClick={addLicensePlate}
                      data-testid="button-add-plate"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add Vehicle
                    </Button>
                  )}
                </div>
                <p className="text-sm text-gray-600">
                  Enter the license plates of vehicles you'll be parking. This helps hosts identify your car.
                </p>
                
                {licensePlates.map((plate, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <Input
                      value={plate}
                      onChange={(e) => updateLicensePlate(index, e.target.value)}
                      placeholder="ABC1234"
                      className="font-mono text-center uppercase"
                      maxLength={8}
                      data-testid={`input-license-plate-${index}`}
                    />
                    {licensePlates.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeLicensePlate(index)}
                        data-testid={`button-remove-plate-${index}`}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>

              {/* Insurance Attestation */}
              <FormField
                control={form.control}
                name="insuranceAttested"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4 bg-blue-50">
                    <FormControl>
                      <Checkbox 
                        checked={field.value} 
                        onCheckedChange={field.onChange}
                        data-testid="checkbox-insurance"
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel className="flex items-center">
                        <Shield className="w-4 h-4 mr-2 text-blue-600" />
                        Insurance Verification
                      </FormLabel>
                      <p className="text-sm text-gray-600">
                        I attest that I have valid automobile insurance for all vehicles listed above, 
                        and understand that proof may be required for verification.
                      </p>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Benefits */}
              <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                <h4 className="font-semibold text-gray-900">What you get:</h4>
                <div className="space-y-2">
                  <div className="flex items-center space-x-3">
                    <Check className="w-4 h-4 text-green-600" />
                    <span className="text-sm text-gray-600">Instant booking with PIN verification</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Check className="w-4 h-4 text-green-600" />
                    <span className="text-sm text-gray-600">Spot Guarantee: Full refund + Uber credit if blocked</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Check className="w-4 h-4 text-green-600" />
                    <span className="text-sm text-gray-600">Apple Pay, Google Pay, and card payment options</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Check className="w-4 h-4 text-green-600" />
                    <span className="text-sm text-gray-600">24/7 customer support</span>
                  </div>
                </div>
              </div>

              <Button 
                type="submit" 
                className="w-full"
                disabled={form.formState.isSubmitting}
                data-testid="button-create-account"
              >
                {form.formState.isSubmitting ? (
                  <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2" />
                ) : (
                  <Car className="w-4 h-4 mr-2" />
                )}
                Create Driver Account
              </Button>
            </form>
          </Form>

          {/* Sign In Link */}
          <div className="text-center mt-8 pt-6 border-t border-gray-200">
            <p className="text-gray-600">
              Already have an account?{" "}
              <Link href="/login" className="text-blue-600 hover:underline font-semibold">
                Sign In
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}