import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Link } from "wouter";
import { ArrowLeft, Home, DollarSign, Calendar, Check, Shield } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { profileSetupSchema, type ProfileSetup } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";

const hostSignupSchema = profileSetupSchema.extend({
  agreedToTerms: z.boolean().refine((val) => val === true, "Must agree to terms"),
  addressVerified: z.boolean().refine((val) => val === true, "Address verification required"),
});

type HostSignup = z.infer<typeof hostSignupSchema>;

export default function HostSignup() {
  const { toast } = useToast();

  const form = useForm<HostSignup>({
    resolver: zodResolver(hostSignupSchema),
    defaultValues: {
      userType: "lister",
      firstName: "",
      lastName: "",
      phoneNumber: "",
      dateOfBirth: "",
      address: "",
      city: "",
      state: "",
      zipCode: "",
      bio: "",
      marketingOptIn: false,
      agreedToTerms: false,
      addressVerified: false,
    },
  });

  const onSubmit = async (data: HostSignup) => {
    try {
      // Store the host signup data for completion after auth
      localStorage.setItem('pendingHostSignup', JSON.stringify(data));
      // Redirect to list-space page which will trigger auth
      window.location.href = "/list-space";
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create host account. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 flex items-center justify-center p-4">
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
            Become a Parq Host
          </CardTitle>
          <CardDescription className="text-lg mb-6">
            Earn money by sharing your parking space with drivers
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
                <FormField
                  control={form.control}
                  name="dateOfBirth"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Date of Birth</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} data-testid="input-date-of-birth" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Address Information */}
              <div className="space-y-4">
                <Label className="text-base font-semibold">Property Address</Label>
                <p className="text-sm text-gray-600">
                  This is where your parking space is located. We'll verify this address for security.
                </p>
                
                <FormField
                  control={form.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Street Address</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="123 Main Street" data-testid="input-address" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="city"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>City</FormLabel>
                        <FormControl>
                          <Input {...field} data-testid="input-city" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="state"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>State</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="CA" data-testid="input-state" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="zipCode"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>ZIP Code</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="12345" data-testid="input-zip" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* Bio */}
              <FormField
                control={form.control}
                name="bio"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>About Your Space (Optional)</FormLabel>
                    <FormControl>
                      <textarea 
                        {...field}
                        className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        placeholder="Tell drivers about your parking space, any special instructions, or nearby landmarks..."
                        data-testid="textarea-bio"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Verification Checkboxes */}
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="addressVerified"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4 bg-green-50">
                      <FormControl>
                        <Checkbox 
                          checked={field.value} 
                          onCheckedChange={field.onChange}
                          data-testid="checkbox-address-verified"
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel className="flex items-center">
                          <Shield className="w-4 h-4 mr-2 text-green-600" />
                          Address Verification
                        </FormLabel>
                        <p className="text-sm text-gray-600">
                          I confirm that I own or have permission to rent out parking at this address, 
                          and that the address information provided is accurate.
                        </p>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="agreedToTerms"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                      <FormControl>
                        <Checkbox 
                          checked={field.value} 
                          onCheckedChange={field.onChange}
                          data-testid="checkbox-terms"
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>
                          I agree to the Terms of Service and Privacy Policy
                        </FormLabel>
                        <p className="text-sm text-gray-600">
                          By checking this box, I agree to Parq's host terms and conditions.
                        </p>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="marketingOptIn"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox 
                          checked={field.value} 
                          onCheckedChange={field.onChange}
                          data-testid="checkbox-marketing"
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>
                          Send me tips and updates about hosting (Optional)
                        </FormLabel>
                      </div>
                    </FormItem>
                  )}
                />
              </div>

              {/* Host Benefits */}
              <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                <h4 className="font-semibold text-gray-900">Host Benefits:</h4>
                <div className="space-y-2">
                  <div className="flex items-center space-x-3">
                    <Check className="w-4 h-4 text-green-600" />
                    <span className="text-sm text-gray-600">Earn $50-200+ per month with minimal effort</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Check className="w-4 h-4 text-green-600" />
                    <span className="text-sm text-gray-600">Stripe Connect payouts directly to your bank</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Check className="w-4 h-4 text-green-600" />
                    <span className="text-sm text-gray-600">Easy calendar management and availability control</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Check className="w-4 h-4 text-green-600" />
                    <span className="text-sm text-gray-600">Host protection and damage guarantee</span>
                  </div>
                </div>
              </div>

              <Button 
                type="submit" 
                className="w-full"
                disabled={form.formState.isSubmitting}
                data-testid="button-create-host-account"
              >
                {form.formState.isSubmitting ? (
                  <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2" />
                ) : (
                  <Home className="w-4 h-4 mr-2" />
                )}
                Create Host Account
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