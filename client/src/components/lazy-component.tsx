import { useState, useRef, useEffect, lazy, Suspense, ComponentType } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

interface LazyComponentProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  rootMargin?: string;
  threshold?: number;
}

export function LazyComponent({ 
  children, 
  fallback = <Skeleton className="h-96 w-full" />,
  rootMargin = '100px',
  threshold = 0
}: LazyComponentProps) {
  const [isInView, setIsInView] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      {
        rootMargin,
        threshold,
      }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, [rootMargin, threshold]);

  return (
    <div ref={ref}>
      {isInView ? children : fallback}
    </div>
  );
}

// Helper function to create lazy-loaded components
export function createLazyComponent<T extends ComponentType<any>>(
  importFn: () => Promise<{ default: T }>,
  fallback?: React.ReactNode
) {
  const LazyLoadedComponent = lazy(importFn);
  
  return function LazyWrapper(props: React.ComponentProps<T>) {
    return (
      <LazyComponent fallback={fallback}>
        <Suspense fallback={fallback || <Skeleton className="h-96 w-full" />}>
          <LazyLoadedComponent {...props} />
        </Suspense>
      </LazyComponent>
    );
  };
}