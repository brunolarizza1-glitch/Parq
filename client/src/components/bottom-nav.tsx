import { Link, useLocation } from "wouter";
import { Search, Map, Calendar, Plus, User } from "lucide-react";

const tabs = [
  { path: "/search", label: "Find", icon: Search },
  { path: "/map", label: "Map", icon: Map },
  { path: "/bookings", label: "Trips", icon: Calendar },
  { path: "/list-space", label: "Host", icon: Plus },
  { path: "/profile", label: "Profile", icon: User },
];

export default function BottomNav() {
  const [location] = useLocation();

  return (
    <nav 
      className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 pb-safe"
      aria-label="Main navigation"
      role="navigation"
    >
      <div className="flex">
        {tabs.map((tab) => {
          const isActive = location === tab.path || 
            (tab.path === "/search" && location === "/") ||
            (tab.path === "/list-space" && location === "/host-signup");
          
          return (
            <Link
              key={tab.path}
              href={tab.path}
              className={`flex-1 flex flex-col items-center justify-center min-h-[48px] py-2 px-1 transition-colors touch-target ${
                isActive
                  ? "text-primary bg-primary/5 dark:bg-primary/10"
                  : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
              }`}
              data-testid={`tab-${tab.label.toLowerCase()}`}
              aria-label={`${tab.label} navigation tab`}
              aria-current={isActive ? "page" : undefined}
              role="tab"
            >
              <tab.icon 
                className="w-6 h-6 mb-1" 
                aria-hidden="true"
              />
              <span className="text-xs font-medium">{tab.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}