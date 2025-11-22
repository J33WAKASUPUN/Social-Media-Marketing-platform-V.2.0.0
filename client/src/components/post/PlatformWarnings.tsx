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
    <Alert variant="destructive">
      <AlertTriangle className="h-4 w-4" />
      <AlertDescription>
        <strong>Platform Limitations</strong>
        <ul className="mt-2 space-y-1 text-sm">
          {warnings.slice(0, 3).map((w, i) => (
            <li key={i}>{w}</li>
          ))}
        </ul>
        {warnings.length > 3 && (
          <Button
            variant="link"
            size="sm"
            className="mt-2 p-0 h-auto"
            onClick={onViewAll}
          >
            View all limitations →
          </Button>
        )}
      </AlertDescription>
    </Alert>
  );
}