import * as React from "react";
import { cn } from "@/lib/utils";

export interface TypographyProps
  extends React.HTMLAttributes<HTMLHeadingElement | HTMLParagraphElement> {
  as?: "h1" | "h2" | "p" | "span";
}

const DSH1 = React.forwardRef<HTMLHeadingElement, TypographyProps>(
  ({ className, as = "h1", ...props }, ref) => {
    const Comp = as;
    return (
      <Comp
        className={cn("text-h1", className)}
        ref={ref as any}
        {...props}
      />
    );
  }
);
DSH1.displayName = "DSH1";

const DSH2 = React.forwardRef<HTMLHeadingElement, TypographyProps>(
  ({ className, as = "h2", ...props }, ref) => {
    const Comp = as;
    return (
      <Comp
        className={cn("text-h2", className)}
        ref={ref as any}
        {...props}
      />
    );
  }
);
DSH2.displayName = "DSH2";

const DSBody = React.forwardRef<HTMLParagraphElement, TypographyProps>(
  ({ className, as = "p", ...props }, ref) => {
    const Comp = as;
    return (
      <Comp
        className={cn("text-body", className)}
        ref={ref as any}
        {...props}
      />
    );
  }
);
DSBody.displayName = "DSBody";

const DSCaption = React.forwardRef<HTMLParagraphElement, TypographyProps>(
  ({ className, as = "p", ...props }, ref) => {
    const Comp = as;
    return (
      <Comp
        className={cn("text-caption", className)}
        ref={ref as any}
        {...props}
      />
    );
  }
);
DSCaption.displayName = "DSCaption";

export { DSH1, DSH2, DSBody, DSCaption };