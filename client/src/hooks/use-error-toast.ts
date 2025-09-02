import { useToast } from "@/hooks/use-toast";
import { useCallback } from "react";

export function useErrorToast() {
  const { toast } = useToast();

  const showError = useCallback((error: Error | string, title = "Something went wrong") => {
    const message = typeof error === 'string' ? error : error.message;
    
    toast({
      title,
      description: message,
      variant: "destructive",
    });
    
    // Log to console for debugging
    console.error("Error toast:", { title, message, error });
  }, [toast]);

  const showValidationError = useCallback((message: string) => {
    toast({
      title: "Please check your input",
      description: message,
      variant: "destructive",
    });
  }, [toast]);

  const showNetworkError = useCallback(() => {
    toast({
      title: "Connection Error",
      description: "Unable to connect to server. Please check your internet connection and try again.",
      variant: "destructive",
    });
  }, [toast]);

  const showUnexpectedError = useCallback(() => {
    toast({
      title: "Unexpected Error",
      description: "Something unexpected happened. Please try again or contact support if the problem persists.",
      variant: "destructive",
    });
  }, [toast]);

  return {
    showError,
    showValidationError,
    showNetworkError,
    showUnexpectedError
  };
}