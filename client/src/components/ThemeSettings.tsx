import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useTheme } from '@/contexts/ThemeContext';
import { Sun, Moon, Monitor } from 'lucide-react';
import { cn } from '@/lib/utils';

export const ThemeSettings: React.FC = () => {
  const { theme, setTheme, resolvedTheme } = useTheme();

  const themes = [
    {
      value: 'light',
      label: 'Light',
      description: 'A bright, clean interface',
      icon: Sun,
    },
    {
      value: 'dark',
      label: 'Dark',
      description: 'Easy on the eyes in low light',
      icon: Moon,
    },
    {
      value: 'system',
      label: 'System',
      description: 'Matches your device settings',
      icon: Monitor,
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Appearance</CardTitle>
        <CardDescription>
          Customize how the application looks on your device
        </CardDescription>
      </CardHeader>
      <CardContent>
        <RadioGroup
          value={theme}
          onValueChange={(value) => setTheme(value as 'light' | 'dark' | 'system')}
          className="grid gap-4 md:grid-cols-3"
        >
          {themes.map((t) => {
            const Icon = t.icon;
            const isSelected = theme === t.value;

            return (
              <Label
                key={t.value}
                htmlFor={t.value}
                className={cn(
                  "flex flex-col items-center gap-3 rounded-lg border-2 p-4 cursor-pointer transition-all hover:bg-accent",
                  isSelected ? "border-primary bg-primary/5" : "border-muted"
                )}
              >
                <RadioGroupItem value={t.value} id={t.value} className="sr-only" />
                <div className={cn(
                  "p-3 rounded-full",
                  isSelected ? "bg-primary text-primary-foreground" : "bg-muted"
                )}>
                  <Icon className="h-6 w-6" />
                </div>
                <div className="text-center">
                  <p className="font-medium">{t.label}</p>
                  <p className="text-xs text-muted-foreground">{t.description}</p>
                </div>
              </Label>
            );
          })}
        </RadioGroup>

        {/* Preview */}
        <div className="mt-6 p-4 rounded-lg border bg-muted/30">
          <p className="text-sm text-muted-foreground mb-2">Current theme:</p>
          <div className="flex items-center gap-2">
            {resolvedTheme === 'dark' ? (
              <Moon className="h-5 w-5 text-primary" />
            ) : (
              <Sun className="h-5 w-5 text-primary" />
            )}
            <span className="font-medium capitalize">{resolvedTheme}</span>
            {theme === 'system' && (
              <span className="text-xs text-muted-foreground">(from system)</span>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};