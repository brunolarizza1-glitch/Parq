import { useState } from "react";

export function useAuthSheet() {
  const [isOpen, setIsOpen] = useState(false);
  const [mode, setMode] = useState<"signin" | "signup">("signin");

  const openSheet = (authMode: "signin" | "signup" = "signin") => {
    console.log('=== OPEN SHEET FUNCTION CALLED ===');
    console.log('Requested authMode:', authMode);
    console.log('Current state before update:', { isOpen, mode });
    
    console.log('Setting mode to:', authMode);
    setMode(authMode);
    
    console.log('Setting isOpen to true');
    setIsOpen(true);
    
    console.log('openSheet function completed');
  };

  const closeSheet = () => {
    setIsOpen(false);
  };

  const toggleMode = (newMode: "signin" | "signup") => {
    setMode(newMode);
  };

  return {
    isOpen,
    mode,
    openSheet,
    closeSheet,
    toggleMode,
  };
}