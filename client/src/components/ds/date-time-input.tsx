import * as React from "react";
import { cn } from "@/lib/utils";
import { DSInput } from "./input";

export interface DateTimeInputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

const DSDateTimeInput = React.forwardRef<HTMLInputElement, DateTimeInputProps>(
  ({ className, label, ...props }, ref) => {
    return (
      <div className="space-y-1">
        {label && (
          <label className="text-caption font-medium text-foreground">
            {label}
          </label>
        )}
        <DSInput
          type="datetime-local"
          className={cn("text-body", className)}
          ref={ref}
          {...props}
        />
      </div>
    );
  }
);
DSDateTimeInput.displayName = "DSDateTimeInput";

export interface DateInputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

const DSDateInput = React.forwardRef<HTMLInputElement, DateInputProps>(
  ({ className, label, ...props }, ref) => {
    return (
      <div className="space-y-1">
        {label && (
          <label className="text-caption font-medium text-foreground">
            {label}
          </label>
        )}
        <DSInput
          type="date"
          className={cn("text-body", className)}
          ref={ref}
          {...props}
        />
      </div>
    );
  }
);
DSDateInput.displayName = "DSDateInput";

export interface TimeInputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

const DSTimeInput = React.forwardRef<HTMLInputElement, TimeInputProps>(
  ({ className, label, ...props }, ref) => {
    return (
      <div className="space-y-1">
        {label && (
          <label className="text-caption font-medium text-foreground">
            {label}
          </label>
        )}
        <DSInput
          type="time"
          className={cn("text-body", className)}
          ref={ref}
          {...props}
        />
      </div>
    );
  }
);
DSTimeInput.displayName = "DSTimeInput";

export { DSDateTimeInput, DSDateInput, DSTimeInput };