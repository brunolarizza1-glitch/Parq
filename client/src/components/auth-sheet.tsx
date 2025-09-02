import { useState } from "react";
import { X, Mail, Apple } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/lib/supabase";

interface AuthSheetProps {
  isOpen: boolean;
  onClose: () => void;
  mode?: "signin" | "signup";
  onModeChange?: (mode: "signin" | "signup") => void;
}

export default function AuthSheet({ 
  isOpen, 
  onClose, 
  mode = "signin",
  onModeChange 
}: AuthSheetProps) {
  console.log('=== AUTH SHEET COMPONENT RENDER ===');
  console.log('Props received:', { isOpen, mode });
  console.log('Will component render?', isOpen ? 'YES' : 'NO - returning null');
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { signIn, signUp, isSigningIn, isSigningUp } = useAuth();

  const handleEmailAuth = async () => {
    if (!email.trim() || !password.trim()) return;
    
    setIsLoading(true);
    if (mode === "signin") {
      signIn({ email, password });
    } else {
      signUp({ email, password });
    }
    onClose();
    setEmail("");
    setPassword("");
    setIsLoading(false);
  };

  const handleMagicLink = async () => {
    if (!email.trim()) return;
    
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          shouldCreateUser: mode === "signup"
        }
      });
      if (error) throw error;
      
      // Show success message
      alert(`Magic link sent to ${email}! Check your email to continue.`);
      onClose();
      setEmail("");
    } catch (error: any) {
      alert(`Error: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSocialAuth = async (provider: "google") => {
    try {
      const currentUrl = window.location.href;
      console.log('Redirecting to:', currentUrl);
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: currentUrl
        }
      });
      if (error) {
        console.error('OAuth error:', error);
        throw error;
      }
    } catch (error: any) {
      console.error('Social auth failed:', error);
      alert(`Error: ${error.message}`);
    }
  };

  if (!isOpen) {
    console.log('AuthSheet not rendering - isOpen is false');
    return null;
  }
  
  console.log('AuthSheet IS RENDERING - isOpen is true!');

  console.log('About to return AuthSheet JSX');
  
  return (
    <div 
      className="fixed inset-0 flex items-end justify-center"
      style={{ 
        zIndex: 9999, 
        backgroundColor: 'rgba(0,0,0,0.8)',
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0
      }}
      onClick={(e) => {
        console.log('Auth sheet backdrop clicked');
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      {/* Backdrop - removed as it's now handled by parent div */}
      
      {/* Bottom Sheet */}
      <div className={cn(
        "relative w-full max-w-sm bg-background rounded-t-2xl p-4 pb-6 shadow-xl border-t border-border",
        "transform transition-transform duration-300 ease-out",
"translate-y-0"
      )}
        style={{ 
          backgroundColor: '#ffffff',
          minHeight: '300px',
          zIndex: 10000,
          border: '3px solid #ff0000'
        }}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full hover:bg-muted/50 transition-colors"
          data-testid="button-close-auth"
        >
          <X className="w-5 h-5 text-muted-foreground" />
        </button>

        {/* Handle Bar */}
        <div className="w-12 h-1 bg-muted rounded-full mx-auto mb-4" />

        {/* Header */}
        <div className="text-center mb-4">
          <h2 className="mb-1 text-lg font-semibold">
            {mode === "signin" ? "Welcome back" : "Join Parq"}
          </h2>
          <p className="text-muted-foreground text-sm">
            {mode === "signin" 
              ? "Sign in to find parking" 
              : "Create an account to get started"
            }
          </p>
        </div>

        {/* Social Login */}
        <div className="mb-4">
          <Button
            variant="outline"
            size="default"
            className="w-full flex items-center justify-center gap-2"
            onClick={() => handleSocialAuth('google')}
            disabled={isLoading}
            data-testid="button-google-auth"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path fill="#4285f4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34a853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#fbbc05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#ea4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Continue with Google
          </Button>
        </div>

        <div className="relative mb-4">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-border" />
          </div>
          <div className="relative flex justify-center text-xs">
            <span className="bg-background px-2 text-muted-foreground">or</span>
          </div>
        </div>

        {/* Email Section */}
        <div className="space-y-3 mb-4">
          <div className="space-y-1">
            <label className="text-xs font-medium text-foreground">
              Email address
            </label>
            <Input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              data-testid="input-auth-email"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-foreground">
              Password
            </label>
            <Input
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              data-testid="input-auth-password"
            />
          </div>

          <Button
            variant="default"
            size="default"
            className="w-full"
            onClick={handleEmailAuth}
            disabled={isLoading || isSigningIn || isSigningUp || !email.trim() || !password.trim()}
            data-testid="button-email-auth"
          >
            {(isLoading || isSigningIn || isSigningUp)
              ? (mode === "signin" ? "Signing in..." : "Creating account...")
              : (mode === "signin" ? "Sign in" : "Create account")
            }
          </Button>

          <Button
            variant="outline"
            size="sm"
            className="w-full"
            onClick={handleMagicLink}
            disabled={isLoading || !email.trim()}
            data-testid="button-magic-link"
          >
            <Mail className="w-5 h-5 mr-2" />
            {isLoading 
              ? "Sending magic link..." 
              : "Send magic link"
            }
          </Button>
        </div>


        {/* Mode Toggle */}
        <div className="text-center mt-3">
          <p className="text-xs text-muted-foreground">
            {mode === "signin" ? "New to Parq? " : "Already have an account? "}
            <button
              onClick={() => onModeChange?.(mode === "signin" ? "signup" : "signin")}
              className="text-primary font-medium hover:underline"
              data-testid="button-toggle-mode"
            >
              {mode === "signin" ? "Sign up" : "Sign in"}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}