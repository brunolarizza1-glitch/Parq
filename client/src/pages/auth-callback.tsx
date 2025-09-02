import { useEffect } from "react";
import { useLocation } from "wouter";
import { supabase } from "@/lib/supabase";

export default function AuthCallback() {
  const [, setLocation] = useLocation();

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // Let Supabase handle the callback
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Auth callback error:', error);
          setLocation('/login');
          return;
        }

        if (data.session?.user) {
          // Get redirect URL from localStorage or default to home
          const redirectUrl = localStorage.getItem('auth_redirect') || '/home';
          localStorage.removeItem('auth_redirect');
          setLocation(redirectUrl);
        } else {
          setLocation('/login');
        }
      } catch (error) {
        console.error('Unexpected auth callback error:', error);
        setLocation('/login');
      }
    };

    handleAuthCallback();
  }, [setLocation]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="text-center">
        <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4" />
        <p className="text-gray-600">Completing sign in...</p>
      </div>
    </div>
  );
}