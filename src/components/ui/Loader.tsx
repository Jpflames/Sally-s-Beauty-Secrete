
import { cn } from '../../lib/utils';

export function Loader({ className, size = 'md' }: { className?: string, size?: 'sm' | 'md' | 'lg' }) {
  const sizes = {
    sm: 'h-4 w-4 border-2',
    md: 'h-8 w-8 border-3',
    lg: 'h-12 w-12 border-4',
  };

  return (
    <div className={cn("flex justify-center items-center", className)}>
      <div
        className={cn(
          "animate-spin rounded-full border-t-primary border-primary/30",
          sizes[size]
        )}
      />
    </div>
  );
}
