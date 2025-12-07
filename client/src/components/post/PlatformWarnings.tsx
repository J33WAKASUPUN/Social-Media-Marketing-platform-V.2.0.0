import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { AlertTriangle } from 'lucide-react';

interface PlatformWarningsProps {
  warnings: string[];
  onViewAll: () => void;
}

export function PlatformWarnings({ warnings, onViewAll }: PlatformWarningsProps) {
  if (warnings.length === 0) return null;

  return (
    <Alert className="border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/30">
      <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
      <AlertDescription className="text-amber-800 dark:text-amber-200">
        <strong className="text-amber-900 dark:text-amber-100">Platform Limitations</strong>
        <ul className="mt-2 space-y-1 text-sm">
          {warnings.slice(0, 3).map((w, i) => (
            <li key={i} className="text-amber-700 dark:text-amber-300">{w}</li>
          ))}
        </ul>
        {warnings.length > 3 && (
          <Button
            variant="link"
            size="sm"
            className="mt-2 p-0 h-auto text-amber-700 dark:text-amber-300 hover:text-amber-900 dark:hover:text-amber-100"
            onClick={onViewAll}
          >
            View all limitations →
          </Button>
        )}
      </AlertDescription>
    </Alert>
  );
}