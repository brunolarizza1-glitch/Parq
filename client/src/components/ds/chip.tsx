import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { X } from "lucide-react";

const chipVariants = cva(
  "inline-flex items-center gap-1 rounded-full text-xs font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        selected: "bg-primary text-primary-foreground hover:bg-primary/90",
        outline: "text-foreground border border-input hover:bg-accent",
      },
      size: {
        sm: "h-7 px-2 text-xs",
        md: "h-8 px-3 text-sm",
        lg: "h-10 px-4 text-sm",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "md",
    },
  }
);

export interface ChipProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof chipVariants> {
  onRemove?: () => void;
  removable?: boolean;
}

const DSChip = React.forwardRef<HTMLDivElement, ChipProps>(
  ({ className, variant, size, onRemove, removable, children, ...props }, ref) => {
    return (
      <div
        className={cn(chipVariants({ variant, size }), className)}
        ref={ref}
        {...props}
      >
        {children}
        {removable && onRemove && (
          <button
            type="button"
            onClick={onRemove}
            className="ml-1 rounded-full hover:bg-black/10 focus:outline-none focus:ring-1 focus:ring-ring p-0.5"
          >
            <X className="h-3 w-3" />
            <span className="sr-only">Remove</span>
          </button>
        )}
      </div>
    );
  }
);
DSChip.displayName = "DSChip";

export { DSChip, chipVariants };