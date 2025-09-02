import { useEffect } from "react";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Shield, FileText, Clock, CheckCircle, AlertCircle } from "lucide-react";
import { DriverLicenseUpload } from "@/components/DriverLicenseUpload";
import { useAuth } from "@/hooks/useAuth";
import { useAuthSheet } from "@/hooks/useAuthSheet";
import { useQuery } from "@tanstack/react-query";
import AuthSheet from "@/components/auth-sheet";

export default function VerificationRequired() {
  const [, setLocation] = useLocation();
  const { user: authUser, isAuthenticated, isLoading: authLoading } = useAuth();
  const { isOpen: isAuthOpen, mode: authMode, openSheet: openAuthSheet, closeSheet: closeAuthSheet, toggleMode: toggleAuthMode } = useAuthSheet();
  
  // Fetch complete user data from API
  const { data: user, isLoading: userLoading } = useQuery({
    queryKey: ["/api/auth/user"],
    enabled: isAuthenticated && !!authUser,
  });

  const isLoading = authLoading || userLoading;

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      openAuthSheet("signin");
    }
  }, [authLoading, isAuthenticated, openAuthSheet]);

  const handleVerificationComplete = () => {
    // Refresh user data to show updated verification status
    window.location.reload();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-pink-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const getVerificationStatus = () => {
    if (!user?.driverLicenseImageUrl) {
      return { status: "required", progress: 0 };
    }
    
    switch (user.verificationStatus) {
      case "pending":
        return { status: "pending", progress: 50 };
      case "approved":
        return { status: "approved", progress: 100 };
      case "rejected":
        return { status: "rejected", progress: 25 };
      default:
        return { status: "required", progress: 0 };
    }
  };

  const verification = getVerificationStatus();

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-orange-50 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <div className="w-20 h-20 mx-auto bg-pink-100 dark:bg-pink-900 rounded-full flex items-center justify-center mb-4">
              <Shield className="h-10 w-10 text-pink-600 dark:text-pink-400" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Identity Verification Required
            </h1>
            <p className="text-gray-600 dark:text-gray-300">
              To list parking spaces and ensure platform safety, we need to verify your identity
            </p>
          </div>

          <div className="mb-6">
            <div className="flex justify-between text-sm text-gray-600 dark:text-gray-300 mb-2">
              <span>Verification Progress</span>
              <span>{verification.progress}% complete</span>
            </div>
            <Progress value={verification.progress} className="h-2" />
          </div>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Driver's License Verification
              </CardTitle>
            </CardHeader>
            <CardContent>
              {verification.status === "required" && (
                <div className="space-y-4">
                  <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                    <h4 className="font-medium text-blue-900 dark:text-blue-300 mb-2">
                      What you need to upload:
                    </h4>
                    <ul className="text-sm text-blue-800 dark:text-blue-400 space-y-1">
                      <li>• A clear photo of your valid driver's license</li>
                      <li>• Both front and back sides visible</li>
                      <li>• All text must be clearly readable</li>
                      <li>• No glare or shadows obscuring information</li>
                    </ul>
                  </div>

                  <DriverLicenseUpload
                    onUploadComplete={handleVerificationComplete}
                    currentImageUrl={user?.driverLicenseImageUrl || undefined}
                  >
                    <FileText className="h-5 w-5 mr-2" />
                    Upload Driver's License
                  </DriverLicenseUpload>
                </div>
              )}

              {verification.status === "pending" && (
                <div className="text-center py-6">
                  <Clock className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Verification in Progress</h3>
                  <p className="text-gray-600 dark:text-gray-300 mb-4">
                    Your driver's license is being reviewed. This typically takes 24-48 hours.
                  </p>
                  <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      You'll receive an email notification once verification is complete.
                      You can start browsing spaces but won't be able to list until verified.
                    </p>
                  </div>
                </div>
              )}

              {verification.status === "approved" && (
                <div className="text-center py-6">
                  <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Verification Complete!</h3>
                  <p className="text-gray-600 dark:text-gray-300 mb-6">
                    Your identity has been verified. You can now list parking spaces.
                  </p>
                  <Button
                    onClick={() => setLocation("/")}
                    className="bg-pink-600 hover:bg-pink-700"
                    data-testid="button-continue-verified"
                  >
                    Start Using ParkEasy
                  </Button>
                </div>
              )}

              {verification.status === "rejected" && (
                <div className="space-y-4">
                  <div className="text-center py-4">
                    <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">Verification Failed</h3>
                    <p className="text-gray-600 dark:text-gray-300">
                      We couldn't verify your driver's license. Please upload a clearer image.
                    </p>
                  </div>

                  {user?.verificationNotes && (
                    <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                      <h4 className="font-medium text-red-900 dark:text-red-300 mb-2">
                        Feedback from our team:
                      </h4>
                      <p className="text-sm text-red-800 dark:text-red-400">
                        {user?.verificationNotes}
                      </p>
                    </div>
                  )}

                  <DriverLicenseUpload
                    onUploadComplete={handleVerificationComplete}
                    currentImageUrl={user?.driverLicenseImageUrl || undefined}
                  >
                    <FileText className="h-5 w-5 mr-2" />
                    Upload New License Image
                  </DriverLicenseUpload>
                </div>
              )}
            </CardContent>
          </Card>

          <div className="text-center">
            <Button
              variant="outline"
              onClick={() => setLocation("/")}
              data-testid="button-browse-spaces"
            >
              Browse Parking Spaces
            </Button>
          </div>

          <div className="mt-8 bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
            <h3 className="font-semibold mb-4">Why do we require verification?</h3>
            <div className="grid md:grid-cols-2 gap-4 text-sm text-gray-600 dark:text-gray-300">
              <div>
                <strong>Safety & Trust:</strong> Verified users create a safer community for everyone
              </div>
              <div>
                <strong>Legal Compliance:</strong> Required for property rental and payment processing
              </div>
              <div>
                <strong>Fraud Prevention:</strong> Protects against fake accounts and scams
              </div>
              <div>
                <strong>Quality Assurance:</strong> Ensures serious, committed space listers
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Auth Sheet */}
      <AuthSheet
        isOpen={isAuthOpen}
        onClose={closeAuthSheet}
        mode={authMode}
        onModeChange={toggleAuthMode}
      />
    </div>
  );
}