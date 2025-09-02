import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Link, useLocation } from "wouter";
import { ArrowLeft, Shield, Zap, Users } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/hooks/useAuth";

export default function Login() {
  const [isLoading, setIsLoading] = useState(false);
  const [, setLocation] = useLocation();
  const { user, isAuthenticated } = useAuth();

  // Get redirect URL from query params or default to home
  const getRedirectUrl = () => {
    const params = new URLSearchParams(window.location.search);
    return params.get('redirect') || '/home';
  };

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      setLocation(getRedirectUrl());
    }
  }, [isAuthenticated, user, setLocation]);

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    try {
      const redirectUrl = `${window.location.origin}${getRedirectUrl()}`;
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectUrl
        }
      });
      
      if (error) {
        console.error('Google sign-in error:', error);
        alert(`Sign-in failed: ${error.message}`);
      }
    } catch (error: any) {
      console.error('Unexpected error:', error);
      alert(`Unexpected error: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-xl border-0">
        <CardHeader className="text-center pb-8">
          <div className="flex items-center justify-between mb-6">
            <Link href="/">
              <Button variant="ghost" size="sm" data-testid="button-back-home">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
            </Link>
          </div>

          <CardTitle className="text-3xl font-bold text-gray-900 mb-4">
            Sign In to Parq
          </CardTitle>
          <CardDescription className="text-lg mb-6">
            New to Parq? We'll create your account automatically
          </CardDescription>
        </CardHeader>
        
        <CardContent className="px-8 pb-8">
          {/* Google Sign In Button */}
          <Button 
            onClick={handleGoogleSignIn}
            disabled={isLoading}
            className="w-full bg-white hover:bg-gray-50 text-gray-900 border border-gray-300 mb-6"
            data-testid="button-google-signin"
          >
            <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            {isLoading ? "Signing in..." : "Continue with Google"}
          </Button>

          {/* Features */}
          <div className="space-y-4 mb-6">
            <div className="flex items-center space-x-3">
              <Shield className="w-5 h-5 text-blue-600" />
              <span className="text-sm text-gray-600">Safe and secure</span>
            </div>
            <div className="flex items-center space-x-3">
              <Zap className="w-5 h-5 text-yellow-600" />
              <span className="text-sm text-gray-600">Quick and easy sign in</span>
            </div>
            <div className="flex items-center space-x-3">
              <Users className="w-5 h-5 text-green-600" />
              <span className="text-sm text-gray-600">Join thousands of users</span>
            </div>
          </div>

          {/* Info Section */}
          <div className="text-center mt-8 pt-6 border-t border-gray-200">
            <p className="text-gray-600 text-sm">
              New users will automatically create an account during sign in
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}