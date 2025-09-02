import { Link, useLocation } from "wouter";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { Badge } from "@/components/ui/badge";
import { useAuthSheet } from "@/hooks/useAuthSheet";
import AuthSheet from "@/components/auth-sheet";

export default function Header() {
  const [location] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, isAuthenticated, isLoading, signOut } = useAuth();
  const { isOpen: isAuthOpen, mode: authMode, openSheet: openAuthSheet, closeSheet: closeAuthSheet, toggleMode: toggleAuthMode } = useAuthSheet();

  return (
    <header className="sticky top-0 z-50 bg-background border-b border-border shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo and Brand */}
          <div className="flex items-center space-x-4">
            <Link href="/" className="flex items-center space-x-2" data-testid="link-home">
              <i className="fas fa-parking text-primary text-2xl"></i>
              <span className="text-xl font-bold text-foreground">Parq</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link 
              href="/search" 
              className={`transition-colors ${location === "/search" ? "text-primary" : "text-foreground hover:text-primary"}`}
              data-testid="link-find-parking"
            >
              Find Parking
            </Link>
            {isAuthenticated && (
              <Link 
                href="/bookings" 
                className={`transition-colors ${location === "/bookings" ? "text-primary" : "text-foreground hover:text-primary"}`}
                data-testid="link-bookings"
              >
                My Bookings
              </Link>
            )}
            {isAuthenticated && (
              <Link 
                href="/host-dashboard" 
                className={`transition-colors ${location === "/host-dashboard" ? "text-primary" : "text-foreground hover:text-primary"}`}
                data-testid="link-host-dashboard"
              >
                Host Dashboard
              </Link>
            )}
            {isAuthenticated && (
              <Link 
                href="/payouts" 
                className={`transition-colors ${location === "/payouts" ? "text-primary" : "text-foreground hover:text-primary"}`}
                data-testid="link-payouts"
              >
                Payouts
              </Link>
            )}
            <Link 
              href="/list-space" 
              className={`transition-colors ${location === "/list-space" ? "text-primary" : "text-foreground hover:text-primary"}`}
              data-testid="link-list-space"
            >
              List Your Space
            </Link>
            <Link 
              href="/features" 
              className={`transition-colors ${location === "/features" ? "text-primary" : "text-foreground hover:text-primary"}`}
              data-testid="link-features"
            >
              Features
            </Link>
            <Link 
              href="/features#features" 
              className="text-foreground hover:text-primary transition-colors" 
              data-testid="link-how-it-works"
            >
              How It Works
            </Link>
          </nav>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              data-testid="button-mobile-menu"
            >
              <i className={`fas ${mobileMenuOpen ? 'fa-times' : 'fa-bars'}`}></i>
            </Button>
          </div>

          {/* Desktop User Actions */}
          <div className="hidden md:flex items-center space-x-4">
            {isAuthenticated && (
              <Link 
                href="/list-space"
                className="text-foreground hover:text-primary transition-colors"
                data-testid="button-list-space-desktop"
              >
                List your space
              </Link>
            )}
            <div className="flex items-center space-x-2">
              {isLoading ? (
                <div className="animate-spin w-5 h-5 border-2 border-primary border-t-transparent rounded-full" />
              ) : isAuthenticated ? (
                <div className="flex items-center space-x-3">
                  <Link href="/profile">
                    <button className="flex items-center space-x-2 p-2 border border-border rounded-full hover:shadow-md transition-all" data-testid="button-user-menu">
                      {user?.user_metadata?.avatar_url ? (
                        <img 
                          src={user.user_metadata.avatar_url} 
                          alt="Profile" 
                          className="w-6 h-6 rounded-full object-cover"
                        />
                      ) : (
                        <i className="fas fa-user-circle text-muted-foreground text-xl"></i>
                      )}
                      <span className="text-sm font-medium text-foreground">
                        {user?.user_metadata?.full_name || user?.email?.split('@')[0] || "Account"}
                      </span>
                    </button>
                  </Link>
                  <button
                    onClick={() => signOut()}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                    data-testid="button-sign-out"
                  >
                    Sign Out
                  </button>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <Button 
                    onClick={() => openAuthSheet("signin")}
                    data-testid="button-login"
                  >
                    Sign In
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-border bg-background">
            <nav className="px-4 py-4 space-y-3">
              {/* Main Navigation */}
              <Link 
                href="/search" 
                className={`block py-2 px-3 rounded-lg transition-colors ${location === "/search" ? "bg-primary text-primary-foreground" : "text-foreground hover:bg-muted"}`}
                onClick={() => setMobileMenuOpen(false)}
                data-testid="link-mobile-find-parking"
              >
                <i className="fas fa-search mr-3"></i>
                Find Parking
              </Link>
              <Link 
                href="/list-space" 
                className={`block py-2 px-3 rounded-lg transition-colors ${location === "/list-space" ? "bg-primary text-primary-foreground" : "text-foreground hover:bg-muted"}`}
                onClick={() => setMobileMenuOpen(false)}
                data-testid="link-mobile-list-space"
              >
                <i className="fas fa-plus mr-3"></i>
                List Your Space
              </Link>
              <Link 
                href="/features" 
                className={`block py-2 px-3 rounded-lg transition-colors ${location === "/features" ? "bg-primary text-primary-foreground" : "text-foreground hover:bg-muted"}`}
                onClick={() => setMobileMenuOpen(false)}
                data-testid="link-mobile-features"
              >
                <i className="fas fa-star mr-3"></i>
                Features
              </Link>

              {/* Account Section */}
              {isAuthenticated ? (
                <>
                  <div className="border-t border-border my-3">
                    <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide pt-3 pb-2 px-3">
                      Account
                    </div>
                  </div>
                  <Link 
                    href="/bookings" 
                    className={`block py-2 px-3 rounded-lg transition-colors ${location === "/bookings" ? "bg-primary text-primary-foreground" : "text-foreground hover:bg-muted"}`}
                    onClick={() => setMobileMenuOpen(false)}
                    data-testid="link-mobile-bookings"
                  >
                    <i className="fas fa-calendar-alt mr-3"></i>
                    My Bookings
                  </Link>
                  <Link 
                    href="/profile"
                    className={`block py-2 px-3 rounded-lg transition-colors ${location === "/profile" ? "bg-primary text-primary-foreground" : "text-foreground hover:bg-muted"}`}
                    onClick={() => setMobileMenuOpen(false)}
                    data-testid="link-mobile-profile"
                  >
                    <i className="fas fa-user mr-3"></i>
                    {user?.user_metadata?.full_name ? `${user.user_metadata.full_name}'s Profile` : "Profile"}
                  </Link>
                  <button 
                    onClick={() => {
                      signOut();
                      setMobileMenuOpen(false);
                    }}
                    className="w-full text-left block py-2 px-3 rounded-lg text-red-600 hover:bg-red-50 dark:hover:bg-red-950 transition-colors"
                    data-testid="button-mobile-logout"
                  >
                    <i className="fas fa-sign-out-alt mr-3"></i>
                    Sign Out
                  </button>
                </>
              ) : (
                <>
                  <div className="border-t border-border my-3"></div>
                  <button 
                    onClick={() => {
                      openAuthSheet("signin");
                      setMobileMenuOpen(false);
                    }}
                    className="w-full text-left block py-2 px-3 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
                    data-testid="button-mobile-login"
                  >
                    <i className="fas fa-sign-in-alt mr-3"></i>
                    Sign In
                  </button>
                </>
              )}

              {/* Support Section */}
              <div className="border-t border-border my-3">
                <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide pt-3 pb-2 px-3">
                  Support
                </div>
              </div>
              <Link 
                href="/help" 
                className="block py-2 px-3 rounded-lg text-foreground hover:bg-muted transition-colors"
                onClick={() => setMobileMenuOpen(false)}
                data-testid="link-mobile-help"
              >
                <i className="fas fa-question-circle mr-3"></i>
                Help Center
              </Link>
              <a 
                href="mailto:support@parq.com" 
                className="block py-2 px-3 rounded-lg text-foreground hover:bg-muted transition-colors"
                onClick={() => setMobileMenuOpen(false)}
                data-testid="link-mobile-support"
              >
                <i className="fas fa-envelope mr-3"></i>
                Contact Support
              </a>
            </nav>
          </div>
        )}
      </div>

      {/* Auth Sheet */}
      <AuthSheet
        isOpen={isAuthOpen}
        onClose={closeAuthSheet}
        mode={authMode}
        onModeChange={toggleAuthMode}
      />
    </header>
  );
}
