import { ReactNode } from "react";
import Header from "@/components/header";
import BottomNav from "@/components/bottom-nav";
import { useLocation } from "wouter";

interface AppShellProps {
  children: ReactNode;
}

export default function AppShell({ children }: AppShellProps) {
  const [location] = useLocation();
  
  // Show bottom nav on main app screens
  const showBottomNav = ["/search", "/map", "/bookings", "/list-space", "/profile", "/host-signup"].includes(location);
  
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className={showBottomNav ? "pb-16" : ""}>
        {children}
      </main>
      {showBottomNav && <BottomNav />}
    </div>
  );
}