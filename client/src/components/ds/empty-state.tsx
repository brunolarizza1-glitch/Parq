import * as React from "react";
import { cn } from "@/lib/utils";
import { DSH2, DSBody, DSButton } from "@/components/ds";

interface EmptyStateProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  ctaText: string;
  onCtaClick: () => void;
  className?: string;
}

const EmptyState = ({
  icon,
  title,
  description,
  ctaText,
  onCtaClick,
  className
}: EmptyStateProps) => {
  return (
    <div className={cn("flex flex-col items-center justify-center text-center py-12 px-4", className)}>
      <div className="mb-4 text-muted-foreground">
        {icon}
      </div>
      <DSH2 className="mb-2">{title}</DSH2>
      <DSBody className="mb-6 max-w-md text-muted-foreground">
        {description}
      </DSBody>
      <DSButton onClick={onCtaClick} variant="primary">
        {ctaText}
      </DSButton>
    </div>
  );
};

export { EmptyState };